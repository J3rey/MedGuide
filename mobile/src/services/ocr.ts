// src/services/ocr.ts
import * as FileSystem from "expo-file-system";

function guessMimeType(uri: string): string {
  const lower = uri.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  return "image/jpeg";
}

function stripDataUrlPrefix(b64: string): string {
  // If we ever get a data URL (data:image/jpeg;base64,....), remove prefix.
  const idx = b64.indexOf("base64,");
  return idx >= 0 ? b64.slice(idx + "base64,".length) : b64;
}

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
  error?: { message?: string };
};

export async function extractTextFromImage(uri: string): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing EXPO_PUBLIC_GEMINI_API_KEY. Add it to your .env and restart Expo with -c.");
  }

  const rawBase64 = await FileSystem.readAsStringAsync(uri, {
    encoding: "base64",
  });


  const base64 = stripDataUrlPrefix(rawBase64);
  const mimeType = guessMimeType(uri);

  // Use a fast model for OCR-style extraction
  const model = "gemini-1.5-flash"; // reliable default
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text:
              "Extract the text from this medicine label or package. " +
              "Return ONLY the raw text you see (no explanations). Keep line breaks.",
          },
          {
            inlineData: {
              mimeType,
              data: base64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0,
    },
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify(payload),
  });

  const json = (await res.json()) as GeminiResponse;

  if (!res.ok) {
    const msg = json?.error?.message ?? `Gemini OCR failed (HTTP ${res.status})`;
    throw new Error(msg);
  }

  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return text.trim();
}
