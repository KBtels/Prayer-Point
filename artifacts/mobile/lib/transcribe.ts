import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const AUTH_TOKEN_KEY = "auth_session_token";

function getApiBase(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) {
    const proto = domain.startsWith("localhost") ? "http" : "https";
    return `${proto}://${domain}`;
  }
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return window.location.origin;
  }
  return "http://localhost:8080";
}

async function getAuthSessionToken(): Promise<string | null> {
  return SecureStore.getItemAsync(AUTH_TOKEN_KEY);
}

interface CachedToken {
  token: string;
  expiresAt: number;
}

let cachedTranscriptionToken: CachedToken | null = null;

async function getTranscriptionToken(): Promise<string> {
  const now = Date.now() / 1000;
  const bufferSeconds = 120;

  if (cachedTranscriptionToken && cachedTranscriptionToken.expiresAt - bufferSeconds > now) {
    return cachedTranscriptionToken.token;
  }

  const sessionToken = await getAuthSessionToken();
  if (!sessionToken) {
    throw new Error("UNAUTHENTICATED");
  }

  const base = getApiBase();
  const res = await fetch(`${base}/api/auth/transcription-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionToken}`,
    },
  });

  if (res.status === 401) {
    throw new Error("UNAUTHENTICATED");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? `Failed to get transcription token (${res.status})`);
  }

  const data = (await res.json()) as { token: string; expiresIn: number };
  cachedTranscriptionToken = {
    token: data.token,
    expiresAt: now + data.expiresIn,
  };
  return data.token;
}

export function clearTranscriptionTokenCache(): void {
  cachedTranscriptionToken = null;
}

export async function transcribeAudio(uri: string): Promise<string> {
  const token = await getTranscriptionToken();
  const base = getApiBase();
  const url = `${base}/api/transcribe`;

  const form = new FormData();
  if (Platform.OS === "web") {
    const res = await fetch(uri);
    const blob = await res.blob();
    const ext = blob.type.includes("webm")
      ? "webm"
      : blob.type.includes("mp4")
        ? "m4a"
        : blob.type.includes("wav")
          ? "wav"
          : "webm";
    form.append("audio", blob, `reflection.${ext}`);
  } else {
    const filename = uri.split("/").pop() || "reflection.m4a";
    const ext = filename.split(".").pop()?.toLowerCase() || "m4a";
    const mime =
      ext === "wav"
        ? "audio/wav"
        : ext === "mp3"
          ? "audio/mpeg"
          : ext === "webm"
            ? "audio/webm"
            : "audio/m4a";
    // @ts-expect-error - RN FormData accepts { uri, name, type }
    form.append("audio", { uri, name: filename, type: mime });
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form as any,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    if (res.status === 402 && data?.limitReached) {
      throw new Error("LIMIT_REACHED");
    }
    if (res.status === 401) {
      clearTranscriptionTokenCache();
    }
    const text = await res.text().catch(() => "");
    throw new Error(`Transcribe failed (${res.status}): ${text || res.statusText}`);
  }
  const data = (await res.json()) as { text?: string; error?: string };
  if (data.error) throw new Error(data.error);
  return data.text ?? "";
}
