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
  // Aggressively extract ALL individual words, strip spaces completely
  const cleaned = ocrText.toLowerCase();
  
  // Split on any non-alphabetic character to get individual words
  const tokens = cleaned
    .split(/[^a-z]+/)
    .filter((t) => t.length >= 3); // Keep words 3+ characters
  
  // Return all unique words with no spaces
  return uniqueStrings(tokens);
}

export async function findDrugMatchesFromImage(
  uri: string
): Promise<{
  ocrText: string;
  candidates: string[];
  matches: Drug[];
}> {
  const ocrText = await extractTextFromImage(uri);

  // 1) Extract ALL individual words first (no spaces) - highest priority
  const individualWords = extractTokenFallbacks(ocrText);

  // 2) Build n-gram candidates from existing logic (for multi-word drugs)
  const rawCandidates = buildCandidates(ocrText);
  const cleanedCandidates = rawCandidates
    .map(normalize)
    .map(c => c.replace(/\s+/g, '')) // Remove all spaces for better matching
    .filter((c: string) => c.length >= 3);

  // 3) Prioritize individual words first, then multi-word candidates
  const allCandidates = uniqueStrings([...individualWords, ...cleanedCandidates]);
  
  // Keep all candidates (no space-based matching issues)
  const candidates = allCandidates.slice(0, 100); // Increased to catch all possibilities

  console.log("OCR TEXT:\n", ocrText);
  console.log("TOTAL CANDIDATES:", candidates.length);
  console.log("TOP 20 CANDIDATES:", candidates.slice(0, 20));

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
