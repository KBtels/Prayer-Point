import { Router, type IRouter, type Request, type Response } from "express";
import multer from "multer";
import OpenAI from "openai";
import { logger } from "../lib/logger";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

const router: IRouter = Router();

router.post(
  "/transcribe",
  upload.single("audio"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No audio file uploaded" });
      }

      const filename = req.file.originalname || "audio.m4a";
      const file = await OpenAI.toFile(req.file.buffer, filename, {
        type: req.file.mimetype || "audio/m4a",
      });

      const result = await openai.audio.transcriptions.create({
        file,
        model: "gpt-4o-mini-transcribe",
        response_format: "json",
        prompt:
          "This is a personal spiritual reflection or prayer journal entry. Preserve names, scripture references, and the speaker's voice.",
      });

      res.json({ text: result.text });
    } catch (err: any) {
      logger.error({ err }, "transcription failed");
      res.status(500).json({
        error: err?.message ?? "Transcription failed",
      });
    }
  },
);

export default router;
