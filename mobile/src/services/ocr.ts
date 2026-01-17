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

  console.log("[OCR] Reading image from:", uri);

  const rawBase64 = await FileSystem.readAsStringAsync(uri, {
    encoding: "base64",
  });

  console.log("[OCR] Image read, base64 length:", rawBase64.length);

  const base64 = stripDataUrlPrefix(rawBase64);
  const mimeType = guessMimeType(uri);

  console.log("[OCR] Detected mime type:", mimeType);

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
              "Read all text visible in this image. This may be printed text or handwritten text on medicine labels, packages, or paper. " +
              "Extract and return ONLY the actual text you see - drug names, dosages, or any words. " +
              "Do not add explanations, just the text itself. If handwritten, do your best to read it.",
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
      maxOutputTokens: 1024,
    },
  };

  console.log("[OCR] Sending request to Gemini API...");

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify(payload),
  });

  console.log("[OCR] Response status:", res.status);

  const json = (await res.json()) as GeminiResponse;

  if (!res.ok) {
    console.error("[OCR] API Error:", JSON.stringify(json, null, 2));
    const msg = json?.error?.message ?? `Gemini OCR failed (HTTP ${res.status})`;
    throw new Error(msg);
  }

  console.log("[OCR] Full API response:", JSON.stringify(json, null, 2));

  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  console.log("[OCR] Extracted text:", text);
  
  return text.trim();
}
