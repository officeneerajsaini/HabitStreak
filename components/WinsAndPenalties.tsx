import { StyleSheet, Text, View } from "react-native";

const WINS = [
  30, 50, 75, 100, 150, 200, 250, 300, 365,
];

export default function WinsAndPenalties() {
  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>My Wins</Text>

      {/* Rule */}
      <View style={styles.ruleRow}>
        <View style={styles.ruleLine} />
        <Text style={styles.ruleText}>
          To consider it as a Day you should at least do more than 75% of the habits
        </Text>
      </View>

      {/* Table Header */}
      <View style={[styles.row, styles.headerRow]}>
        <Text style={[styles.cell, styles.colStreak]}>🔥 The Streak</Text>
        <Text style={[styles.cell, styles.colReward]}>🎁 The Reward</Text>
        <Text style={[styles.cell, styles.colDate]}>📅 Date</Text>
        <Text style={[styles.cell, styles.colNotes]}>📝 Notes</Text>
      </View>

      {/* Table Rows */}
      {WINS.map((days) => (
        <View key={days} style={styles.row}>
          <Text style={[styles.cell, styles.colStreak]}>
            🔥 {days} Days
          </Text>
          <Text style={[styles.cell, styles.colReward]}>—</Text>
          <Text style={[styles.cell, styles.colDate]}>—</Text>
          <Text style={[styles.cell, styles.colNotes]}>—</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#3A3A38",
    borderRadius: 16,
    padding: 14,
    marginTop: 16,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },

  ruleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },

  ruleLine: {
    width: 4,
    height: "100%",
    backgroundColor: "#FFFFFF",
    marginRight: 10,
    borderRadius: 2,
  },

  ruleText: {
    color: "#E0E0E0",
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },

  row: {
    flexDirection: "row",
    borderTopWidth: 0.5,
    borderColor: "#555",
    paddingVertical: 8,
  },

  headerRow: {
    borderTopWidth: 0,
    paddingBottom: 6,
  },

  cell: {
    color: "#FFFFFF",
    fontSize: 14,
  },

  colStreak: {
    width: 90,
  },

  colReward: {
    width: 100,
  },

  colDate: {
    width: 80,
  },

  colNotes: {
    flex: 1,
  },
});
