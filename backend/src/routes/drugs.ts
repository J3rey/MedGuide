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
    console.error('Error fetching drugs:', error instanceof Error ? error.message : error);
    res.status(500).json({ error: 'Failed to fetch drugs' });
  }
});

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
    console.error('Error fetching drug:', error instanceof Error ? error.message : error);
    res.status(500).json({ error: 'Failed to fetch drug' });
  }
});

export default router;
