import { Drug } from '../types/drug';
import { extractTextFromImage } from './ocr';
import { buildCandidates } from './match';
import { searchDrugs } from './drugSearch';
import { ocrSimilarity } from '../utils/fuzzyMatch';

interface DrugMatch {
  drug: Drug;
  frequency: number; // How many candidates matched this drug
  bestScore: number; // Best similarity score from any candidate
}

/**
 * Score and prioritize drug matches based on:
 * 1. Frequency (how many different candidates found this drug)
 * 2. Similarity score (best match score)
 */
function scoreDrugMatches(
  drugMatches: Map<number, DrugMatch>,
  ocrText: string
): Drug[] {
  const scored = Array.from(drugMatches.values())
    .map((match) => {
      // Calculate similarity with original OCR text
      const directScore = ocrSimilarity(
        match.drug.drug_name,
        ocrText.toLowerCase()
      );

      // Combined score: frequency + best candidate match + direct match
      const score =
        match.frequency * 10 + // Frequency is most important
        match.bestScore * 5 + // Best candidate match
        directScore * 3; // Direct similarity with OCR text

      return { drug: match.drug, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored.map((s) => s.drug);
}

export async function findDrugMatchesFromImage(uri: string): Promise<{
  ocrText: string;
  candidates: string[];
  matches: Drug[];
}> {
  const ocrText = await extractTextFromImage(uri);
  if (!ocrText || ocrText.trim().length === 0) {
    console.log('[Match] No OCR text extracted');
    return { ocrText: '', candidates: [], matches: [] };
  }

  const candidates = buildCandidates(ocrText);
  console.log(
    `[Match] Generated ${candidates.length} candidates from OCR text`
  );

  if (candidates.length === 0) {
    console.log('[Match] No valid candidates found');
    return { ocrText, candidates: [], matches: [] };
  }

  // Track drug matches with frequency and scores
  const drugMatchMap = new Map<number, DrugMatch>();

  // Query DB using candidates, track frequency and scores
  let queriesCompleted = 0;
  for (const candidate of candidates) {
    // keep queries short to avoid garbage
    if (candidate.length < 3) continue;

    try {
      const results = await searchDrugs(candidate);
      queriesCompleted++;

      if (results.length > 0) {
        console.log(
          `[Match] Candidate "${candidate}" found ${results.length} results`
        );
      }

      // Update frequency and scores for each matched drug
      for (const drug of results) {
        const existing = drugMatchMap.get(drug.id);
        const similarity = ocrSimilarity(candidate, drug.drug_name);

        if (existing) {
          existing.frequency++;
          existing.bestScore = Math.max(existing.bestScore, similarity);
        } else {
          drugMatchMap.set(drug.id, {
            drug,
            frequency: 1,
            bestScore: similarity,
          });
        }
      }
    } catch (error) {
      console.error(`[Match] Error searching for "${candidate}":`, error);
      // ignore per-candidate failures
    }
  }

  console.log(
    `[Match] Completed ${queriesCompleted} queries, found ${drugMatchMap.size} unique drugs`
  );

  // Score and sort matches
  const matches = scoreDrugMatches(drugMatchMap, ocrText).slice(0, 15);

  console.log(`[Match] Returning top ${matches.length} matches`);
  return { ocrText, candidates, matches };
}
