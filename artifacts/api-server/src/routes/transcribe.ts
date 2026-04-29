import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import multer from "multer";
import OpenAI from "openai";
import rateLimit from "express-rate-limit";
import { eq, and, sql } from "drizzle-orm";
import { db, transcriptionQuotaTable } from "@workspace/db";
import { createClient } from "@replit/revenuecat-sdk/client";
import { listCustomerActiveEntitlements } from "@replit/revenuecat-sdk";
import { verifyTranscriptionToken } from "../lib/transcriptionTokens";
import { logger } from "../lib/logger";

const ALLOWED_AUDIO_TYPES = new Set([
  "audio/m4a",
  "audio/mp4",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/wave",
  "audio/webm",
  "audio/ogg",
  "audio/x-m4a",
  "audio/x-wav",
  "audio/aac",
  "audio/flac",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (ALLOWED_AUDIO_TYPES.has(file.mimetype) || file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

const REVENUECAT_API_KEY = process.env.REVENUECAT_API_KEY;
const REVENUECAT_PROJECT_ID = process.env.REVENUECAT_PROJECT_ID;
const FREE_TIER_MONTHLY_LIMIT = 5;
const MAX_CONCURRENT = 5;

let activeConcurrent = 0;

function currentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

async function atomicIncrementAndGetQuota(appUserId: string): Promise<number> {
  const month = currentMonthKey();
  const [row] = await db
    .insert(transcriptionQuotaTable)
    .values({ rcAppUserId: appUserId, monthKey: month, usageCount: 1 })
    .onConflictDoUpdate({
      target: transcriptionQuotaTable.rcAppUserId,
      set: {
        usageCount: sql`CASE WHEN ${transcriptionQuotaTable.monthKey} = ${month} THEN ${transcriptionQuotaTable.usageCount} + 1 ELSE 1 END`,
        monthKey: month,
        updatedAt: new Date(),
      },
    })
    .returning({ usageCount: transcriptionQuotaTable.usageCount });
  return row?.usageCount ?? 1;
}

async function atomicDecrementQuota(appUserId: string): Promise<void> {
  const month = currentMonthKey();
  await db
    .update(transcriptionQuotaTable)
    .set({
      usageCount: sql`GREATEST(${transcriptionQuotaTable.usageCount} - 1, 0)`,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(transcriptionQuotaTable.rcAppUserId, appUserId),
        eq(transcriptionQuotaTable.monthKey, month)
      )
    );
}

async function hasActivePremiumEntitlement(appUserId: string): Promise<boolean> {
  if (!REVENUECAT_API_KEY || !REVENUECAT_PROJECT_ID) {
    return false;
  }
  try {
    const client = createClient({
      baseUrl: "https://api.revenuecat.com/v2",
      headers: {
        Authorization: `Bearer ${REVENUECAT_API_KEY}`,
      },
    });
    const { data, error } = await listCustomerActiveEntitlements({
      client,
      path: {
        project_id: REVENUECAT_PROJECT_ID,
        customer_id: appUserId,
      },
    });
    if (error || !data) return false;
    return data.items.length > 0;
  } catch (err) {
    logger.error({ err }, "RevenueCat entitlement check failed");
    return false;
  }
}

const transcribeLimiterByIp = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});

const transcribeLimiterByUser = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  keyGenerator: (_req: Request, res: Response) => {
    return (res.locals["rcUserId"] as string | undefined) ?? "unknown";
  },
  message: { error: "Too many requests from this account. Please try again later." },
});

function requireTranscriptionToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers["authorization"];
  const raw = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
  if (!raw) {
    res.status(401).json({ error: "Authorization required." });
    return;
  }
  const payload = verifyTranscriptionToken(raw);
  if (!payload) {
    res.status(401).json({ error: "Invalid or expired token. Request a new token." });
    return;
  }
  res.locals["rcUserId"] = payload.rcUserId;
  next();
}

function handleUpload(req: Request, res: Response, next: NextFunction): void {
  upload.single("audio")(req, res, (err) => {
    if (err) {
      res.status(400).json({ error: err.message ?? "Invalid file upload" });
      return;
    }
    next();
  });
}

const router: IRouter = Router();

router.post(
  "/transcribe",
  transcribeLimiterByIp,
  requireTranscriptionToken,
  transcribeLimiterByUser,
  handleUpload,
  async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: "No audio file uploaded" });
      return;
    }

    const appUserId = res.locals["rcUserId"] as string;

    if (activeConcurrent >= MAX_CONCURRENT) {
      res.status(503).json({ error: "Service temporarily busy. Please try again shortly." });
      return;
    }

    const newUsage = await atomicIncrementAndGetQuota(appUserId);
    if (newUsage > FREE_TIER_MONTHLY_LIMIT) {
      const isPremium = await hasActivePremiumEntitlement(appUserId);
      if (!isPremium) {
        await atomicDecrementQuota(appUserId);
        res.status(402).json({
          error: "Monthly free transcription limit reached. Upgrade to Premium for unlimited transcriptions.",
          limitReached: true,
          used: newUsage - 1,
          limit: FREE_TIER_MONTHLY_LIMIT,
        });
        return;
      }
    }

    activeConcurrent++;
    try {
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Transcription failed";
      logger.error({ err }, "transcription failed");
      res.status(500).json({ error: message });
    } finally {
      activeConcurrent--;
    }
  },
);

export default router;
