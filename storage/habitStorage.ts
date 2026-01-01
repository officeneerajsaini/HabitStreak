import AsyncStorage from "@react-native-async-storage/async-storage";

const HABIT_KEY = "HABITS_V1";

export async function loadHabits() {
  const data = await AsyncStorage.getItem(HABIT_KEY);
  return data ? JSON.parse(data) : [];
}

export async function saveHabits(habits: any[]) {
  await AsyncStorage.setItem(HABIT_KEY, JSON.stringify(habits));
}
