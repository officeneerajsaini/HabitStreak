import {
    DailyEntry,
    Habit,
    MonthlyData,
    getEmptyEntry,
    loadHabits,
    loadMonthlyData,
    saveHabits,
    saveMonthlyData,
} from "@/storage/habitStorage";
import React, { createContext, useContext, useEffect, useState } from "react";

/* ================= TYPES ================= */

type HabitContextType = {
  // Habits
  habits: Habit[];
  addHabit: (habit: Habit) => void;
  deleteHabit: (id: string) => void;
  updateHabit: (id: string, title: string) => void;
  reorderHabits: (habits: Habit[]) => void;
  
  // Tracking Data
  monthlyData: MonthlyData;
  toggleHabitCompletion: (date: string, habitId: string) => void;
  updateNote: (date: string, note: string) => void;
  getProgress: (date: string) => number;
  getDayEntry: (date: string) => DailyEntry;
  
  // Loading State
  isLoading: boolean;
};

/* ================= CONTEXT ================= */

const HabitContext = createContext<HabitContextType | undefined>(undefined);

/* ================= PROVIDER ================= */

export function HabitProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData>({});
  const [isLoading, setIsLoading] = useState(true);

  /* ===== LOAD DATA ON MOUNT ===== */
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [loadedHabits, loadedMonthlyData] = await Promise.all([
          loadHabits(),
          loadMonthlyData(),
        ]);
        setHabits(loadedHabits);
        setMonthlyData(loadedMonthlyData);
      } catch (error) {
        console.error("Error loading data:", error);
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  /* ===== SAVE HABITS ===== */
  useEffect(() => {
    if (!isLoading && habits.length >= 0) {
      saveHabits(habits);
    }
  }, [habits, isLoading]);

  /* ===== SAVE MONTHLY DATA ===== */
  useEffect(() => {
    if (!isLoading) {
      saveMonthlyData(monthlyData);
    }
  }, [monthlyData, isLoading]);

  /* ===== HABIT FUNCTIONS ===== */

  function addHabit(habit: Habit) {
    setHabits((prev) => [...prev, habit]);
  }

  function deleteHabit(id: string) {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    // Also remove from all tracking data
    setMonthlyData((prev) => {
      const updated: MonthlyData = {};
      Object.keys(prev).forEach((dateKey) => {
        updated[dateKey] = {
          ...prev[dateKey],
          completedHabitIds: prev[dateKey].completedHabitIds.filter(
            (hId) => hId !== id
          ),
        };
      });
      return updated;
    });
  }

  function updateHabit(id: string, title: string) {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, title } : h))
    );
  }

  function reorderHabits(newHabits: Habit[]) {
    setHabits(newHabits);
  }

  /* ===== TRACKING FUNCTIONS ===== */

  function toggleHabitCompletion(date: string, habitId: string) {
    setMonthlyData((prev) => {
      const entry = prev[date] || getEmptyEntry();
      const exists = entry.completedHabitIds.includes(habitId);

      return {
        ...prev,
        [date]: {
          ...entry,
          completedHabitIds: exists
            ? entry.completedHabitIds.filter((id) => id !== habitId)
            : [...entry.completedHabitIds, habitId],
        },
      };
    });
  }

  function updateNote(date: string, note: string) {
    setMonthlyData((prev) => {
      const entry = prev[date] || getEmptyEntry();
      return {
        ...prev,
        [date]: {
          ...entry,
          note,
        },
      };
    });
  }

  function getProgress(date: string): number {
    if (habits.length === 0) return 0;
    const entry = monthlyData[date];
    if (!entry) return 0;
    return Math.round((entry.completedHabitIds.length / habits.length) * 100);
  }

  function getDayEntry(date: string): DailyEntry {
    return monthlyData[date] || getEmptyEntry();
  }

  return (
    <HabitContext.Provider
      value={{
        habits,
        addHabit,
        deleteHabit,
        updateHabit,
        reorderHabits,
        monthlyData,
        toggleHabitCompletion,
        updateNote,
        getProgress,
        getDayEntry,
        isLoading,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
}

/* ================= HOOK ================= */

export function useHabits() {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error("useHabits must be used within a HabitProvider");
  }
  return context;
}