import { Router, Request, Response } from 'express';
import { supabase } from '../services/supabase';
import { requireUserId } from '../services/profileAccess';

const router = Router();

// Get all profiles for the current user
router.get('/profiles', async (req: Request, res: Response) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('owner_user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json({ profiles: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new profile
router.post('/profiles', async (req: Request, res: Response) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const {
      name,
      relationship,
      date_of_birth,
      preferred_language,
      cultural_notes,
      dietary_notes,
      family_involvement_preference,
      accessibility_settings,
      avatar_color,
    } = req.body;

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        owner_user_id: userId,
        name,
        relationship: relationship || 'self',
        date_of_birth,
        preferred_language: preferred_language || 'en',
        cultural_notes,
        dietary_notes,
        family_involvement_preference,
        accessibility_settings,
        avatar_color: avatar_color || '#364EFF',
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ profile: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update a profile
router.put('/profiles/:id', async (req: Request, res: Response) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;
    const { id } = req.params;

    const updates = req.body;
    delete updates.id;
    delete updates.owner_user_id;
    delete updates.created_at;

    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('owner_user_id', userId)
      .select()
      .single();

    if (error) throw error;
    res.json({ profile: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a profile
router.delete('/profiles/:id', async (req: Request, res: Response) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;
    const { id } = req.params;

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)
      .eq('owner_user_id', userId);

    if (error) throw error;
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
