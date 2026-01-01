import { ScrollView, StyleSheet, Text, View } from "react-native";

const WEEKS = 53;
const DAYS = 7;

// dummy activity: 0–4 (like GitHub)
const data = Array.from({ length: WEEKS * DAYS }, () =>
  Math.floor(Math.random() * 5)
);

function getColor(level: number) {
  switch (level) {
    case 0:
      return "#161B22";
    case 1:
      return "#0E4429";
    case 2:
      return "#006D32";
    case 3:
      return "#26A641";
    case 4:
      return "#39D353";
    default:
      return "#161B22";
  }
}

const WEEK_LABELS = ["Mon", "Wed", "Fri"];
const MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec"
];

export default function GithubStyleHeatmap() {
  return (
    <View style={styles.container}>
      
      {/* Month Labels */}
      <View style={styles.monthRow}>
        {MONTHS.map((m) => (
          <Text key={m} style={styles.monthText}>{m}</Text>
        ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.heatmapRow}>
          
          {/* Day Labels */}
          <View style={styles.dayLabels}>
            {WEEK_LABELS.map((d) => (
              <Text key={d} style={styles.dayText}>{d}</Text>
            ))}
          </View>

          {/* Grid */}
          <View style={styles.grid}>
            {Array.from({ length: WEEKS }).map((_, weekIndex) => (
              <View key={weekIndex} style={styles.weekColumn}>
                {Array.from({ length: DAYS }).map((_, dayIndex) => {
                  const value = data[weekIndex * DAYS + dayIndex];
                  return (
                    <View
                      key={dayIndex}
                      style={[
                        styles.cell,
                        { backgroundColor: getColor(value) },
                      ]}
                    />
                  );
                })}
              </View>
            ))}
          </View>

        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Less</Text>
        {[0,1,2,3,4].map(i => (
          <View
            key={i}
            style={[
              styles.legendBox,
              { backgroundColor: getColor(i) },
            ]}
          />
        ))}
        <Text style={styles.footerText}>More</Text>
      </View>

    </View>
  );
}

const CELL_SIZE = 12;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0D1117",
    padding: 12,
    borderRadius: 10,
  },

  monthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginLeft: 30,
    marginBottom: 8,
  },

  monthText: {
    color: "#C9D1D9",
    fontSize: 12,
  },

  heatmapRow: {
    flexDirection: "row",
  },

  dayLabels: {
    marginRight: 6,
    justifyContent: "space-between",
    height: DAYS * (CELL_SIZE + 4),
  },

  dayText: {
    color: "#8B949E",
    fontSize: 12,
  },

  grid: {
    flexDirection: "row",
  },

  weekColumn: {
    marginRight: 4,
  },

  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 2,
    marginBottom: 4,
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  footerText: {
    color: "#8B949E",
    fontSize: 12,
    marginHorizontal: 6,
  },

  legendBox: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginHorizontal: 2,
  },
});
