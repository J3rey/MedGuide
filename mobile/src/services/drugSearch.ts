import type { Drug } from "../types/drug";
import { supabase } from "./supabase";

export async function searchDrugs(query: string): Promise<Drug[]> {
  const q = (query ?? "").toLowerCase().trim();
  if (!q) return [];

  console.log("[DrugSearch] Searching for:", q);

  try {
    // Search in Supabase database
    // Searches both brand_name and generic_name columns using ILIKE (case-insensitive)
    const { data, error } = await supabase
      .from("medications")
      .select("*")
      .or(`brand_name.ilike.%${q}%,generic_name.ilike.%${q}%`);

    if (error) {
      console.error("[DrugSearch] Supabase error:", error);
      throw error;
    }

    console.log("[DrugSearch] Found", data?.length ?? 0, "results");

    // Map Supabase columns to Drug type
    const drugs: Drug[] = (data || []).map((row) => ({
      id: row.id,
      brandName: row.brand_name,
      genericName: row.generic_name,
      precautions: row.precautions,
      adverseEffects: row.adverse_effects,
      counselling: row.counselling,
    }));

    return drugs;
  } catch (error) {
    console.error("[DrugSearch] Search failed:", error);
    // Return empty array on error rather than throwing
    return [];
  }
}