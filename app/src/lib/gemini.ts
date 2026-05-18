import { AnalysisResult } from "../types";

export async function analyzeBillPdf(base64Data: string): Promise<AnalysisResult> {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ base64Data }),
  });

  const text = await response.text();

  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Risposta server non valida: ${text.slice(0, 200)}`);
  }

  if (!response.ok) {
    const err = new Error(data.details || data.error || `Errore server (${response.status})`);
    (err as any).status = response.status;
    (err as any).code = data.code;
    throw err;
  }

  return data as AnalysisResult;
}
