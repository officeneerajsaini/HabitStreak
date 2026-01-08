import { addDays, format, startOfDay, subDays } from 'date-fns';
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createTrackedHabit,
  deleteTrackedHabit as deleteTrackedHabitService,
  fetchTrackedHabits,
  type TrackedHabit,
} from '../services/trackedHabitService';
import {
  fetchTrackingData,
  toggleHabitCompletion,
  updateDayNote,
} from '../services/trackerService';

export interface DayEntry {
  date: string;
  completedHabitIds: string[];
  note: string;
}

export interface DailyEntry extends DayEntry {}

export interface TrackerData {
  [date: string]: DayEntry;
}

interface TrackerContextType {
  trackedHabits: TrackedHabit[];
  addTrackedHabit: (title: string, emoji: string) => Promise<void>;
  deleteTrackedHabit: (id: string) => Promise<void>;
  trackerData: TrackerData;
  toggleCompletion: (dateKey: string, habitId: string) => Promise<void>;
  updateNote: (dateKey: string, note: string) => Promise<void>;
  getProgress: (dateKey: string) => number;
  getDayEntry: (dateKey: string) => DayEntry;
  isLoading: boolean;
}

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

export const useTracker = () => {
  const context = useContext(TrackerContext);
  if (!context) {
    throw new Error('useTracker must be used within TrackerProvider');
  }
  return context;
};

export const TrackerProvider = ({ children }: { children: React.ReactNode }) => {
  const [trackedHabits, setTrackedHabits] = useState<TrackedHabit[]>([]);
  const [trackerData, setTrackerData] = useState<TrackerData>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load tracked habits and tracking data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load tracked habits
      const habits = await fetchTrackedHabits();
      setTrackedHabits(habits);

      // Load tracking data for the visible week
      const today = startOfDay(new Date());
      const startDate = format(subDays(today, 3), 'yyyy-MM-dd');
      const endDate = format(addDays(today, 3), 'yyyy-MM-dd');

      const trackingRecords = await fetchTrackingData(startDate, endDate);

      // Convert to tracker data format
      const dataByDate: TrackerData = {};

      trackingRecords.forEach(record => {
        if (!dataByDate[record.date]) {
          dataByDate[record.date] = {
            date: record.date,
            completedHabitIds: [],
            note: record.note || '',
          };
        }

        if (record.completed) {
          dataByDate[record.date].completedHabitIds.push(record.tracked_habit_id);
        }

        if (record.note && record.note.length > dataByDate[record.date].note.length) {
          dataByDate[record.date].note = record.note;
        }
      });

      setTrackerData(dataByDate);
    } catch (error) {
      console.error('Failed to load tracker data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTrackedHabit = async (title: string, emoji: string) => {
    try {
      const newHabit = await createTrackedHabit(title, emoji);
      setTrackedHabits([...trackedHabits, newHabit]);
    } catch (error) {
      console.error('Failed to add tracked habit:', error);
      throw error;
    }
  };

  const deleteTrackedHabit = async (id: string) => {
    try {
      await deleteTrackedHabitService(id);
      setTrackedHabits(trackedHabits.filter(h => h.id !== id));

      // Remove from tracking data
      setTrackerData(prev => {
        const updated: TrackerData = {};
        Object.keys(prev).forEach(key => {
          updated[key] = {
            ...prev[key],
            completedHabitIds: prev[key].completedHabitIds.filter(habitId => habitId !== id),
          };
        });
        return updated;
      });
    } catch (error) {
      console.error('Failed to delete tracked habit:', error);
      throw error;
    }
  };

  const toggleCompletion = async (dateKey: string, habitId: string) => {
    const dayEntry = getDayEntry(dateKey);
    const isCurrentlyCompleted = dayEntry.completedHabitIds.includes(habitId);

    // Optimistic update
    const newCompletedIds = isCurrentlyCompleted
      ? dayEntry.completedHabitIds.filter(id => id !== habitId)
      : [...dayEntry.completedHabitIds, habitId];

    setTrackerData(prev => ({
      ...prev,
      [dateKey]: {
        ...dayEntry,
        completedHabitIds: newCompletedIds,
      },
    }));

    try {
      await toggleHabitCompletion(habitId, dateKey, isCurrentlyCompleted);
    } catch (error) {
      // Revert on error
      setTrackerData(prev => ({
        ...prev,
        [dateKey]: dayEntry,
      }));
      console.error('Failed to toggle completion:', error);
    }
  };

  const updateNote = async (dateKey: string, note: string) => {
    const dayEntry = getDayEntry(dateKey);

    // Optimistic update
    setTrackerData(prev => ({
      ...prev,
      [dateKey]: {
        ...dayEntry,
        note,
      },
    }));

    try {
      if (trackedHabits.length > 0) {
        await updateDayNote(trackedHabits[0].id, dateKey, note);
      }
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  const getProgress = (dateKey: string): number => {
    if (trackedHabits.length === 0) return 0;
    const dayEntry = getDayEntry(dateKey);
    const completed = dayEntry.completedHabitIds.length;
    return Math.round((completed / trackedHabits.length) * 100);
  };

  const getDayEntry = (dateKey: string): DayEntry => {
    return trackerData[dateKey] || {
      date: dateKey,
      completedHabitIds: [],
      note: '',
    };
  };

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
};