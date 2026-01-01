import {
    eachDayOfInterval,
    endOfMonth,
    format,
    isToday,
    startOfMonth,
} from "date-fns";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

const HABITS = ["Water", "Exercise", "Study"];

export default function MonthlyOverview() {
  const days = useMemo(() => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    return eachDayOfInterval({ start, end });
  }, []);

  function getProgress() {
    // dummy logic for now
    const done = Math.floor(Math.random() * HABITS.length);
    return Math.round((done / HABITS.length) * 100);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Monthly Overview – {format(new Date(), "MMMM yyyy")}
      </Text>

      {/* Header */}
      <View style={styles.row}>
        <Text style={[styles.cell, styles.dateCell]}>Date</Text>
        {HABITS.map((h) => (
          <Text key={h} style={styles.cell}>{h}</Text>
        ))}
        <Text style={styles.cell}>%</Text>
      </View>

      {/* Rows */}
      {days.map((day) => (
        <View
          key={day.toString()}
          style={[
            styles.row,
            isToday(day) && styles.todayRow,
          ]}
        >
          <Text style={[styles.cell, styles.dateCell]}>
            {format(day, "dd")}
          </Text>

          {HABITS.map((_, i) => (
            <Text key={i} style={styles.cell}>
              {Math.random() > 0.5 ? "✔️" : "❌"}
            </Text>
          ))}

          <Text style={styles.cell}>{getProgress()}%</Text>
        </View>
      ))}
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
    marginBottom: 4,
  },
  todayRow: {
    backgroundColor: "#E8F5E9",
    borderRadius: 6,
  },
  cell: {
    width: 60,
    textAlign: "center",
    fontSize: 12,
  },
  dateCell: {
    width: 50,
    textAlign: "left",
    fontWeight: "600",
  },
});
