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

  // tokens from all text
  const allTokens = normalize(ocrText).split(" ").filter(Boolean);

  // n-grams (2-4 words) catch multi-word drug names like "panadol osteo"
  const ngrams: string[] = [];
  const maxN = 4;
  for (let i = 0; i < allTokens.length; i++) {
    for (let n = 2; n <= maxN; n++) {
      const slice = allTokens.slice(i, i + n);
      if (slice.length === n) ngrams.push(slice.join(" "));
    }
  }

  // include single tokens too (catch "paracetamol")
  const singles = allTokens;

  // prioritize longer phrases first (often more specific)
  const candidates = unique([...lines, ...ngrams, ...singles])
    .filter((c) => c.length >= 2)
    .sort((a, b) => b.length - a.length);

  // Keep it sane (avoid sending 500 candidates)
  return candidates.slice(0, 40);
}
