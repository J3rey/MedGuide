import { Router, Request, Response } from 'express';
import { supabase } from '../services/supabase';

const router = Router();

// ============ Emergency Contacts ============

// Get emergency contacts for a profile
router.get('/profiles/:profileId/emergency-contacts', async (req: Request, res: Response) => {
  try {
    const { profileId } = req.params;

    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('profile_id', profileId)
      .order('priority_order', { ascending: true });

    if (error) throw error;
    res.json({ contacts: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add emergency contact
router.post('/profiles/:profileId/emergency-contacts', async (req: Request, res: Response) => {
  try {
    const { profileId } = req.params;
    const { name, relationship, phone, email, preferred_language, priority_order } = req.body;

    const { data, error } = await supabase
      .from('emergency_contacts')
      .insert({
        profile_id: profileId,
        name,
        relationship,
        phone,
        email,
        preferred_language,
        priority_order: priority_order || 1,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ contact: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete emergency contact
router.delete('/emergency-contacts/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('emergency_contacts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ Emergency Events ============

// Trigger emergency event
router.post('/profiles/:profileId/emergency-events', async (req: Request, res: Response) => {
  try {
    const { profileId } = req.params;
    const userId = req.headers['x-user-id'] as string;
    const { event_type, severity, description } = req.body;

    const { data, error } = await supabase
      .from('emergency_events')
      .insert({
        profile_id: profileId,
        event_type,
        severity: severity || 'high',
        description,
        status: 'active',
        triggered_by_user_id: userId,
      })
      .select()
      .single();

    if (error) throw error;

    // TODO: Send push notifications to caregivers and emergency contacts

    res.status(201).json({ event: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Resolve emergency event
router.post('/emergency-events/:id/resolve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('emergency_events')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ event: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get active emergency events for a profile
router.get('/profiles/:profileId/emergency-events', async (req: Request, res: Response) => {
  try {
    const { profileId } = req.params;

    const { data, error } = await supabase
      .from('emergency_events')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    res.json({ events: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ Pharmacies ============

// Get pharmacies for a profile
router.get('/profiles/:profileId/pharmacies', async (req: Request, res: Response) => {
  try {
    const { profileId } = req.params;

    const { data, error } = await supabase
      .from('pharmacies')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json({ pharmacies: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add pharmacy
router.post('/profiles/:profileId/pharmacies', async (req: Request, res: Response) => {
  try {
    const { profileId } = req.params;
    const { name, phone, address, opening_hours, notes } = req.body;

    const { data, error } = await supabase
      .from('pharmacies')
      .insert({
        profile_id: profileId,
        name,
        phone,
        address,
        opening_hours,
        notes,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ pharmacy: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete pharmacy
router.delete('/pharmacies/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('pharmacies')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
