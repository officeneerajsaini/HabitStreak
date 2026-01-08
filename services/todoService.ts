import { supabase } from '../lib/supabase';

export type Priority = 'high' | 'medium' | 'low';

export interface Todo {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  date: string;
  created_at: string;
}

// Fetch all todos for today
export const fetchTodosForToday = async (): Promise<Todo[]> => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('date', today)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching todos:', error);
    throw error;
  }

  return data || [];
};

// Create a new todo
export const createTodo = async (
  title: string,
  priority: Priority = 'medium'
): Promise<Todo> => {
  const today = new Date().toISOString().split('T')[0];
  
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('todos')
    .insert({
      user_id: userData.user.id,
      title,
      completed: false,
      priority,
      date: today,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating todo:', error);
    throw error;
  }

  return data;
};

// Toggle todo completion
export const toggleTodo = async (id: string, completed: boolean): Promise<void> => {
  const { error } = await supabase
    .from('todos')
    .update({ completed })
    .eq('id', id);

  if (error) {
    console.error('Error toggling todo:', error);
    throw error;
  }
};

// Delete a todo
export const deleteTodo = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting todo:', error);
    throw error;
  }
};