import type { Drug } from "../types/drug";

const MOCK: Drug[] = [
  {
    id: "panadol-rapid",
    brandName: "Panadol Rapid",
    genericName: "Paracetamol",
  },
  {
    id: "paracetamol",
    brandName: "Paracetamol",
    genericName: "Paracetamol",
  },
];

export async function searchDrugs(query: string): Promise<Drug[]> {
  const q = (query ?? "").toLowerCase().trim();
  if (!q) return [];

  return MOCK.filter(
    (d) =>
      d.brandName.toLowerCase().includes(q) ||
      d.genericName.toLowerCase().includes(q)
  );
}