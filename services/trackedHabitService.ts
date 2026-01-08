import { supabase } from '../lib/supabase';

export interface TrackedHabit {
  id: string;
  user_id: string;
  title: string;
  emoji: string;
  color: string;
  display_order: number;
  created_at: string;
}

// Fetch all tracked habits
export const fetchTrackedHabits = async (): Promise<TrackedHabit[]> => {
  const { data, error } = await supabase
    .from('tracked_habits')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching tracked habits:', error);
    throw error;
  }

  return data || [];
};

// Create tracked habit
export const createTrackedHabit = async (
  title: string,
  emoji: string = '📌',
  color: string = '#4CAF50'
): Promise<TrackedHabit> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('User not authenticated');

  const { data: existing } = await supabase
    .from('tracked_habits')
    .select('display_order')
    .order('display_order', { ascending: false })
    .limit(1);

  const maxOrder = existing?.[0]?.display_order || 0;

  const { data, error } = await supabase
    .from('tracked_habits')
    .insert({
      user_id: session.user.id,
      title,
      emoji,
      color,
      display_order: maxOrder + 1,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating tracked habit:', error);
    throw error;
  }

  return data;
};

// Delete tracked habit
export const deleteTrackedHabit = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('tracked_habits')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting tracked habit:', error);
    throw error;
  }
};