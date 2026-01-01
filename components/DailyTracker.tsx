import {
    addDays,
    format,
    isAfter,
    isSameDay,
    startOfDay,
    subDays,
} from "date-fns";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
  
  const HABITS = ["Water", "Exercise", "Study"]; // TEMP (will come from Habit List later)
  
  function get7Days() {
    const today = startOfDay(new Date());
    return Array.from({ length: 7 }, (_, i) => addDays(today, i - 3));
  }
  
  export default function DailyTracker() {
    const days = useMemo(get7Days, []);
    const today = startOfDay(new Date());
    const yesterday = subDays(today, 1);
  
    const [data, setData] = useState(() => {
      const obj: Record<string, boolean[]> = {};
      days.forEach((d) => {
        obj[format(d, "yyyy-MM-dd")] = HABITS.map(() => false);
      });
      return obj;
    });
  
    function toggle(dateKey: string, index: number) {
      setData((prev) => {
        const copy = { ...prev };
        copy[dateKey] = [...copy[dateKey]];
        copy[dateKey][index] = !copy[dateKey][index];
        return copy;
      });
    }
  
    function getProgress(arr: boolean[]) {
      const done = arr.filter(Boolean).length;
      return Math.round((done / arr.length) * 100);
    }
  
    function isSuccess(arr: boolean[]) {
      return getProgress(arr) >= 75;
    }
  
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Daily Tracker</Text>
  
        {/* Header */}
        <View style={styles.row}>
          <Text style={[styles.cell, styles.dateCell]}>Day</Text>
          {HABITS.map((h) => (
            <Text key={h} style={styles.cell}>{h}</Text>
          ))}
          <Text style={styles.cell}>%</Text>
        </View>
  
        {/* Rows */}
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
  
          const isToday = isSameDay(day, today);
          const isYesterday = isSameDay(day, yesterday);
          const isFuture = isAfter(day, today);
          const isEditable = isToday || isYesterday;
  
          const progress = getProgress(data[key]);
          const success = isSuccess(data[key]);
  
          return (
            <View
              key={key}
              style={[
                styles.row,
                isToday && styles.todayRow,
                isYesterday && styles.yesterdayRow,
                !isFuture && success && styles.successRow,
              ]}
            >
              <Text style={[styles.cell, styles.dateCell]}>
                {format(day, "EEE dd")}
              </Text>
  
              {data[key].map((val, i) => (
                <Pressable
                  key={i}
                  disabled={!isEditable}
                  onPress={() => toggle(key, i)}
                  style={styles.cell}
                >
                  <Text style={styles.check}>
                    {val ? "✔️" : isEditable ? "❌" : "—"}
                  </Text>
                </Pressable>
              ))}
  
              <Text style={styles.cell}>
                {isEditable || !isFuture ? `${progress}%` : "—"}
              </Text>
            </View>
          );
        })}
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      backgroundColor: "#FFFFFF",
      borderRadius: 12,
      padding: 10,
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 8,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
      borderRadius: 6,
    },
    todayRow: {
      backgroundColor: "#E3F2FD", // blue
    },
    yesterdayRow: {
      backgroundColor: "#FFF8E1", // yellow
    },
    successRow: {
      backgroundColor: "#E8F5E9", // green (success)
    },
    cell: {
      width: 60,
      textAlign: "center",
    },
    dateCell: {
      width: 80,
      textAlign: "left",
      fontWeight: "600",
    },
    check: {
      fontSize: 16,
    },
  });
  