import { supabase } from '../lib/supabase';

export interface HabitTracking {
  id: string;
  user_id: string;
  tracked_habit_id: string;
  date: string;
  completed: boolean;
  note?: string | null;
  created_at: string;
}

// Fetch tracking data
export const fetchTrackingData = async (
  startDate: string,
  endDate: string
): Promise<HabitTracking[]> => {
  const { data, error } = await supabase
    .from('habit_tracking')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching tracking data:', error);
    throw error;
  }

  return data || [];
};

// Toggle completion
export const toggleHabitCompletion = async (
  trackedHabitId: string,
  date: string,
  currentlyCompleted: boolean
): Promise<void> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('User not authenticated');

  if (currentlyCompleted) {
    const { error } = await supabase
      .from('habit_tracking')
      .delete()
      .eq('tracked_habit_id', trackedHabitId)
      .eq('date', date)
      .eq('user_id', session.user.id);

    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('habit_tracking')
      .insert({
        user_id: session.user.id,
        tracked_habit_id: trackedHabitId,
        date,
        completed: true,
      });

    if (error) throw error;
  }
};

// Update note
export const updateDayNote = async (
  trackedHabitId: string,
  date: string,
  note: string
): Promise<void> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('User not authenticated');

  const { data: existing } = await supabase
    .from('habit_tracking')
    .select('id')
    .eq('tracked_habit_id', trackedHabitId)
    .eq('date', date)
    .eq('user_id', session.user.id)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('habit_tracking')
      .update({ note })
      .eq('id', existing.id);

    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('habit_tracking')
      .insert({
        user_id: session.user.id,
        tracked_habit_id: trackedHabitId,
        date,
        completed: false,
        note,
      });

    if (error) throw error;
  }
};