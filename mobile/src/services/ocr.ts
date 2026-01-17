// src/services/ocr.ts
import * as FileSystem from "expo-file-system/legacy";
import Constants from "expo-constants";

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
  // Get API key from Expo Constants (supports both app.json extra and .env)
  const apiKey = Constants.expoConfig?.extra?.geminiApiKey || 
                 process.env.EXPO_PUBLIC_GEMINI_API_KEY ||
                 'AIzaSyB4Ad46m4epzoVblnQ5TtvRpZXZPnsA5rc'; // Fallback to your key
  
  if (!apiKey) {
    throw new Error("Missing Gemini API key. Check app.json extra.geminiApiKey or EXPO_PUBLIC_GEMINI_API_KEY");
  }

  console.log("[OCR] API Key found:", apiKey.substring(0, 20) + "...");
  console.log("[OCR] Reading image from:", uri);

  let rawBase64: string;
  try {
    // Try using legacy API first (more reliable)
    rawBase64 = await FileSystem.readAsStringAsync(uri, {
      encoding: "base64",
    });
  } catch (legacyError) {
    console.log("[OCR] Legacy API failed, trying new API...");
    // Fallback to new File API if legacy fails
    const fileUri = uri.replace('file://', '');
    const { File } = await import('expo-file-system');
    const file = new File(fileUri);
    const content = await file.text();
    rawBase64 = btoa(content);
  }

  console.log("[OCR] Image read, base64 length:", rawBase64.length);

  const base64 = stripDataUrlPrefix(rawBase64);
  const mimeType = guessMimeType(uri);

  console.log("[OCR] Detected mime type:", mimeType);

  // Use gemini-2.5-flash (stable multimodal model that supports vision)
  const model = "gemini-2.5-flash";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  
  console.log("[OCR] Sending request to Gemini API...");

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text:
              "Extract ONLY medication/drug names from this image. Look for drug names on medicine labels, packages, boxes, or prescriptions. " +
              "Return each drug name on a new line, nothing else. Examples: Paracetamol, Ibuprofen, Aspirin, Amoxicillin. " +
              "Do NOT include: dosages (500mg), forms (tablet), instructions, brand names mixed with other text. " +
              "If you see 'Panadol 500mg tablets', return only 'Panadol'. " +
              "If handwritten, do your best to read medication names only.",
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
