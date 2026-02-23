import { Drug } from '../types/drug';
import { extractTextFromImage } from './ocr';
import { buildCandidates } from './match';
import { batchSearchDrugs } from './drugSearch';
import { ocrSimilarity } from '../utils/fuzzyMatch';

interface DrugMatch {
  drug: Drug;
  bestScore: number;  // Best similarity score from any candidate
}

/**
 * Score and prioritize drug matches based on similarity
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
      
      // Combined score: best candidate match + direct match
      const score = match.bestScore * 5 + directScore * 3;
      
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
  const startTime = Date.now();
  
  const ocrText = await extractTextFromImage(uri);
  if (!ocrText || ocrText.trim().length === 0) {
    console.log('[Match] No OCR text extracted');
    return { ocrText: '', candidates: [], matches: [] };
  }

  const candidates = buildCandidates(ocrText);
  console.log(`[Match] Generated ${candidates.length} candidates from OCR text in ${Date.now() - startTime}ms`);
  
  if (candidates.length === 0) {
    console.log('[Match] No valid candidates found');
    return { ocrText, candidates: [], matches: [] };
  }

  // Filter candidates (minimum length check)
  const validCandidates = candidates.filter((c) => c.length >= 3);
  
  if (validCandidates.length === 0) {
    console.log('[Match] No valid candidates after filtering');
    return { ocrText, candidates, matches: [] };
  }

  console.log(`[Match] Searching ${validCandidates.length} candidates using batch API...`);
  const searchStart = Date.now();

  // Use batch search - single API call for all candidates!
  let results: Drug[] = [];
  try {
    results = await batchSearchDrugs(validCandidates);
    console.log(`[Match] Batch search completed in ${Date.now() - searchStart}ms, found ${results.length} drugs`);
  } catch (error) {
    console.error('[Match] Batch search error:', error);
    return { ocrText, candidates, matches: [] };
  }

  // Score each drug match based on similarity to candidates and OCR text
  const drugMatchMap = new Map<number, DrugMatch>();

  for (const drug of results) {
    let bestScore = 0;
    
    // Find best similarity score across all candidates
    for (const candidate of validCandidates) {
      const similarity = ocrSimilarity(candidate, drug.drug_name);
      if (similarity > bestScore) {
        bestScore = similarity;
      }
    }
    
    drugMatchMap.set(drug.id, {
      drug,
      bestScore,
    });
  }

  // Score and sort matches
  const matches = scoreDrugMatches(drugMatchMap, ocrText).slice(0, 15);
  
  const totalTime = Date.now() - startTime;
  console.log(`[Match] Completed in ${totalTime}ms, returning ${matches.length} matches`);
  
  return { ocrText, candidates, matches };
}
