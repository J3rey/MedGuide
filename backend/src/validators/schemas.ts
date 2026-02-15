import { z } from 'zod';

// Chat message validation
export const chatMessageSchema = z.object({
  body: z.object({
    message: z
      .string()
      .min(1, 'Message cannot be empty')
      .max(1000, 'Message too long'),
    language: z.enum(['en', 'es', 'zh', 'ko', 'it']).default('en'),
    medications: z.array(z.string()).optional(),
  }),
});

// Drug search validation
export const drugSearchSchema = z.object({
  query: z.object({
    query: z
      .string()
      .min(1, 'Search query cannot be empty')
      .max(200, 'Query too long'),
  }),
});

// Alarm creation validation
export const alarmCreateSchema = z.object({
  body: z.object({
    medication_name: z.string().min(1, 'Medication name is required').max(100),
    time: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        'Invalid time format (HH:MM)'
      ),
    days: z.array(z.string()).min(1, 'At least one day must be selected'),
    enabled: z.boolean().default(true),
    notification_id: z.string().optional(),
  }),
});

// Alarm update validation
export const alarmUpdateSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid alarm ID format'),
  }),
  body: z.object({
    medication_name: z.string().min(1).max(100).optional(),
    time: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .optional(),
    days: z.array(z.string()).min(1).optional(),
    enabled: z.boolean().optional(),
    notification_id: z.string().optional(),
  }),
});

// Alarm ID validation
export const alarmIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid alarm ID format'),
  }),
});
