import { Dimensions, StyleSheet, Text, View } from "react-native";

const MONTHS = [
  "January", "February", "March",
  "April", "May", "June",
  "July", "August", "September",
  "October", "November", "December",
];

// Dummy monthly completion %
const DUMMY_PROGRESS = {
  January: 84,
  February: 0,
  March: 0,
  April: 0,
  May: 0,
  June: 0,
  July: 0,
  August: 0,
  September: 0,
  October: 0,
  November: 0,
  December: 0,
};

const CARD_WIDTH = (Dimensions.get("window").width - 36) / 2;

export default function YearlyOverview() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Yearly Overview</Text>

      <View style={styles.grid}>
        {MONTHS.map((month) => {
          const percent = DUMMY_PROGRESS[month as keyof typeof DUMMY_PROGRESS];

          return (
            <View key={month} style={styles.card}>
              <Text style={styles.monthText}>{month}</Text>

              <View style={styles.progressRow}>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${percent}%` },
                    ]}
                  />
                </View>
                <Text style={styles.percentText}>{percent}%</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: CARD_WIDTH,
    backgroundColor: "#3A3A38",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },

  monthText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
  },

  progressRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: "#5A5A58",
    borderRadius: 4,
    overflow: "hidden",
    marginRight: 8,
  },

  progressBarFill: {
    height: "100%",
    backgroundColor: "#EDEDED",
  },

  percentText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
