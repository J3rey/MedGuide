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

      // First, try to find exact or prefix matches (prioritized)
      const { data: exactMatches, error: exactError } = await supabase
        .from('drugs')
        .select('*')
        .or(`drug_name.ilike.${q}%`)
        .limit(5);

      if (exactError) throw exactError;

      // Then, find partial matches anywhere in the name
      const { data: partialMatches, error: partialError } = await supabase
        .from('drugs')
        .select('*')
        .or(
          `drug_name.ilike.%${q}%,counseling.ilike.%${q}%,indications.ilike.%${q}%`
        )
        .limit(15);

      if (partialError) throw partialError;

      // Combine results, avoiding duplicates
      const exactIds = new Set((exactMatches || []).map((d) => d.id));
      const combined = [
        ...(exactMatches || []),
        ...(partialMatches || []).filter((d) => !exactIds.has(d.id)),
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
