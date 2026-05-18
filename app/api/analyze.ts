import { analyzePdf } from "../src/lib/ai";

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
      code: e?.code || "UNKNOWN_ERROR"
    });
  }
}
