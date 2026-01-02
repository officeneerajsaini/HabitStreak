// storage/habitStorage.tsx

import AsyncStorage from "@react-native-async-storage/async-storage";

/* ================= TYPES ================= */

export type Habit = {
  id: string;
  title: string;
  color: string;
  createdAt: string;
};

export type DailyEntry = {
  completedHabitIds: string[];
  note: string;
};

export type MonthlyData = {
  [date: string]: DailyEntry;
};

/* ================= STORAGE KEYS ================= */

const HABITS_KEY = "@habits";
const MONTHLY_DATA_KEY = "@monthly_data";

/* ================= HELPERS ================= */

export function getEmptyEntry(): DailyEntry {
  return {
    completedHabitIds: [],
    note: "",
  };
}

/* ================= HABITS ================= */

export async function loadHabits(): Promise<Habit[]> {
  try {
    const json = await AsyncStorage.getItem(HABITS_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error("Error loading habits:", error);
    return [];
  }
}

export async function saveHabits(habits: Habit[]): Promise<void> {
  try {
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  } catch (error) {
    console.error("Error saving habits:", error);
  }
}

/* ================= MONTHLY DATA ================= */

export async function loadMonthlyData(): Promise<MonthlyData> {
  try {
    const json = await AsyncStorage.getItem(MONTHLY_DATA_KEY);
    return json ? JSON.parse(json) : {};
  } catch (error) {
    console.error("Error loading monthly data:", error);
    return {};
  }
}

export async function saveMonthlyData(data: MonthlyData): Promise<void> {
  try {
    await AsyncStorage.setItem(MONTHLY_DATA_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving monthly data:", error);
  }
}