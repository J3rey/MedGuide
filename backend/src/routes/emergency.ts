import { Router, Request, Response } from 'express';
import { supabase } from '../services/supabase';
import {
  getOwnedRecordProfileId,
  requireProfileOwner,
  requireUserId,
} from '../services/profileAccess';

const router = Router();

// ============ Emergency Contacts ============

// Get emergency contacts for a profile
router.get(
  '/profiles/:profileId/emergency-contacts',
  async (req: Request, res: Response) => {
    try {
      const userId = requireUserId(req, res);
      if (!userId) return;

      const { profileId } = req.params;
      if (!(await requireProfileOwner(profileId, userId, res))) return;

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
  }
);

// Add emergency contact
router.post(
  '/profiles/:profileId/emergency-contacts',
  async (req: Request, res: Response) => {
    try {
      const userId = requireUserId(req, res);
      if (!userId) return;

      const { profileId } = req.params;
      if (!(await requireProfileOwner(profileId, userId, res))) return;

      const {
        name,
        relationship,
        phone,
        email,
        preferred_language,
        priority_order,
      } = req.body;

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
  }
);

// Delete emergency contact
router.delete(
  '/emergency-contacts/:id',
  async (req: Request, res: Response) => {
    try {
      const userId = requireUserId(req, res);
      if (!userId) return;

      const { id } = req.params;
      const profileId = await getOwnedRecordProfileId(
        'emergency_contacts',
        id,
        userId
      );
      if (!profileId) {
        return res
          .status(403)
          .json({ error: 'Emergency contact access denied' });
      }

      const { error } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ============ Emergency Events ============

// Trigger emergency event
router.post(
  '/profiles/:profileId/emergency-events',
  async (req: Request, res: Response) => {
    try {
      const userId = requireUserId(req, res);
      if (!userId) return;

      const { profileId } = req.params;
      if (!(await requireProfileOwner(profileId, userId, res))) return;

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
  }
);

// Resolve emergency event
router.post(
  '/emergency-events/:id/resolve',
  async (req: Request, res: Response) => {
    try {
      const userId = requireUserId(req, res);
      if (!userId) return;

      const { id } = req.params;
      const profileId = await getOwnedRecordProfileId(
        'emergency_events',
        id,
        userId
      );
      if (!profileId) {
        return res.status(403).json({ error: 'Emergency event access denied' });
      }

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
  }
);

// Get active emergency events for a profile
router.get(
  '/profiles/:profileId/emergency-events',
  async (req: Request, res: Response) => {
    try {
      const userId = requireUserId(req, res);
      if (!userId) return;

      const { profileId } = req.params;
      if (!(await requireProfileOwner(profileId, userId, res))) return;

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
  }
);

// ============ Pharmacies ============

// Get pharmacies for a profile
router.get(
  '/profiles/:profileId/pharmacies',
  async (req: Request, res: Response) => {
    try {
      const userId = requireUserId(req, res);
      if (!userId) return;

      const { profileId } = req.params;
      if (!(await requireProfileOwner(profileId, userId, res))) return;

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
  }
);

// Add pharmacy
router.post(
  '/profiles/:profileId/pharmacies',
  async (req: Request, res: Response) => {
    try {
      const userId = requireUserId(req, res);
      if (!userId) return;

      const { profileId } = req.params;
      if (!(await requireProfileOwner(profileId, userId, res))) return;

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
  }
);

// Delete pharmacy
router.delete('/pharmacies/:id', async (req: Request, res: Response) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const { id } = req.params;
    const profileId = await getOwnedRecordProfileId('pharmacies', id, userId);
    if (!profileId) {
      return res.status(403).json({ error: 'Pharmacy access denied' });
    }

    const { error } = await supabase.from('pharmacies').delete().eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
