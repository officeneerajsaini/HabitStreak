import { supabase } from '../lib/supabase';

export interface WinRow {
  id: string;
  user_id?: string;
  streak: number;
  reward: string;
  date: string;
  notes: string;
  created_at?: string;
}

// ==========================================
// WINS & PENALTIES CRUD
// ==========================================

export async function fetchWins(): Promise<WinRow[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('wins_penalties')
    .select('*')
    .eq('user_id', user.id)
    .order('streak', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createWin(streak: number): Promise<WinRow> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('wins_penalties')
    .insert({
      user_id: user.id,
      streak,
      reward: '',
      date: '',
      notes: '',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateWin(
  id: string,
  field: 'reward' | 'date' | 'notes',
  value: string
): Promise<WinRow> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('wins_penalties')
    .update({ [field]: value })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteWin(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('wins_penalties')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
}