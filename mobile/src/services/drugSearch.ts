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
    console.log("[DrugSearch] Raw data:", JSON.stringify(data, null, 2));

    // Data already matches Drug type structure
    return data || [];
  } catch (error) {
    console.error("[DrugSearch] Search failed:", error);
    // Return empty array on error rather than throwing
    return [];
  }
}