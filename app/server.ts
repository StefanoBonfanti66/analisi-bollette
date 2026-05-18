import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { analyzePdf } from "./src/lib/ai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "20mb" }));

  app.post("/api/analyze", async (req, res) => {
    const { base64Data } = req.body;
    if (!base64Data) return res.status(400).json({ error: "Missing PDF data" });

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
  });

  app.use((err: any, req: any, res: any, next: any) => {
    console.error("Express error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Errore interno del server", code: "INTERNAL_ERROR" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, "0.0.0.0", () => console.log(`Server running on http://localhost:${PORT}`));
}

startServer();
