import React, { createContext, useContext, useEffect, useState } from 'react';
import { format, startOfDay } from 'date-fns';
import {
  Routine,
  RoutineReport,
  loadRoutines,
  saveRoutines,
  loadRoutineReports,
  addRoutineReport as addReportStorage,
  getRoutineReportsForDate,
} from '../storage/routineStorage';
import { useTracker } from './TrackerContext';
import { scheduleRoutineNotifications } from '../services/notificationService';

interface RoutineContextType {
  routines: Routine[];
  addRoutine: (routine: Omit<Routine, 'id' | 'createdAt'>) => Promise<void>;
  updateRoutine: (id: string, updates: Partial<Routine>) => Promise<void>;
  deleteRoutine: (id: string) => Promise<void>;
  toggleRoutineEnabled: (id: string) => Promise<void>;
  getReportsForDate: (date: string) => RoutineReport[];
  addRoutineReport: (routineId: string, date: string, report: string) => Promise<void>;
  getDailySummary: (date: string) => string;
  pendingReports: { routineId: string; routineTitle: string; date: string }[];
  markReportPending: (routineId: string, routineTitle: string, date: string) => void;
  removePendingReport: (routineId: string, date: string) => void;
}

const RoutineContext = createContext<RoutineContextType | undefined>(undefined);

export const useRoutine = () => {
  const context = useContext(RoutineContext);
  if (!context) {
    throw new Error('useRoutine must be used within RoutineProvider');
  }
  return context;
};

export const RoutineProvider = ({ children }: { children: React.ReactNode }) => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [reports, setReports] = useState<RoutineReport[]>([]);
  const [pendingReports, setPendingReports] = useState<{ routineId: string; routineTitle: string; date: string }[]>([]);
  const { updateNote, getDayEntry } = useTracker();

  // Load routines and reports on mount
  useEffect(() => {
    loadData();
  }, []);

  // Schedule notifications when routines change
  useEffect(() => {
    if (routines.length > 0) {
      scheduleRoutineNotifications(routines);
    }
  }, [routines]);

  const loadData = async () => {
    try {
      const loadedRoutines = await loadRoutines();
      setRoutines(loadedRoutines);
      
      const loadedReports = await loadRoutineReports();
      setReports(loadedReports);
    } catch (error) {
      console.error('Failed to load routine data:', error);
    }
  };

  const addRoutine = async (routineData: Omit<Routine, 'id' | 'createdAt'>) => {
    try {
      const newRoutine: Routine = {
        ...routineData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      
      const updatedRoutines = [...routines, newRoutine];
      setRoutines(updatedRoutines);
      await saveRoutines(updatedRoutines);
    } catch (error) {
      console.error('Failed to add routine:', error);
      throw error;
    }
  };

  const updateRoutine = async (id: string, updates: Partial<Routine>) => {
    try {
      const updatedRoutines = routines.map(r => 
        r.id === id ? { ...r, ...updates } : r
      );
      setRoutines(updatedRoutines);
      await saveRoutines(updatedRoutines);
    } catch (error) {
      console.error('Failed to update routine:', error);
      throw error;
    }
  };

  const deleteRoutine = async (id: string) => {
    try {
      const updatedRoutines = routines.filter(r => r.id !== id);
      setRoutines(updatedRoutines);
      await saveRoutines(updatedRoutines);
    } catch (error) {
      console.error('Failed to delete routine:', error);
      throw error;
    }
  };

  const toggleRoutineEnabled = async (id: string) => {
    try {
      const routine = routines.find(r => r.id === id);
      if (routine) {
        await updateRoutine(id, { enabled: !routine.enabled });
      }
    } catch (error) {
      console.error('Failed to toggle routine:', error);
      throw error;
    }
  };

  const getReportsForDate = (date: string): RoutineReport[] => {
    return reports.filter(r => r.date === date);
  };

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const hour = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${hour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const addRoutineReport = async (routineId: string, date: string, report: string) => {
    try {
      const newReport: RoutineReport = {
        id: Date.now().toString(),
        routineId,
        date,
        report,
        createdAt: new Date().toISOString(),
      };
      
      // Add to state first
      const updatedReports = [...reports, newReport];
      setReports(updatedReports);
      await addReportStorage(newReport);
      
      // Remove from pending IMMEDIATELY to prevent popup from reappearing
      removePendingReport(routineId, date);
      
      // Calculate summary using the updated reports (including the new one)
      const dateReports = updatedReports.filter(r => r.date === date);
      const summaryLines: string[] = [];
      
      // Sort reports by time (start time)
      const sortedReports = dateReports
        .map(r => {
          const routine = routines.find(rt => rt.id === r.routineId);
          return { report: r, routine };
        })
        .filter(item => item.routine)
        .sort((a, b) => {
          const timeA = a.routine!.startTime;
          const timeB = b.routine!.startTime;
          return timeA.localeCompare(timeB);
        });
      
      sortedReports.forEach(({ report: r, routine }) => {
        if (routine && r.report.trim()) {
          const startDisplay = formatTime(routine.startTime);
          const endDisplay = formatTime(routine.endTime);
          const timeRange = `${startDisplay}–${endDisplay}`;
          summaryLines.push(`⏰ ${routine.title} (${timeRange})\n${r.report}`);
        }
      });
      
      const routineSummary = summaryLines.join('\n\n');
      
      if (routineSummary) {
        // Get existing note from tracker
        const existingEntry = getDayEntry(date);
        const existingNote = existingEntry.note || '';
        
        // Combine existing note with routine reports
        let combinedNote = '';
        if (existingNote && !existingNote.includes('⏰')) {
          // If existing note doesn't already contain routine reports, combine them
          combinedNote = `${routineSummary}\n\n---\n\n${existingNote}`;
        } else if (existingNote && existingNote.includes('⏰')) {
          // If it already has routine reports, replace the routine section but keep manual notes
          const parts = existingNote.split('\n\n---\n\n');
          const manualNotePart = parts.length > 1 ? parts[1] : '';
          combinedNote = manualNotePart 
            ? `${routineSummary}\n\n---\n\n${manualNotePart}`
            : routineSummary;
        } else {
          // Only routine reports
          combinedNote = routineSummary;
        }
        
        // Update the note in tracker
        await updateNote(date, combinedNote);
        console.log('✅ Routine report saved to daily tracker notes:', date);
      }
    } catch (error) {
      console.error('Failed to add routine report:', error);
      throw error;
    }
  };

  const getDailySummary = (date: string): string => {
    const dateReports = getReportsForDate(date);
    if (dateReports.length === 0) return '';
    
    const summaryLines: string[] = [];
    
    // Sort reports by time (start time)
    const sortedReports = dateReports
      .map(report => {
        const routine = routines.find(r => r.id === report.routineId);
        return { report, routine };
      })
      .filter(item => item.routine)
      .sort((a, b) => {
        const timeA = a.routine!.startTime;
        const timeB = b.routine!.startTime;
        return timeA.localeCompare(timeB);
      });
    
    sortedReports.forEach(({ report, routine }) => {
      if (routine && report.report.trim()) {
        const [startHour, startMin] = routine.startTime.split(':').map(Number);
        const [endHour, endMin] = routine.endTime.split(':').map(Number);
        const startDisplay = formatTime(routine.startTime);
        const endDisplay = formatTime(routine.endTime);
        const timeRange = `${startDisplay}–${endDisplay}`;
        summaryLines.push(`⏰ ${routine.title} (${timeRange})\n${report.report}`);
      }
    });
    
    return summaryLines.join('\n\n');
  };

  const markReportPending = (routineId: string, routineTitle: string, date: string) => {
    setPendingReports(prev => {
      // Check if already pending
      const exists = prev.some(p => p.routineId === routineId && p.date === date);
      if (exists) return prev;
      
      return [...prev, { routineId, routineTitle, date }];
    });
  };

  const removePendingReport = (routineId: string, date: string) => {
    setPendingReports(prev => 
      prev.filter(p => !(p.routineId === routineId && p.date === date))
    );
  };

  return (
    <RoutineContext.Provider
      value={{
        routines,
        addRoutine,
        updateRoutine,
        deleteRoutine,
        toggleRoutineEnabled,
        getReportsForDate,
        addRoutineReport,
        getDailySummary,
        pendingReports,
        markReportPending,
        removePendingReport,
      }}
    >
      {children}
    </RoutineContext.Provider>
  );
};
