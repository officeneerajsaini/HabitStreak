import { endOfYear, format, startOfYear } from 'date-fns';
import { supabase } from '../lib/supabase';

export interface DayHeatmapData {
  date: string;
  completedCount: number;
  totalHabits: number;
  percentage: number;
}

export const fetchYearHeatmapData = async (
  year: number
): Promise<Record<string, DayHeatmapData>> => {
  const startDate = format(startOfYear(new Date(year, 0, 1)), 'yyyy-MM-dd');
  const endDate = format(endOfYear(new Date(year, 11, 31)), 'yyyy-MM-dd');

  // Fetch all tracking data for the year
  const { data: trackingData, error: trackingError } = await supabase
    .from('habit_tracking')
    .select('date, completed, tracked_habit_id')
    .gte('date', startDate)
    .lte('date', endDate);

  if (trackingError) {
    console.error('Error fetching heatmap data:', trackingError);
    return {};
  }

  // Fetch total tracked habits count
  const { data: habits, error: habitsError } = await supabase
    .from('tracked_habits')
    .select('id');

  if (habitsError) {
    console.error('Error fetching habits:', habitsError);
    return {};
  }

  const totalHabits = habits?.length || 1;

  // Group by date
  const dataByDate: Record<string, DayHeatmapData> = {};

  trackingData?.forEach(record => {
    if (!dataByDate[record.date]) {
      dataByDate[record.date] = {
        date: record.date,
        completedCount: 0,
        totalHabits,
        percentage: 0,
      };
    }

    if (record.completed) {
      dataByDate[record.date].completedCount++;
    }
  });

  // Calculate percentages
  Object.values(dataByDate).forEach(day => {
    day.percentage = Math.round((day.completedCount / day.totalHabits) * 100);
  });

  return dataByDate;
};