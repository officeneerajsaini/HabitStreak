import DailyTracker from "@/components/DailyTracker";
import GithubStyleHeatmap from "@/components/GithubStyleHeatmap";
import HabitListCard from "@/components/HabitListCard";
import MonthlyOverview from "@/components/MonthlyOverview";
import WinsAndPenalties from "@/components/WinsAndPenalties";
import YearlyOverview from "@/components/YearlyOverview";
import { ScrollView, StyleSheet, Text, View } from "react-native";


export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>

      {/* 1️⃣ Activity Heatmap */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity</Text>
        <GithubStyleHeatmap />
      </View>


      {/* 2️⃣ Habit List + 11-Day Table */}
      <View style={styles.middleSection}>

        {/* Left: Habit List */}
        <View style={styles.leftPanel}>
          <HabitListCard />
        </View>

        {/* Right: 11-Day Table */}
        <View style={styles.rightPanel}>
          <Text style={styles.sectionTitle}>Daily Tracker</Text>
          <DailyTracker />
        </View>

      </View>

      {/* 3️⃣ Monthly Table */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Monthly Overview</Text>
        <MonthlyOverview />
      </View>

      {/* 4️⃣ Yearly Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Yearly Overview</Text>
        <YearlyOverview />
      </View>

      {/* 5️⃣ Rewards & Punishments */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Wins & Penalties</Text>
        <WinsAndPenalties />
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },

  section: {
    margin: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },

  middleSection: {
    flexDirection: "row",
    marginHorizontal: 12,
    gap: 8,
  },

  leftPanel: {
    width: "35%",
  },

  rightPanel: {
    width: "65%",
  },

  boxPlaceholder: {
    height: 120,
    backgroundColor: "#EDEDED",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
