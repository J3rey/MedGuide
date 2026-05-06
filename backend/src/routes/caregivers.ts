import { Router, Request, Response } from 'express';
import { supabase } from '../services/supabase';
import {
  getOwnedRecordProfileId,
  requireProfileOwner,
  requireUserId,
} from '../services/profileAccess';

const router = Router();

// Get caregivers for a profile
router.get('/profiles/:profileId/caregivers', async (req: Request, res: Response) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const { profileId } = req.params;
    if (!(await requireProfileOwner(profileId, userId, res))) return;

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
    const userId = requireUserId(req, res);
    if (!userId) return;

    const { profileId } = req.params;
    if (!(await requireProfileOwner(profileId, userId, res))) return;

    const { role, email, permissions } = req.body;

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
    const userId = requireUserId(req, res);
    if (!userId) return;

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
    const userId = requireUserId(req, res);
    if (!userId) return;

    const { id } = req.params;
    const { permissions } = req.body;

    const profileId = await getOwnedRecordProfileId(
      'profile_caregivers',
      id,
      userId
    );
    if (!profileId) {
      return res.status(403).json({ error: 'Caregiver access denied' });
    }

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
    const userId = requireUserId(req, res);
    if (!userId) return;

    const { id } = req.params;

    const profileId = await getOwnedRecordProfileId(
      'profile_caregivers',
      id,
      userId
    );
    if (!profileId) {
      return res.status(403).json({ error: 'Caregiver access denied' });
    }

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
    const userId = requireUserId(req, res);
    if (!userId) return;

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

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const patients = await Promise.all(
      (data || []).map(async (patient: any) => {
        const profileId = patient.profile_id;

        const [{ count: medicationsTotal }, { data: logs }, { count: activeEmergencyCount }, { data: contacts }] =
          await Promise.all([
            supabase
              .from('medications')
              .select('id', { count: 'exact', head: true })
              .eq('profile_id', profileId),
            supabase
              .from('medication_logs')
              .select('status, taken_at, created_at')
              .eq('profile_id', profileId)
              .gte('scheduled_instance_time', todayStart.toISOString())
              .lt('scheduled_instance_time', todayEnd.toISOString()),
            supabase
              .from('emergency_events')
              .select('id', { count: 'exact', head: true })
              .eq('profile_id', profileId)
              .eq('status', 'active'),
            supabase
              .from('emergency_contacts')
              .select('phone')
              .eq('profile_id', profileId)
              .order('priority_order', { ascending: true })
              .limit(1),
          ]);

        const medicationsTaken =
          logs?.filter((log: any) =>
            ['taken', 'taken_late'].includes(log.status)
          ).length || 0;
        const missedCount =
          logs?.filter((log: any) => log.status === 'missed').length || 0;
        const lastLog = logs
          ?.filter((log: any) => log.taken_at || log.created_at)
          .sort((a: any, b: any) =>
            String(b.taken_at || b.created_at).localeCompare(
              String(a.taken_at || a.created_at)
            )
          )[0];

        return {
          ...patient,
          status: {
            medicationsTaken,
            medicationsTotal: medicationsTotal || 0,
            missedCount,
            lastCheckIn: lastLog
              ? new Date(lastLog.taken_at || lastLog.created_at).toLocaleString()
              : 'No logs today',
            hasEmergencyAlert: (activeEmergencyCount || 0) > 0,
            phone: contacts?.[0]?.phone,
          },
        };
      })
    );

    res.json({ patients });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
