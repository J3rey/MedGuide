// src/services/ocr.ts
import Constants from "expo-constants";

function guessMimeType(uri: string): string {
  const lower = uri.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  return "image/jpeg";
}

/**
 * Extract text from image using the secure backend API.
 * This keeps API keys on the server and prevents exposure.
 */
export async function extractTextFromImage(uri: string): Promise<string> {
  const backendUrl = Constants.expoConfig?.extra?.backendUrl || 
                     process.env.EXPO_PUBLIC_BACKEND_URL ||
                     'http://localhost:3000';
  
  console.log("[OCR] Sending image to backend:", backendUrl);
  console.log("[OCR] Image URI:", uri);

  try {
    // Create FormData and append the image
    const formData = new FormData();
    
    const mimeType = guessMimeType(uri);
    const filename = uri.split('/').pop() || 'image.jpg';
    
    // @ts-ignore - React Native FormData supports this
    formData.append('image', {
      uri,
      type: mimeType,
      name: filename,
    });

    console.log("[OCR] Sending request to backend API...");

    const res = await fetch(`${backendUrl}/api/ocr`, {
      method: "POST",
      body: formData,
      // Don't set Content-Type - browser will set it with boundary for multipart
    });

    console.log("[OCR] Response status:", res.status);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
      console.error("[OCR] Backend error:", errorData);
      throw new Error(errorData.message || errorData.error || `OCR failed (HTTP ${res.status})`);
    }

    const json = await res.json();
    console.log("[OCR] Backend response:", json);

    if (!json.success || !json.text) {
      throw new Error("Invalid response from backend");
    }

    return json.text;
    
  } catch (error: any) {
    console.error("[OCR] Error:", error);
    throw new Error(`OCR failed: ${error.message}`);
  }
}
