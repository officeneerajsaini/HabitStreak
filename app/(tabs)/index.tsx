import DailyTracker from "@/components/DailyTracker";
import GithubStyleHeatmap from "@/components/GithubStyleHeatmap";
import HabitListCard from "@/components/HabitListCard";
import MonthlyOverview from "@/components/MonthlyOverview";
import WinsAndPenalties from "@/components/WinsAndPenalties";
import YearlyOverview from "@/components/YearlyOverview";
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const { width } = useWindowDimensions();
const isMobile = width < 768;

export default function HomeScreen() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView style={styles.container}>

        {/* 1️⃣ Activity Heatmap */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity</Text>
          <GithubStyleHeatmap />
        </View>


        {/* 2️⃣ Habit List + 11-Day Table */}
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
    </GestureHandlerRootView>
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
    marginHorizontal: 12,
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
  },
  
  rightPanel: {
    width: "65%",
  },
  
  fullWidth: {
    width: "100%",
  },

  boxPlaceholder: {
    height: 120,
    backgroundColor: "#EDEDED",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
