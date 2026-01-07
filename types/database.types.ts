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
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          completed?: boolean
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          completed?: boolean
          date?: string
          created_at?: string
        }
      }
      habits: {
        Row: {
          id: string
          user_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          created_at?: string
        }
      }
      habit_tracking: {
        Row: {
          id: string
          user_id: string
          habit_id: string
          date: string
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          habit_id: string
          date: string
          completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          habit_id?: string
          date?: string
          completed?: boolean
          created_at?: string
        }
      }
    }
  }
}