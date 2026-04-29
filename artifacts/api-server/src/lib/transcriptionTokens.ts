import { createHmac, timingSafeEqual } from "crypto";
import { logger } from "./logger";

const TOKEN_TTL_SECONDS = 3600;

interface TranscriptionTokenPayload {
  rcUserId: string;
  iat: number;
  exp: number;
}

const HEX_RE = /^[0-9a-fA-F]{64}$/;

function getSecret(): Buffer {
  const secret = process.env.TRANSCRIPTION_TOKEN_SECRET;
  if (!secret) {
    throw new Error("TRANSCRIPTION_TOKEN_SECRET is not configured");
  }
  if (!HEX_RE.test(secret)) {
    throw new Error(
      "TRANSCRIPTION_TOKEN_SECRET must be a 64-character hex string (32 bytes)"
    );
  }
  return Buffer.from(secret, "hex");
}

export function validateSecretAtStartup(): void {
  getSecret();
}

function b64url(input: string): string {
  return Buffer.from(input).toString("base64url");
}

function fromB64url(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

export function issueTranscriptionToken(rcUserId: string): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: TranscriptionTokenPayload = {
    rcUserId,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  };
  const body = b64url(JSON.stringify(payload));
  const secret = getSecret();
  const sig = createHmac("sha256", secret).update(body).digest("hex");
  return `${body}.${sig}`;
}

export function verifyTranscriptionToken(token: string): TranscriptionTokenPayload | null {
  try {
    const dotIdx = token.lastIndexOf(".");
    if (dotIdx === -1) return null;
    const body = token.slice(0, dotIdx);
    const sig = token.slice(dotIdx + 1);
    const secret = getSecret();
    const expected = createHmac("sha256", secret).update(body).digest("hex");
    const sigBuf = Buffer.from(sig, "hex");
    const expBuf = Buffer.from(expected, "hex");
    if (sigBuf.length !== expBuf.length) return null;
    if (!timingSafeEqual(sigBuf, expBuf)) return null;
    const payload = JSON.parse(fromB64url(body)) as TranscriptionTokenPayload;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) return null;
    if (!payload.rcUserId || typeof payload.rcUserId !== "string") return null;
    return payload;
  } catch (err) {
    logger.warn({ err }, "token verification failed");
    return null;
  }
}

export const TOKEN_TTL_SECONDS_EXPORT = TOKEN_TTL_SECONDS;
