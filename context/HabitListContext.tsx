// context/HabitListContext.tsx

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

/* ================= TYPES ================= */

export type HabitItem = {
  id: string;
  title: string;
  color: string;
  createdAt: string;
};

/* ================= CONTEXT TYPE ================= */

type HabitListContextType = {
  habits: HabitItem[];
  addHabit: (habit: HabitItem) => void;
  deleteHabit: (id: string) => void;
  updateHabit: (id: string, title: string) => void;
  reorderHabits: (habits: HabitItem[]) => void;
  isLoading: boolean;
};

/* ================= CONTEXT ================= */

const HabitListContext = createContext<HabitListContextType | undefined>(undefined);

const HABITS_STORAGE_KEY = "@habit_list";

/* ================= PROVIDER ================= */

export function HabitListProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabits] = useState<HabitItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /* ===== LOAD DATA ===== */
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const json = await AsyncStorage.getItem(HABITS_STORAGE_KEY);
        if (json) {
          setHabits(JSON.parse(json));
        }
      } catch (error) {
        console.error("Error loading habit list:", error);
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  /* ===== SAVE DATA ===== */
  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
    }
  }, [habits, isLoading]);

  /* ===== FUNCTIONS ===== */

  function addHabit(habit: HabitItem) {
    setHabits((prev) => [...prev, habit]);
  }

  function deleteHabit(id: string) {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }

  function updateHabit(id: string, title: string) {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, title } : h))
    );
  }

  function reorderHabits(newHabits: HabitItem[]) {
    setHabits(newHabits);
  }

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
}

/* ================= HOOK ================= */

export function useHabitList() {
  const context = useContext(HabitListContext);
  if (!context) {
    throw new Error("useHabitList must be used within a HabitListProvider");
  }
  return context;
}