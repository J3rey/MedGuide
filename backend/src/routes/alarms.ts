import { Router, Request, Response } from 'express';
import { supabase } from '../services/supabase';
import { AlarmUpdateInput } from '../types/alarms';
import { validate } from '../middleware/validation';
import {
  alarmCreateSchema,
  alarmUpdateSchema,
  alarmIdSchema,
} from '../validators/schemas';
import { alarmsLimiter } from '../middleware/rateLimiter';

const router = Router();

// Apply rate limiting to all alarm routes
router.use(alarmsLimiter);

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
    console.error(
      'Error fetching alarms:',
      error instanceof Error ? error.message : error
    );
    res.status(500).json({ error: 'Failed to fetch alarms' });
  }
});

// Create a new alarm
router.post(
  '/alarms',
  validate(alarmCreateSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { medication_name, time, days, enabled, notification_id } =
        req.body;

      const { data, error } = await supabase
        .from('alarms')
        .insert({
          medication_name,
          time,
          days,
          enabled: enabled ?? true,
          notification_id,
          snooze_count: 0,
        })
        .select()
        .single();

      if (error) throw error;

      res.status(201).json(data);
    } catch (error) {
      console.error(
        'Error creating alarm:',
        error instanceof Error ? error.message : error
      );
      res.status(500).json({ error: 'Failed to create alarm' });
    }
  }
);

// Update an alarm
router.put(
  '/alarms/:id',
  validate(alarmUpdateSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { medication_name, time, days, enabled, notification_id } =
        req.body;

      const updateData: Partial<AlarmUpdateInput> = {};
      if (medication_name !== undefined)
        updateData.medication_name = medication_name;
      if (time !== undefined) updateData.time = time;
      if (days !== undefined) updateData.days = days;
      if (enabled !== undefined) updateData.enabled = enabled;
      if (notification_id !== undefined)
        updateData.notification_id = notification_id;

      const { data, error } = await supabase
        .from('alarms')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json(data);
    } catch (error) {
      console.error(
        'Error updating alarm:',
        error instanceof Error ? error.message : error
      );
      res.status(500).json({ error: 'Failed to update alarm' });
    }
  }
);

// Delete an alarm
router.delete(
  '/alarms/:id',
  validate(alarmIdSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const { error } = await supabase.from('alarms').delete().eq('id', id);

      if (error) throw error;

      res.json({ message: 'Alarm deleted successfully' });
    } catch (error) {
      console.error(
        'Error deleting alarm:',
        error instanceof Error ? error.message : error
      );
      res.status(500).json({ error: 'Failed to delete alarm' });
    }
  }
);

// Record alarm snooze
router.post(
  '/alarms/:id/snooze',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // Get current alarm data
      const { data: alarm, error: fetchError } = await supabase
        .from('alarms')
        .select('snooze_count')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Increment snooze count and update timestamp
      const { data, error } = await supabase
        .from('alarms')
        .update({
          snooze_count: (alarm?.snooze_count || 0) + 1,
          last_snoozed: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json(data);
    } catch (error) {
      console.error(
        'Error recording snooze:',
        error instanceof Error ? error.message : error
      );
      res.status(500).json({ error: 'Failed to record snooze' });
    }
  }
);

export default router;
