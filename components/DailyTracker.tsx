import { addDays, format } from "date-fns";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const HABITS = ["Water", "Exercise", "Study"];

function get7Days() {
  return Array.from({ length: 7 }, (_, i) => addDays(new Date(), i - 3));
}

export default function DailyTracker() {
  const days = useMemo(get7Days, []);
  const todayStr = format(new Date(), "yyyy-MM-dd");

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
      copy[dateKey][index] = !copy[dateKey][index];
      return copy;
    });
  }

  function getProgress(arr: boolean[]) {
    const done = arr.filter(Boolean).length;
    return Math.round((done / arr.length) * 100);
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
        const isToday = key === todayStr;
        const isFuture = day > new Date();

        return (
          <View
            key={key}
            style={[
              styles.row,
              isToday && styles.todayRow,
            ]}
          >
            <Text style={[styles.cell, styles.dateCell]}>
              {format(day, "EEE dd")}
            </Text>

            {data[key].map((val, i) => (
              <Pressable
                key={i}
                disabled={isFuture}
                onPress={() => toggle(key, i)}
                style={styles.cell}
              >
                <Text style={styles.check}>
                  {val ? "✔️" : isFuture ? "-" : "❌"}
                </Text>
              </Pressable>
            ))}

            <Text style={styles.cell}>
              {isFuture ? "-" : `${getProgress(data[key])}%`}
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
  },
  todayRow: {
    backgroundColor: "#E8F5E9",
    borderRadius: 6,
  },
  cell: {
    width: 60,
    textAlign: "center",
  },
  dateCell: {
    width: 80,
    textAlign: "left",
  },
  check: {
    fontSize: 16,
  },
});
