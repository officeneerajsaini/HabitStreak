// context/TrackerContext.tsx

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

/* ================= TYPES ================= */

export type TrackedHabit = {
  id: string;
  title: string;
  emoji: string;  // NEW: emoji for display
  color: string;
  createdAt: string;
};

export type DailyEntry = {
  completedHabitIds: string[];
  note: string;
};

export type TrackerData = {
  [date: string]: DailyEntry;
};

type TrackerContextType = {
  // Tracked Habits
  trackedHabits: TrackedHabit[];
  addTrackedHabit: (title: string, emoji: string) => void;
  deleteTrackedHabit: (habitId: string) => void;

  // Tracking Data
  trackerData: TrackerData;
  toggleCompletion: (dateKey: string, habitId: string) => void;
  updateNote: (dateKey: string, note: string) => void;
  getProgress: (dateKey: string) => number;
  getDayEntry: (dateKey: string) => DailyEntry;

  // Loading State
  isLoading: boolean;
};

/* ================= CONTEXT ================= */

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

const TRACKED_HABITS_KEY = "@tracked_habits";
const TRACKER_DATA_KEY = "@tracker_data";

const COLORS = [
  "#4CAF50", "#2196F3", "#FF9800", "#E91E63",
  "#9C27B0", "#00BCD4", "#FF5722", "#607D8B",
  "#3F51B5", "#009688", "#FFC107", "#795548",
];

/* ================= PROVIDER ================= */

export function TrackerProvider({ children }: { children: ReactNode }) {
  const [trackedHabits, setTrackedHabits] = useState<TrackedHabit[]>([]);
  const [trackerData, setTrackerData] = useState<TrackerData>({});
  const [isLoading, setIsLoading] = useState(true);

  /* ===== LOAD DATA ===== */
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [habitsJson, dataJson] = await Promise.all([
          AsyncStorage.getItem(TRACKED_HABITS_KEY),
          AsyncStorage.getItem(TRACKER_DATA_KEY),
        ]);

        if (habitsJson) {
          setTrackedHabits(JSON.parse(habitsJson));
        }
        if (dataJson) {
          setTrackerData(JSON.parse(dataJson));
        }
      } catch (error) {
        console.error("Error loading tracker data:", error);
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  /* ===== SAVE TRACKED HABITS ===== */
  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem(TRACKED_HABITS_KEY, JSON.stringify(trackedHabits));
    }
  }, [trackedHabits, isLoading]);

  /* ===== SAVE TRACKER DATA ===== */
  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem(TRACKER_DATA_KEY, JSON.stringify(trackerData));
    }
  }, [trackerData, isLoading]);

  /* ===== HABIT FUNCTIONS ===== */

  function addTrackedHabit(title: string, emoji: string) {
    if (!title.trim()) return;

    const newHabit: TrackedHabit = {
      id: Date.now().toString(),
      title: title.trim(),
      emoji: emoji.trim() || "✅",
      color: COLORS[trackedHabits.length % COLORS.length],
      createdAt: new Date().toISOString(),
    };

    setTrackedHabits((prev) => [...prev, newHabit]);
  }

  function deleteTrackedHabit(habitId: string) {
    setTrackedHabits((prev) => prev.filter((h) => h.id !== habitId));

    // Remove from all tracking data
    setTrackerData((prev) => {
      const updated: TrackerData = {};
      Object.keys(prev).forEach((key) => {
        updated[key] = {
          ...prev[key],
          completedHabitIds: prev[key].completedHabitIds.filter((id) => id !== habitId),
        };
      });
      return updated;
    });
  }

  /* ===== TRACKING FUNCTIONS ===== */

  function toggleCompletion(dateKey: string, habitId: string) {
    setTrackerData((prev) => {
      const entry = prev[dateKey] || { completedHabitIds: [], note: "" };
      const exists = entry.completedHabitIds.includes(habitId);

      return {
        ...prev,
        [dateKey]: {
          ...entry,
          completedHabitIds: exists
            ? entry.completedHabitIds.filter((id) => id !== habitId)
            : [...entry.completedHabitIds, habitId],
        },
      };
    });
  }

  function updateNote(dateKey: string, note: string) {
    setTrackerData((prev) => {
      const entry = prev[dateKey] || { completedHabitIds: [], note: "" };
      return {
        ...prev,
        [dateKey]: {
          ...entry,
          note,
        },
      };
    });
  }

  /* ===== HELPERS ===== */

  function getProgress(dateKey: string): number {
    if (trackedHabits.length === 0) return 0;
    const entry = trackerData[dateKey];
    if (!entry) return 0;
    return Math.round((entry.completedHabitIds.length / trackedHabits.length) * 100);
  }

  function getDayEntry(dateKey: string): DailyEntry {
    return trackerData[dateKey] || { completedHabitIds: [], note: "" };
  }

  return (
    <TrackerContext.Provider
      value={{
        trackedHabits,
        addTrackedHabit,
        deleteTrackedHabit,
        trackerData,
        toggleCompletion,
        updateNote,
        getProgress,
        getDayEntry,
        isLoading,
      }}
    >
      {children}
    </TrackerContext.Provider>
  );
}

/* ================= HOOK ================= */

export function useTracker() {
  const context = useContext(TrackerContext);
  if (!context) {
    throw new Error("useTracker must be used within a TrackerProvider");
  }
  return context;
}