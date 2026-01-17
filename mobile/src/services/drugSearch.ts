import type { Drug } from "../types/drug";
import { supabase } from "./supabase";

export async function searchDrugs(query: string): Promise<Drug[]> {
  const q = (query ?? "").toLowerCase().trim();
  if (!q) return [];

  console.log("[DrugSearch] Searching for:", q);

  try {
    // Search in Supabase database - table name is "drugs" (lowercase)
    // Search in drug_name column using ILIKE (case-insensitive)
    const { data, error } = await supabase
      .from("drugs")
      .select("*")
      .ilike("drug_name", `%${q}%`);

    if (error) {
      console.error("[DrugSearch] Supabase error:", error);
      throw error;
    }

    console.log("[DrugSearch] Found", data?.length ?? 0, "results");

    return data || [];
  } catch (error) {
    console.error("[DrugSearch] Search failed:", error);
    return [];
  }
}

// Batch search for multiple candidates - much faster than sequential queries
// Now with fuzzy matching support
export async function batchSearchDrugs(candidates: string[]): Promise<Drug[]> {
  if (!candidates || candidates.length === 0) return [];

  console.log("[DrugSearch] Batch searching for", candidates.length, "candidates");

  try {
    // Build OR conditions for all candidates with fuzzy matching
    // Using both ILIKE for exact substring matches and similarity for fuzzy matches
    const orConditions = candidates
      .filter(c => c && c.length >= 3)
      .map(c => `drug_name.ilike.%${c}%`)
      .join(',');

    if (!orConditions) return [];

    // First try exact/substring matches
    const { data: exactMatches, error: exactError } = await supabase
      .from("drugs")
      .select("*")
      .or(orConditions);

    if (exactError) {
      console.error("[DrugSearch] Exact search error:", exactError);
    }

    // Then try fuzzy matches for typos (similarity > 0.3 means at least 30% similar)
    // Build separate queries for each candidate with similarity
    const fuzzyPromises = candidates
      .filter(c => c && c.length >= 3)
      .map(async (c) => {
        const { data } = await supabase
          .rpc('search_drugs_fuzzy', { search_term: c, threshold: 0.3 })
          .limit(5);
        return data || [];
      });

    let fuzzyMatches: any[] = [];
    try {
      const fuzzyResults = await Promise.all(fuzzyPromises);
      fuzzyMatches = fuzzyResults.flat();
    } catch (fuzzyError) {
      console.log("[DrugSearch] Fuzzy search not available (requires pg_trgm)");
      // Fuzzy search is optional, continue with exact matches
    }

    // Combine and deduplicate results
    const allMatches = [...(exactMatches || []), ...fuzzyMatches];
    const uniqueData = allMatches.filter((drug, index, self) =>
      index === self.findIndex(d => d.id === drug.id)
    );

    console.log("[DrugSearch] Found", exactMatches?.length || 0, "exact +", fuzzyMatches.length, "fuzzy matches");

    return uniqueData || [];
  } catch (error) {
    console.error("[DrugSearch] Batch search failed:", error);
    return [];
  }
}