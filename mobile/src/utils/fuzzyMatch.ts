/**
 * Fuzzy matching utilities for improving OCR text matching   
 * Helps handle typos, OCR errors, and similar text variations
 */

/**
 * Calculate Levenshtein distance between two strings
 * (minimum number of single-character edits required to change one word into another)
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  const len1 = s1.length;
  const len2 = s2.length;

  // Create a 2D array for dynamic programming
  const dp: number[][] = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0));

  // Initialize first row and column
  for (let i = 0; i <= len1; i++) dp[i][0] = i;
  for (let j = 0; j <= len2; j++) dp[0][j] = j;

  // Fill the dp table
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,     // deletion
          dp[i][j - 1] + 1,     // insertion
          dp[i - 1][j - 1] + 1  // substitution
        );
      }
    }
  }

  return dp[len1][len2];
}

/**
 * Calculate similarity score between two strings (0-1, higher is better)
 * Based on Levenshtein distance normalized by the length of the longer string
 */
export function similarityScore(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  
  const distance = levenshteinDistance(str1, str2);
  const maxLen = Math.max(str1.length, str2.length);
  
  if (maxLen === 0) return 1;
  
  return 1 - distance / maxLen;
}

/**
 * Common OCR character confusions
 * OCR often mistakes these characters for each other
 */
const OCR_SUBSTITUTIONS: Record<string, string[]> = {
  '0': ['o', 'O'],
  'o': ['0', 'O'],
  'O': ['0', 'o'],
  '1': ['i', 'I', 'l', '|'],
  'i': ['1', 'I', 'l', '|'],
  'I': ['1', 'i', 'l', '|'],
  'l': ['1', 'i', 'I', '|'],
  '5': ['s', 'S'],
  's': ['5', 'S'],
  'S': ['5', 's'],
  '8': ['B'],
  'B': ['8'],
  'z': ['2'],
  '2': ['z'],
  'g': ['q', '9'],
  'q': ['g'],
  '6': ['b'],
  'b': ['6'],
};

/**
 * Apply OCR-aware normalization to text
 * Handles common OCR character confusions
 */
export function ocrNormalize(text: string): string {
  let normalized = text.toLowerCase().trim();
  
  // Remove common OCR artifacts
  normalized = normalized
    .replace(/[^\w\s]/g, ' ')  // Replace special characters with spaces
    .replace(/\s+/g, ' ')       // Normalize whitespace
    .trim();
  
  return normalized;
}

/**
 * Calculate OCR-aware similarity between two strings
 * Considers common OCR character confusions
 */
export function ocrSimilarity(str1: string, str2: string): number {
  const norm1 = ocrNormalize(str1);
  const norm2 = ocrNormalize(str2);
  
  // Base similarity
  let score = similarityScore(norm1, norm2);
  
  // Boost score if they're very close with possible OCR substitutions
  if (score > 0.7) {
    // Check if difference could be explained by OCR confusions
    const len = Math.min(norm1.length, norm2.length);
    let confusionMatches = 0;
    
    for (let i = 0; i < len; i++) {
      const c1 = norm1[i];
      const c2 = norm2[i];
      
      if (c1 === c2) {
        confusionMatches++;
      } else if (OCR_SUBSTITUTIONS[c1]?.includes(c2)) {
        confusionMatches += 0.9; // Almost as good as exact match
      }
    }
    
    const confusionScore = confusionMatches / Math.max(norm1.length, norm2.length);
    score = Math.max(score, confusionScore);
  }
  
  return score;
}

/**
 * Find the best matches from a list of candidates
 * @param query The search query
 * @param candidates Array of candidate strings
 * @param threshold Minimum similarity score (0-1)
 * @returns Array of matches sorted by similarity (best first)
 */
export function findBestMatches(
  query: string,
  candidates: string[],
  threshold: number = 0.5
): Array<{ text: string; score: number }> {
  const matches = candidates
    .map((candidate) => ({
      text: candidate,
      score: ocrSimilarity(query, candidate),
    }))
    .filter((match) => match.score >= threshold)
    .sort((a, b) => b.score - a.score);
  
  return matches;
}

/**
 * Check if a query fuzzy-matches any of the candidates
 * @param query The search query
 * @param candidates Array of candidate strings
 * @param threshold Minimum similarity score (0-1)
 * @returns True if at least one candidate matches
 */
export function fuzzyMatches(
  query: string,
  candidates: string[],
  threshold: number = 0.7
): boolean {
  return candidates.some(
    (candidate) => ocrSimilarity(query, candidate) >= threshold
  );
}

/**
 * Get potential variations of a word with common OCR errors
 * Useful for expanding search queries
 */
export function getOcrVariations(word: string): string[] {
  const variations = new Set<string>([word]);
  const normalized = ocrNormalize(word);
  
  // Generate variations by substituting OCR-confusable characters
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    const substitutions = OCR_SUBSTITUTIONS[char];
    
    if (substitutions) {
      for (const sub of substitutions) {
        const variation = normalized.substring(0, i) + sub + normalized.substring(i + 1);
        variations.add(variation);
      }
    }
  }
  
  return Array.from(variations);
}
