import { Router, type IRouter, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import {
  issueTranscriptionToken,
  TOKEN_TTL_SECONDS_EXPORT as TOKEN_TTL_SECONDS,
} from "../lib/transcriptionTokens";

const tokenIssuanceLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many token requests. Please try again later." },
});

const router: IRouter = Router();

router.post(
  "/auth/transcription-token",
  tokenIssuanceLimiter,
  (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      res.status(401).json({ error: "Authentication required." });
      return;
    }
    const replitUserId = req.user.id;
    try {
      const token = issueTranscriptionToken(replitUserId);
      res.json({ token, expiresIn: TOKEN_TTL_SECONDS });
    } catch (err) {
      req.log.error({ err }, "transcription token issuance failed");
      res.status(503).json({ error: "Token service unavailable." });
    }
  },
);

export default router;
