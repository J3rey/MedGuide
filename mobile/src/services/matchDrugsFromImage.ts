import { extractTextFromImage } from "./ocr";
import { searchDrugs } from "./drugSearch";
import type { Drug } from "../types/drug";
import { buildCandidates } from "./match";

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(\d+mg|\d+mcg|\d+g|\d+ml)\b/g, " ")
    .replace(/\b(tablet|tablets|capsule|capsules|oral|solution|suspension|chewable|film|coated)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueStrings(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of items) {
    const v = x.trim();
    if (!v) continue;
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

function uniqueDrugsById(items: Drug[]): Drug[] {
  const seen = new Set<number>();
  const out: Drug[] = [];
  for (const d of items) {
    if (!d?.id) continue;
    if (seen.has(d.id)) continue;
    seen.add(d.id);
    out.push(d);
  }
  return out;
}

function extractTokenFallbacks(ocrText: string): string[] {
  // If OCR contains paracetamol-like tokens inside longer lines, pull them out
  const cleaned = normalize(ocrText);
  const tokens = cleaned.split(" ").filter((t) => t.length >= 4);
  // pick top tokens (you can expand this later)
  return tokens.slice(0, 10);
}

export async function findDrugMatchesFromImage(
  uri: string
): Promise<{
  ocrText: string;
  candidates: string[];
  matches: Drug[];
}> {
  const ocrText = await extractTextFromImage(uri);

  // 1) Build candidates from your existing logic, then normalize/dedupe
  const rawCandidates = buildCandidates(ocrText);
  const cleanedCandidates = rawCandidates.map(normalize).filter((c: string) => c.length >= 3);

  // 2) Add fallback tokens extracted from OCR text itself
  const fallbackTokens = extractTokenFallbacks(ocrText);

  // 3) Combine, dedupe, limit (avoid spamming API)
  const candidates = uniqueStrings([...cleanedCandidates, ...fallbackTokens]).slice(0, 20);

  console.log("OCR TEXT:\n", ocrText);
  console.log("CANDIDATES:", candidates);

  // 4) Query DB using candidates (union results)
  const allResults: Drug[] = [];

  for (const c of candidates) {
    try {
      const results = await searchDrugs(c);
      if (Array.isArray(results) && results.length) {
        allResults.push(...results);
      }
    } catch (e) {
      console.log("searchDrugs failed for candidate:", c, e);
      // ignore per-candidate failures but log for debugging
    }
  }

  const matches = uniqueDrugsById(allResults);

  console.log("MATCHES COUNT:", matches.length);

  return { ocrText, candidates, matches };
}
