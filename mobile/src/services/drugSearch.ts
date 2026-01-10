import { Drug } from "../types/drug";

const API_BASE = "https://YOUR_API_HERE"; // change this

export async function searchDrugs(query: string): Promise<Drug[]> {
  const url = `${API_BASE}/drugs/search?q=${encodeURIComponent(query)}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Drug search failed: ${res.status}`);
  }
  return (await res.json()) as Drug[];
}
