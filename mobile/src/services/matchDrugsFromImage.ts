import { Drug } from "../types/drug";
import { extractTextFromImage } from "./ocr";
import { buildCandidates } from "./match";
import { searchDrugs } from "./drugSearch";

function dedupeById(drugs: Drug[]): Drug[] {
  const seen = new Set<string>();
  return drugs.filter((d) => (seen.has(d.id) ? false : (seen.add(d.id), true)));
}

export async function findDrugMatchesFromImage(uri: string): Promise<{
  ocrText: string;
  candidates: string[];
  matches: Drug[];
}> {
  const ocrText = await extractTextFromImage(uri);
  const candidates = buildCandidates(ocrText);

  // Query DB using candidates, union results
  const allResults: Drug[] = [];
  for (const c of candidates) {
    // keep queries short to avoid garbage
    if (c.length < 2) continue;
    try {
      const results = await searchDrugs(c);
      allResults.push(...results);
    } catch {
      // ignore per-candidate failures
    }
  }

  const matches = dedupeById(allResults).slice(0, 15);
  return { ocrText, candidates, matches };
}
