import DailyTracker from "@/components/DailyTracker";
import GithubStyleHeatmap from "@/components/GithubStyleHeatmap";
import HabitListCard from "@/components/HabitListCard";
import MonthlyOverview from "@/components/MonthlyOverview";
import WinsAndPenalties from "@/components/WinsAndPenalties";
import YearlyOverview from "@/components/YearlyOverview";
import { HabitProvider } from "@/context/HabitContext";
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function HomeScreen() {
  // ✅ Move hook inside the component
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <GestureHandlerRootView style={styles.container}>
      <HabitProvider>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1️⃣ Activity Heatmap */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Activity</Text>
          <GithubStyleHeatmap />
        </View>

        {/* 2️⃣ Habit List + Daily Tracker */}
        <View
          style={[
            styles.middleSection,
            isMobile ? styles.stackLayout : styles.splitLayout,
          ]}
        >
          <View style={isMobile ? styles.fullWidth : styles.leftPanel}>
            <HabitListCard />
          </View>

          <View style={isMobile ? styles.fullWidth : styles.rightPanel}>
            <Text style={styles.sectionTitle}>📋 Daily Tracker</Text>
            <DailyTracker />
          </View>
        </View>

        {/* 3️⃣ Monthly Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Monthly Overview</Text>
          <MonthlyOverview />
        </View>

        {/* 4️⃣ Yearly Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📆 Yearly Overview</Text>
          <YearlyOverview />
        </View>

        {/* 5️⃣ Rewards & Punishments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Wins & Penalties</Text>
          <WinsAndPenalties />
        </View>

      </ScrollView>
      </HabitProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },

  scrollContent: {
    paddingTop: 50,
    paddingBottom: 40,
  },

  section: {
    marginHorizontal: 12,
    marginVertical: 8,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    color: "#FFF",
  },

  middleSection: {
    marginHorizontal: 12,
    marginVertical: 8,
    gap: 12,
  },

  splitLayout: {
    flexDirection: "row",
  },

  stackLayout: {
    flexDirection: "column",
  },

  leftPanel: {
    width: "35%",
    paddingRight: 6,
  },

  rightPanel: {
    width: "65%",
    paddingLeft: 6,
  },

  fullWidth: {
    width: "100%",
    marginBottom: 12,
  },
});