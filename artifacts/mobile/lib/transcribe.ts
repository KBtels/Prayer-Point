import { Platform } from "react-native";

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

export async function transcribeAudio(uri: string): Promise<string> {
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
    body: form as any,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Transcribe failed (${res.status}): ${text || res.statusText}`);
  }
  const data = (await res.json()) as { text?: string; error?: string };
  if (data.error) throw new Error(data.error);
  return data.text ?? "";
}
