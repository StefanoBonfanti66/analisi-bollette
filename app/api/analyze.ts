import { GoogleGenAI, Type } from "@google/genai";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf.mjs";
GlobalWorkerOptions.workerSrc = "";

const PROMPT = `Analizza questa bolletta (Luce o Gas) ed estrai le seguenti informazioni in formato JSON.
Sii estremamente preciso con i numeri.

REGOLE DI ESTRAZIONE:
1. "totalAmount": l'importo totale della bolletta (scadenza).
2. "consumption": il consumo del periodo (non quello annuo stimato).
3. "unitCost": calcola il costo medio della materia energia (o spesa per il gas) dividendo la relativa quota per i consumi.
4. "periodStart" e "periodEnd": le date di inizio e fine del periodo di fatturazione (es. 2024-01-01).
5. "tvLicenseFee": estrai l'importo del canone RAI se presente (solo LUCE). Se non presente, metti 0.

Schema JSON richiesto:
{
  "type": "LUCE" o "GAS",
  "customerName": "Nome e Cognome intestatario",
  "periodStart": "YYYY-MM-DD",
  "periodEnd": "YYYY-MM-DD",
  "totalAmount": numero (euro),
  "consumption": numero (kWh per luce, Smc per gas),
  "provider": "Nome fornitore",
  "tvLicenseFee": numero (0 se assente),
  "details": { "fixedCosts": number, "variableCosts": number, "unitCost": number },
  "tips": ["suggerimento 1", "suggerimento 2", "suggerimento 3"]
}`;

const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash-lite", "gemini-2.0-flash", "gemini-flash-latest"];

async function extractTextFromPdf(base64Data: string): Promise<string> {
  const dataBuffer = new Uint8Array(Buffer.from(base64Data, "base64").buffer);
  const doc = await getDocument({ data: dataBuffer }).promise;
  let text = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(" ") + "\n";
  }
  return text.trim();
}

async function tryGemini(ai: GoogleGenAI, base64Data: string): Promise<any> {
  let lastError: any = null;

  for (const model of GEMINI_MODELS) {
    for (let retry = 0; retry <= 2; retry++) {
      try {
        const res = await ai.models.generateContent({
          model,
          contents: {
            parts: [
              { text: PROMPT },
              { inlineData: { mimeType: "application/pdf", data: base64Data } },
            ],
          },
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              required: ["type", "periodStart", "periodEnd", "totalAmount", "consumption", "provider", "details", "tips"],
              properties: {
                type: { type: Type.STRING, enum: ["LUCE", "GAS"] },
                customerName: { type: Type.STRING },
                periodStart: { type: Type.STRING },
                periodEnd: { type: Type.STRING },
                totalAmount: { type: Type.NUMBER },
                consumption: { type: Type.NUMBER },
                provider: { type: Type.STRING },
                tvLicenseFee: { type: Type.NUMBER },
                details: {
                  type: Type.OBJECT,
                  properties: {
                    fixedCosts: { type: Type.NUMBER },
                    variableCosts: { type: Type.NUMBER },
                    unitCost: { type: Type.NUMBER },
                  },
                  required: ["fixedCosts", "variableCosts", "unitCost"],
                },
                tips: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
            },
          },
        });
        if (!res.text) throw new Error("Risposta vuota da Gemini");
        let parsed: any;
        try {
          parsed = JSON.parse(res.text);
        } catch {
          throw new Error("Risposta Gemini non valida: " + res.text.slice(0, 150));
        }
        return parsed;
      } catch (e: any) {
        const is429 = e?.status === 429 || e?.message?.includes("429") || e?.message?.includes("RESOURCE_EXHAUSTED");
        const is404 = e?.status === 404;
        lastError = e;
        if (is429 && retry < 2) {
          await new Promise((r) => setTimeout(r, 2000 * Math.pow(2, retry)));
          continue;
        }
        if (is404 || is429) break;
      }
    }
  }
  throw lastError;
}

async function tryOpenAICompatible(base64Data: string): Promise<any> {
  const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
  const baseUrl = process.env.GROQ_API_KEY
    ? "https://api.groq.com/openai/v1"
    : process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";

  if (!apiKey) throw new Error("No OpenAI-compatible API key configured (GROQ_API_KEY or OPENAI_API_KEY)");

  const models = process.env.GROQ_API_KEY
    ? ["llama-3.3-70b-versatile", "mixtral-8x7b-32768", "llama-3.1-8b-instant", "gemma2-9b-it"]
    : [process.env.OPENAI_MODEL || "gpt-4o-mini"];

  const pdfText = await extractTextFromPdf(base64Data);
  if (!pdfText) throw new Error("No text could be extracted from PDF");

  const textPrompt = "Estrai i dati di questa bolletta e restituiscili in JSON.\n" + PROMPT + "\n\nTESTO BOLLETTA:\n" + pdfText.slice(0, 15000);

  let lastError: any = null;

  for (const model of models) {
    for (let retry = 0; retry <= 1; retry++) {
      try {
        const res = await fetch(baseUrl + "/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": "Bearer " + apiKey },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: "Sei un assistente che analizza bollette. Rispondi sempre con JSON valido." },
              { role: "user", content: textPrompt },
            ],
            response_format: { type: "json_object" },
            temperature: 0.1,
          }),
        });

        if (!res.ok) {
          const errBody = await res.text();
          throw new Error("API error " + res.status + ": " + errBody);
        }

        const data = await res.json();
        return JSON.parse(data.choices[0].message.content);
      } catch (e: any) {
        lastError = e;
        if (retry < 1) await new Promise((r) => setTimeout(r, 2000));
      }
    }
  }
  throw lastError;
}

async function analyzePdf(base64Data: string): Promise<any> {
  const ai = process.env.GEMINI_API_KEY
    ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, httpOptions: { headers: { "User-Agent": "energia-analytica" } } })
    : null;

  const errors: string[] = [];

  if (ai) {
    try {
      return await tryGemini(ai, base64Data);
    } catch (e: any) {
      const isQuota = e?.status === 429 || e?.message?.includes("429") || e?.message?.includes("RESOURCE_EXHAUSTED");
      errors.push(isQuota ? "Gemini: quota esaurita" : "Gemini: " + (e?.message || e));
    }
  }

  try {
    return await tryOpenAICompatible(base64Data);
  } catch (e: any) {
    errors.push("AI alternativo: " + (e?.message || e));
  }

  const err = new Error("Tutti i provider AI hanno fallito") as any;
  err.details = errors.join(" | ");
  err.code = "ALL_PROVIDERS_FAILED";
  err.status = 429;
  throw err;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { base64Data } = req.body;
  if (!base64Data) {
    return res.status(400).json({ error: "Missing PDF data" });
  }

  try {
    const result = await analyzePdf(base64Data);
    return res.json(result);
  } catch (e: any) {
    return res.status(e?.status || 500).json({
      error: e?.message || "Errore durante l'analisi",
      details: e?.details || "",
      code: e?.code || "UNKNOWN_ERROR",
    });
  }
}
