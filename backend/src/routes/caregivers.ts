import { Router, Request, Response } from 'express';
import { supabase } from '../services/supabase';

const router = Router();

// Get caregivers for a profile
router.get('/profiles/:profileId/caregivers', async (req: Request, res: Response) => {
  try {
    const { profileId } = req.params;

    const { data, error } = await supabase
      .from('profile_caregivers')
      .select('*')
      .eq('profile_id', profileId)
      .is('revoked_at', null)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json({ caregivers: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Invite a caregiver
router.post('/profiles/:profileId/caregivers/invite', async (req: Request, res: Response) => {
  try {
    const { profileId } = req.params;
    const { role, email, phone, permissions } = req.body;

    const inviteCode = 'MG-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const { data, error } = await supabase
      .from('profile_caregivers')
      .insert({
        profile_id: profileId,
        caregiver_email: email,
        role: role || 'caregiver',
        permissions: permissions || {
          view_medication_status: true,
          receive_missed_dose_alerts: true,
          view_visual_schedule: true,
          manage_medications: false,
          manage_emergency_contacts: false,
          trigger_emergency_protocol: false,
        },
        invite_status: 'pending',
        invite_code: inviteCode,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ caregiver: data, invite_code: inviteCode });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Accept caregiver invite
router.post('/caregivers/accept-invite', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { invite_code } = req.body;

    if (!invite_code) {
      return res.status(400).json({ error: 'Invite code required' });
    }

    const { data, error } = await supabase
      .from('profile_caregivers')
      .update({
        caregiver_user_id: userId,
        invite_status: 'accepted',
      })
      .eq('invite_code', invite_code)
      .eq('invite_status', 'pending')
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Invalid or expired invite code' });
    }

    res.json({ caregiver: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update caregiver permissions
router.put('/caregivers/:id/permissions', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;

    const { data, error } = await supabase
      .from('profile_caregivers')
      .update({ permissions })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ caregiver: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Revoke caregiver access
router.post('/caregivers/:id/revoke', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('profile_caregivers')
      .update({
        invite_status: 'revoked',
        revoked_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ caregiver: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get profiles where user is a caregiver (caregiver dashboard)
router.get('/caregivers/my-patients', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;

    const { data, error } = await supabase
      .from('profile_caregivers')
      .select(`
        *,
        profiles:profile_id (
          id, name, relationship, avatar_color
        )
      `)
      .eq('caregiver_user_id', userId)
      .eq('invite_status', 'accepted')
      .is('revoked_at', null);

    if (error) throw error;
    res.json({ patients: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
