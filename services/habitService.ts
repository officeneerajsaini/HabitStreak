import { supabase } from '../lib/supabase';

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  color: string;
  display_order: number;
  created_at: string;
}

// Fetch all habits for current user
export const fetchHabits = async (): Promise<Habit[]> => {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching habits:', error);
    throw error;
  }

  return data || [];
};

// Create a new habit
export const createHabit = async (
    name: string,
    color: string = '#FF6B6B'
  ): Promise<Habit> => {
    // Get current session (more reliable than getUser)
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('No session found');
      throw new Error('User not authenticated');
    }
  
    // Get current max order
    const { data: existingHabits } = await supabase
      .from('habits')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1);
  
    const maxOrder = existingHabits?.[0]?.display_order || 0;
  
    const { data, error } = await supabase
      .from('habits')
      .insert({
        user_id: session.user.id, // Use session.user instead
        name,
        color,
        display_order: maxOrder + 1,
      })
      .select()
      .single();
  
    if (error) {
      console.error('Error creating habit:', error);
      throw error;
    }
  
    return data;
  };

// Update habit name
export const updateHabit = async (id: string, name: string): Promise<void> => {
  const { error } = await supabase
    .from('habits')
    .update({ name })
    .eq('id', id);

  if (error) {
    console.error('Error updating habit:', error);
    throw error;
  }
};

// Delete a habit
export const deleteHabit = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting habit:', error);
    throw error;
  }
};

// Reorder habits
export const reorderHabits = async (habits: Habit[]): Promise<void> => {
  // Update display_order for each habit
  const updates = habits.map((habit, index) => ({
    id: habit.id,
    display_order: index,
  }));

  for (const update of updates) {
    const { error } = await supabase
      .from('habits')
      .update({ display_order: update.display_order })
      .eq('id', update.id);

    if (error) {
      console.error('Error reordering habit:', error);
      throw error;
    }
  }
};