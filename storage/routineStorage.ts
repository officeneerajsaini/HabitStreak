// storage/routineStorage.ts

import AsyncStorage from "@react-native-async-storage/async-storage";

/* ================= TYPES ================= */

export type Routine = {
  id: string;
  title: string;
  startTime: string; // HH:mm format (e.g., "06:00")
  endTime: string; // HH:mm format (e.g., "07:00")
  color: string;
  createdAt: string;
  enabled: boolean;
};

export type RoutineReport = {
  id: string;
  routineId: string;
  date: string; // yyyy-MM-dd format
  report: string;
  createdAt: string;
};

/* ================= STORAGE KEYS ================= */

const ROUTINES_KEY = "@routines";
const ROUTINE_REPORTS_KEY = "@routine_reports";

/* ================= ROUTINES ================= */

export async function loadRoutines(): Promise<Routine[]> {
  try {
    const json = await AsyncStorage.getItem(ROUTINES_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error("Error loading routines:", error);
    return [];
  }
}

export async function saveRoutines(routines: Routine[]): Promise<void> {
  try {
    await AsyncStorage.setItem(ROUTINES_KEY, JSON.stringify(routines));
  } catch (error) {
    console.error("Error saving routines:", error);
  }
}

/* ================= ROUTINE REPORTS ================= */

export async function loadRoutineReports(): Promise<RoutineReport[]> {
  try {
    const json = await AsyncStorage.getItem(ROUTINE_REPORTS_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error("Error loading routine reports:", error);
    return [];
  }
}

export async function saveRoutineReports(reports: RoutineReport[]): Promise<void> {
  try {
    await AsyncStorage.setItem(ROUTINE_REPORTS_KEY, JSON.stringify(reports));
  } catch (error) {
    console.error("Error saving routine reports:", error);
  }
}

export async function addRoutineReport(report: RoutineReport): Promise<void> {
  try {
    const reports = await loadRoutineReports();
    reports.push(report);
    await saveRoutineReports(reports);
  } catch (error) {
    console.error("Error adding routine report:", error);
  }
}

export async function getRoutineReportsForDate(date: string): Promise<RoutineReport[]> {
  try {
    const reports = await loadRoutineReports();
    return reports.filter(r => r.date === date);
  } catch (error) {
    console.error("Error getting routine reports for date:", error);
    return [];
  }
}
