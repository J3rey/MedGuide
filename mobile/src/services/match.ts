import { ocrNormalize, getOcrVariations } from '../utils/fuzzyMatch';

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function unique(arr: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of arr) {
    if (!seen.has(x)) {
      seen.add(x);
      out.push(x);
    }
  }
  return out;
}

/**
 * Check if a token looks like it could be a drug name
 * Filters out common OCR noise and non-drug words
 */
function likelyDrugName(token: string): boolean {
  // Filter out very short tokens (less likely to be drug names)
  if (token.length < 4) return false;
  
  // Filter out very long tokens that are likely garbage OCR
  if (token.length > 25) return false;

  // Filter out common words that often appear in medication packaging
  const commonWords = new Set([
    'the',
    'and',
    'for',
    'with',
    'use',
    'mg',
    'mcg',
    'ml',
    'tablet',
    'tablets',
    'capsule',
    'capsules',
    'oral',
    'daily',
    'take',
    'not',
    'instructions',
    'warnings',
    'caution',
    'keep',
    'out',
    'reach',
    'children',
    'store',
    'room',
    'temperature',
    'expiry',
    'date',
    'batch',
    'lot',
    'manufactured',
    'mfg',
    'exp',
    'net',
    'wt',
    'weight',
    'contents',
    'contains',
    'active',
    'inactive',
    'ingredients',
    'directions',
    'dosage',
  ]);

  if (commonWords.has(token)) return false;

  // Filter out tokens that are just numbers or look like dates
  if (/^\d+$/.test(token)) return false;
  if (/^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/.test(token)) return false;

  // Drug names typically have at least one vowel
  if (!/[aeiouy]/i.test(token)) return false;

  return true;
}

/**
 * Score a candidate by its likelihood of being a drug name
 * Higher scores = more likely to be a drug name
 */
function scoreCandidateQuality(candidate: string): number {
  let score = 0;

  // Longer candidates (up to a point) are often more specific drug names
  const words = candidate.split(' ');
  if (words.length === 1 && candidate.length >= 6) score += 2;
  if (words.length === 2) score += 3;
  if (words.length === 3) score += 2;

  // Candidates with common drug suffixes/patterns
  const drugPatterns = [
    /ol$/i, // -ol (e.g., paracetamol, atenolol)
    /ine$/i, // -ine (e.g., morphine, codeine)
    /cin$/i, // -cin (e.g., penicillin)
    /mycin$/i, // -mycin (antibiotics)
    /cillin$/i, // -cillin (e.g., amoxicillin)
    /prazole$/i, // -prazole (e.g., omeprazole)
    /statin$/i, // -statin (e.g., atorvastatin)
    /pril$/i, // -pril (e.g., lisinopril)
    /zosin$/i, // -zosin (e.g., doxazosin)
    /azole$/i, // -azole (e.g., fluconazole)
  ];

  for (const pattern of drugPatterns) {
    if (pattern.test(candidate)) {
      score += 4;
      break;
    }
  }

  // Check if all words pass drug name filter
  const allWordsValid = words.every(likelyDrugName);
  if (allWordsValid) score += 1;

  return score;
}

export function buildCandidates(ocrText: string): string[] {
  const lines = ocrText
    .split('\n')
    .map((l) => normalize(l))
    .filter(Boolean);

  // tokens from all text using OCR-aware normalization
  const allTokens = ocrNormalize(ocrText).split(' ').filter(Boolean);

  // Filter tokens to focus on potential drug names
  const drugLikeTokens = allTokens.filter(likelyDrugName);

  // n-grams (2-4 words) catch multi-word drug names
  const ngrams: string[] = [];
  const maxN = 4;
  for (let i = 0; i < drugLikeTokens.length; i++) {
    for (let n = 2; n <= maxN; n++) {
      const slice = drugLikeTokens.slice(i, i + n);
      if (slice.length === n) {
        ngrams.push(slice.join(' '));
      }
    }
  }

  // Include lines that look like drug names
  const drugLikeLines = lines.filter((line) => {
    const words = line.split(' ');
    return words.length <= 3 && words.some(likelyDrugName);
  });

  // Combine all candidates
  const allCandidates = unique([
    ...drugLikeLines,
    ...ngrams,
    ...drugLikeTokens,
  ]).filter((c) => c.length >= 3);

  // Score and sort candidates by quality
  const scoredCandidates = allCandidates
    .map((candidate) => ({
      text: candidate,
      score: scoreCandidateQuality(candidate),
    }))
    .sort((a, b) => {
      // Sort by score first, then by length (longer = more specific)
      if (b.score !== a.score) return b.score - a.score;
      return b.text.length - a.text.length;
    });

  // Get top candidates and expand with OCR variations for the best ones
  const topCandidates = scoredCandidates.slice(0, 15).map((c) => c.text);

  // For the top 5 candidates, add OCR variations to catch common errors
  const withVariations: string[] = [...topCandidates];
  for (let i = 0; i < Math.min(5, topCandidates.length); i++) {
    const variations = getOcrVariations(topCandidates[i]);
    withVariations.push(...variations);
  }

  // Deduplicate and return top 20 candidates (reduced to avoid rate limits)
  return unique(withVariations).slice(0, 20);
}
