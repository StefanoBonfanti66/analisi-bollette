import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf.mjs";
GlobalWorkerOptions.workerSrc = "";

export async function extractTextFromPdf(base64Data: string): Promise<string> {
  const dataBuffer = new Uint8Array(Buffer.from(base64Data, 'base64').buffer);
  const doc = await getDocument({ data: dataBuffer }).promise;
  let text = '';
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(' ') + '\n';
  }
  return text.trim();
}
