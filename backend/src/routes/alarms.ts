import { Router, Request, Response } from 'express';
import { supabase } from '../services/supabase';

const router = Router();

// Get all alarms
router.get('/alarms', async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('alarms')
      .select('*')
      .order('time', { ascending: true });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching alarms:', error);
    res.status(500).json({ error: 'Failed to fetch alarms' });
  }
});

// Create a new alarm
router.post('/alarms', async (req: Request, res: Response): Promise<void> => {
  try {
    const { medication_name, time, days, enabled, notification_id } = req.body;

    if (!medication_name || !time || !days) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const { data, error } = await supabase
      .from('alarms')
      .insert({
        medication_name,
        time,
        days,
        enabled: enabled ?? true,
        notification_id,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating alarm:', error);
    res.status(500).json({ error: 'Failed to create alarm' });
  }
});

// Update an alarm
router.put('/alarms/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { medication_name, time, days, enabled, notification_id } = req.body;

    const updateData: any = {};
    if (medication_name !== undefined) updateData.medication_name = medication_name;
    if (time !== undefined) updateData.time = time;
    if (days !== undefined) updateData.days = days;
    if (enabled !== undefined) updateData.enabled = enabled;
    if (notification_id !== undefined) updateData.notification_id = notification_id;

    const { data, error } = await supabase
      .from('alarms')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error updating alarm:', error);
    res.status(500).json({ error: 'Failed to update alarm' });
  }
});

// Delete an alarm
router.delete('/alarms/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('alarms')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Alarm deleted successfully' });
  } catch (error) {
    console.error('Error deleting alarm:', error);
    res.status(500).json({ error: 'Failed to delete alarm' });
  }
});

export default router;
