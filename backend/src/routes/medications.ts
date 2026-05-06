import { Router, Request, Response } from 'express';
import { supabase } from '../services/supabase';

const router = Router();

// ============ Medications ============

// Get medications for a profile
router.get('/profiles/:profileId/medications', async (req: Request, res: Response) => {
  try {
    const { profileId } = req.params;

    const { data, error } = await supabase
      .from('medications')
      .select(`
        *,
        medication_schedules (*)
      `)
      .eq('profile_id', profileId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json({ medications: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add medication
router.post('/profiles/:profileId/medications', async (req: Request, res: Response) => {
  try {
    const { profileId } = req.params;
    const { custom_name, dose, instructions, notes, drug_id, color, icon } = req.body;

    const { data, error } = await supabase
      .from('medications')
      .insert({
        profile_id: profileId,
        custom_name,
        dose,
        instructions,
        notes,
        drug_id,
        color,
        icon,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ medication: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update medication
router.put('/medications/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    delete updates.id;
    delete updates.profile_id;
    delete updates.created_at;

    const { data, error } = await supabase
      .from('medications')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ medication: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete medication
router.delete('/medications/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('medications')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ Medication Schedules ============

// Add schedule to a medication
router.post('/medications/:medicationId/schedules', async (req: Request, res: Response) => {
  try {
    const { medicationId } = req.params;
    const { profile_id, scheduled_time, days, recurrence_rule, reminder_enabled, escalation_threshold_minutes } = req.body;

    const { data, error } = await supabase
      .from('medication_schedules')
      .insert({
        medication_id: medicationId,
        profile_id,
        scheduled_time,
        days: days || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
        recurrence_rule: recurrence_rule || 'daily',
        reminder_enabled: reminder_enabled !== false,
        escalation_threshold_minutes: escalation_threshold_minutes || 30,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ schedule: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete schedule
router.delete('/schedules/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('medication_schedules')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ Medication Logs ============

// Log medication action (taken, skipped, missed)
router.post('/medication-logs', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { medication_id, profile_id, scheduled_instance_time, status, skipped_reason, notes } = req.body;

    const logData: any = {
      medication_id,
      profile_id,
      scheduled_instance_time,
      status,
      logged_by_user_id: userId,
    };

    if (status === 'taken' || status === 'taken_late') {
      logData.taken_at = new Date().toISOString();
    }
    if (skipped_reason) logData.skipped_reason = skipped_reason;
    if (notes) logData.notes = notes;

    const { data, error } = await supabase
      .from('medication_logs')
      .insert(logData)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ log: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get today's medication logs for a profile
router.get('/profiles/:profileId/medication-logs/today', async (req: Request, res: Response) => {
  try {
    const { profileId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data, error } = await supabase
      .from('medication_logs')
      .select(`
        *,
        medications:medication_id (custom_name, dose, color, icon)
      `)
      .eq('profile_id', profileId)
      .gte('scheduled_instance_time', today.toISOString())
      .lt('scheduled_instance_time', tomorrow.toISOString())
      .order('scheduled_instance_time', { ascending: true });

    if (error) throw error;
    res.json({ logs: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
