import { Router, Request, Response } from 'express';
import { supabase } from '../services/supabase';

const router = Router();

// Get all drugs
router.get('/drugs', async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('drugs')
      .select('*')
      .order('drug_name', { ascending: true });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error(
      'Error fetching drugs:',
      error instanceof Error ? error.message : error
    );
    res.status(500).json({ error: 'Failed to fetch drugs' });
  }
});

// Search drugs by name or other fields with fuzzy matching
router.get(
  '/drugs/search',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { q } = req.query;

      if (!q || typeof q !== 'string') {
        res.status(400).json({ error: 'Query parameter "q" is required' });
        return;
      }

      const query = q.trim();
      if (query.length < 2) {
        res.json([]);
        return;
      }

      // Use fuzzy search with trigram similarity (handles typos and OCR errors)
      const { data: fuzzyMatches, error: fuzzyError } = await supabase.rpc(
        'search_drugs_fuzzy',
        {
          search_term: query,
          threshold: 0.2, // Lower threshold for more lenient matching (OCR often has errors)
        }
      );

      if (fuzzyError) {
        console.error('Fuzzy search error:', fuzzyError);
        // Fallback to ILIKE search if fuzzy search fails
        const { data: fallbackMatches, error: fallbackError } = await supabase
          .from('drugs')
          .select('*')
          .or(`drug_name.ilike.%${query}%`)
          .limit(15);

        if (fallbackError) throw fallbackError;
        res.json(fallbackMatches || []);
        return;
      }

      // Also get exact/prefix matches and combine with fuzzy results
      const { data: exactMatches, error: exactError } = await supabase
        .from('drugs')
        .select('*')
        .or(`drug_name.ilike.${query}%`)
        .limit(5);

      if (exactError) {
        // Ignore exact match errors, just use fuzzy results
        res.json((fuzzyMatches || []).slice(0, 15));
        return;
      }

      // Combine and deduplicate: prioritize exact matches, then fuzzy matches
      const exactIds = new Set(
        (exactMatches || []).map((d: { id: number }) => d.id)
      );
      const combined = [
        ...(exactMatches || []),
        ...(fuzzyMatches || []).filter(
          (d: { id: number }) => !exactIds.has(d.id)
        ),
      ].slice(0, 15);

      res.json(combined);
    } catch (error) {
      console.error(
        'Error searching drugs:',
        error instanceof Error ? error.message : error
      );
      res.status(500).json({ error: 'Failed to search drugs' });
    }
  }
);

// Get drug by ID
router.get('/drugs/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('drugs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error(
      'Error fetching drug:',
      error instanceof Error ? error.message : error
    );
    res.status(500).json({ error: 'Failed to fetch drug' });
  }
});

export default router;
