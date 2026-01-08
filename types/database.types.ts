export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      todos: {
        Row: {
          id: string
          user_id: string
          title: string
          completed: boolean
          priority: string
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          completed?: boolean
          priority?: string
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          completed?: boolean
          priority?: string
          date?: string
          created_at?: string
        }
      }
      habits: {
        Row: {
          id: string
          user_id: string
          name: string
          emoji: string
          color: string
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          emoji?: string
          color?: string
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          emoji?: string
          color?: string
          display_order?: number
          created_at?: string
        }
      }
      tracked_habits: {
        Row: {
          id: string
          user_id: string
          title: string
          emoji: string
          color: string
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          emoji?: string
          color?: string
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          emoji?: string
          color?: string
          display_order?: number
          created_at?: string
        }
      }
      habit_tracking: {
        Row: {
          id: string
          user_id: string
          tracked_habit_id: string
          date: string
          completed: boolean
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tracked_habit_id: string
          date: string
          completed?: boolean
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tracked_habit_id?: string
          date?: string
          completed?: boolean
          note?: string | null
          created_at?: string
        }
      }
    }
  }
}