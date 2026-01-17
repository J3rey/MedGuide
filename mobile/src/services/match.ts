function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
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

export function buildCandidates(ocrText: string): string[] {
  const lines = ocrText
    .split("\n")
    .map((l) => normalize(l))
    .filter(Boolean);

  // Split on spaces AND common separators to catch more individual words
  const allTokens = normalize(ocrText)
    .split(/[\s,;:|/\\]+/) // Split on spaces, commas, semicolons, pipes, slashes
    .filter(Boolean)
    .filter((t) => t.length >= 3); // Filter out very short tokens

  // n-grams (2-4 words) catch multi-word drug names like "panadol osteo"
  const ngrams: string[] = [];
  const maxN = 4;
  for (let i = 0; i < allTokens.length; i++) {
    for (let n = 2; n <= maxN; n++) {
      const slice = allTokens.slice(i, i + n);
      if (slice.length === n) ngrams.push(slice.join(" "));
    }
  }

  // Prioritize: full lines, then n-grams, then individual words
  const candidates = unique([...lines, ...ngrams, ...allTokens])
    .filter((c) => c.length >= 3) // Minimum 3 characters
    .sort((a, b) => b.length - a.length); // Longer matches first

  // Keep it sane (avoid sending too many candidates)
  return candidates.slice(0, 50);
}
