export interface Database {
  public: {
    Tables: {
      todos: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          completed: boolean;
          priority: 'high' | 'medium' | 'low';
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          completed?: boolean;
          priority?: 'high' | 'medium' | 'low';
          date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          completed?: boolean;
          priority?: 'high' | 'medium' | 'low';
          date?: string;
          created_at?: string;
        };
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          emoji: string;
          color: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          emoji?: string;
          color?: string;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          emoji?: string;
          color?: string;
          display_order?: number;
          created_at?: string;
        };
      };
      tracked_habits: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          emoji: string;
          color: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          emoji?: string;
          color?: string;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          emoji?: string;
          color?: string;
          display_order?: number;
          created_at?: string;
        };
      };
      habit_tracking: {
        Row: {
          id: string;
          user_id: string;
          tracked_habit_id: string;
          date: string;
          completed: boolean;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tracked_habit_id: string;
          date: string;
          completed?: boolean;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tracked_habit_id?: string;
          date?: string;
          completed?: boolean;
          note?: string | null;
          created_at?: string;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          label: string;
          deadline: string;
          year: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string;
          label?: string;
          deadline?: string;
          year: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          label?: string;
          deadline?: string;
          year?: number;
          created_at?: string;
        };
      };
      milestones: {
        Row: {
          id: string;
          goal_id: string;
          user_id: string;
          month: number;
          title: string;
          description: string;
          completed: boolean;
          notes: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          goal_id: string;
          user_id: string;
          month: number;
          title?: string;
          description?: string;
          completed?: boolean;
          notes?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          goal_id?: string;
          user_id?: string;
          month?: number;
          title?: string;
          description?: string;
          completed?: boolean;
          notes?: string;
          created_at?: string;
        };
      };
      wins_penalties: {
        Row: {
          id: string;
          user_id: string;
          streak: number;
          reward: string;
          date: string;
          notes: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          streak: number;
          reward?: string;
          date?: string;
          notes?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          streak?: number;
          reward?: string;
          date?: string;
          notes?: string;
          created_at?: string;
        };
      };
    };
  };
}