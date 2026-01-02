import AsyncStorage from "@react-native-async-storage/async-storage";

/* ================= TYPES ================= */

export type HabitItem = {
  id: string;
  title: string;
  color: string;
  createdAt: string;
};

/* ================= STORAGE KEY ================= */

const HABIT_LIST_KEY = "@habit_list";

/* ================= FUNCTIONS ================= */

export async function loadHabitList(): Promise<HabitItem[]> {
  try {
    const json = await AsyncStorage.getItem(HABIT_LIST_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error("Error loading habit list:", error);
    return [];
  }
}

export async function saveHabitList(habits: HabitItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(HABIT_LIST_KEY, JSON.stringify(habits));
  } catch (error) {
    console.error("Error saving habit list:", error);
  }
}