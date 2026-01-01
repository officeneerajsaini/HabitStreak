import AsyncStorage from "@react-native-async-storage/async-storage";

/* ================= KEYS ================= */

const HABIT_KEY = "HABITS_V1";
const MONTHLY_DATA_KEY = "MONTHLY_TRACKING_V1";

/* ================= TYPES ================= */

export type Habit = {
  id: string;
  title: string;
  createdAt: number;
  color: string;
};

export type DailyEntry = {
  completedHabitIds: string[];
  note: string;
};

export type MonthlyData = {
  [date: string]: DailyEntry;
};

/* ================= HABITS ================= */

export async function loadHabits(): Promise<Habit[]> {
  try {
    const data = await AsyncStorage.getItem(HABIT_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load habits:", error);
    return [];
  }
}

export async function saveHabits(habits: Habit[]): Promise<void> {
  try {
    await AsyncStorage.setItem(HABIT_KEY, JSON.stringify(habits));
  } catch (error) {
    console.error("Failed to save habits:", error);
  }
}

/* ================= MONTHLY TRACKING DATA ================= */

export async function loadMonthlyData(): Promise<MonthlyData> {
  try {
    const data = await AsyncStorage.getItem(MONTHLY_DATA_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error("Failed to load monthly data:", error);
    return {};
  }
}

export async function saveMonthlyData(data: MonthlyData): Promise<void> {
  try {
    await AsyncStorage.setItem(MONTHLY_DATA_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save monthly data:", error);
  }
}

/* ================= HELPER ================= */

export function getEmptyEntry(): DailyEntry {
  return {
    completedHabitIds: [],
    note: "",
  };
}

/* ================= CLEAR ALL DATA (for debugging) ================= */

export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([HABIT_KEY, MONTHLY_DATA_KEY]);
  } catch (error) {
    console.error("Failed to clear data:", error);
  }
}