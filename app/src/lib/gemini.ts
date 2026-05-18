import { AnalysisResult } from "../types";

export async function analyzeBillPdf(base64Data: string): Promise<AnalysisResult> {
  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ base64Data }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const err = new Error(errorData.details || errorData.error || "Errore durante l'analisi della bolletta");
      (err as any).status = response.status;
      (err as any).code = errorData.code;
      throw err;
    }

    return await response.json();
  } catch (error) {
    console.error("Errore client-side durante la chiamata API:", error);
    throw error;
  }
}
