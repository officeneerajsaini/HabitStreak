import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createHabit as createHabitService,
  deleteHabit as deleteHabitService,
  fetchHabits,
  reorderHabits as reorderHabitsService,
  updateHabit as updateHabitService
} from '../services/habitService';

// Convert to match your component's expected format
export interface HabitForComponent {
  id: string;
  title: string;
  createdAt: string;
  color: string;
}

interface HabitListContextType {
  habits: HabitForComponent[];
  addHabit: (habit: HabitForComponent) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  updateHabit: (id: string, title: string) => Promise<void>;
  reorderHabits: (habits: HabitForComponent[]) => Promise<void>;
  isLoading: boolean;
}

const HabitListContext = createContext<HabitListContextType | undefined>(undefined);

export const useHabitList = () => {
  const context = useContext(HabitListContext);
  if (!context) {
    throw new Error('useHabitList must be used within HabitListProvider');
  }
  return context;
};

export const HabitListProvider = ({ children }: { children: React.ReactNode }) => {
  const [habits, setHabits] = useState<HabitForComponent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load habits on mount
  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      setIsLoading(true);
      const fetchedHabits = await fetchHabits();
      
      // Convert from database format to component format
      const formattedHabits: HabitForComponent[] = fetchedHabits.map(habit => ({
        id: habit.id,
        title: habit.name,
        createdAt: habit.created_at,
        color: habit.color,
      }));
      
      setHabits(formattedHabits);
    } catch (error) {
      console.error('Failed to load habits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addHabit = async (habit: HabitForComponent) => {
    try {
      const newHabit = await createHabitService(habit.title, habit.color);
      
      // Convert to component format
      const formattedHabit: HabitForComponent = {
        id: newHabit.id,
        title: newHabit.name,
        createdAt: newHabit.created_at,
        color: newHabit.color,
      };
      
      setHabits([...habits, formattedHabit]);
    } catch (error) {
      console.error('Failed to add habit:', error);
      throw error;
    }
  };

  const deleteHabit = async (id: string) => {
    try {
      await deleteHabitService(id);
      setHabits(habits.filter(h => h.id !== id));
    } catch (error) {
      console.error('Failed to delete habit:', error);
      throw error;
    }
  };

  const updateHabit = async (id: string, title: string) => {
    try {
      await updateHabitService(id, title);
      setHabits(habits.map(h => h.id === id ? { ...h, title } : h));
    } catch (error) {
      console.error('Failed to update habit:', error);
      throw error;
    }
  };

  const reorderHabits = async (reorderedHabits: HabitForComponent[]) => {
    // Optimistic update
    setHabits(reorderedHabits);
    
    try {
      // Convert to database format for reordering
      const habitsForDb = reorderedHabits.map((h, index) => ({
        id: h.id,
        user_id: '', // Not needed for update
        name: h.title,
        color: h.color,
        display_order: index,
        created_at: h.createdAt,
      }));
      
      await reorderHabitsService(habitsForDb);
    } catch (error) {
      console.error('Failed to reorder habits:', error);
      // Revert on error
      loadHabits();
    }
  };

  return (
    <HabitListContext.Provider
      value={{
        habits,
        addHabit,
        deleteHabit,
        updateHabit,
        reorderHabits,
        isLoading,
      }}
    >
      {children}
    </HabitListContext.Provider>
  );
};