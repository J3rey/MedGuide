import { Request, Response } from 'express';
import { supabase } from './supabase';

export const getUserId = (req: Request) => req.headers['x-user-id'] as string;

export const requireUserId = (req: Request, res: Response) => {
  const userId = getUserId(req);

  if (!userId) {
    res.status(401).json({ error: 'User ID required' });
    return null;
  }

  return userId;
};

export const userOwnsProfile = async (profileId: string, userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', profileId)
    .eq('owner_user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
};

export const requireProfileOwner = async (
  profileId: string,
  userId: string,
  res: Response
) => {
  const ownsProfile = await userOwnsProfile(profileId, userId);

  if (!ownsProfile) {
    res.status(403).json({ error: 'Profile access denied' });
    return false;
  }

  return true;
};

export const getOwnedRecordProfileId = async (
  table: string,
  id: string,
  userId: string
) => {
  const { data, error } = await supabase
    .from(table)
    .select('profile_id')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data?.profile_id) return null;

  return (await userOwnsProfile(data.profile_id, userId))
    ? (data.profile_id as string)
    : null;
};
