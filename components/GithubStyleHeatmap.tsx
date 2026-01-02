import { useTracker } from "@/context/TrackerContext";
import {
  eachDayOfInterval,
  endOfYear,
  format,
  getDay,
  isAfter,
  startOfDay,
  startOfYear
} from "date-fns";
import * as Haptics from "expo-haptics";
import { useMemo, useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const CELL_SIZE = 14;
const SCREEN_WIDTH = Dimensions.get("window").width;

// Color system based on completion percentage
function getColorByPercentage(percent: number, hasBonus: boolean = false) {
  if (hasBonus) {
    return "#FFD700"; // Gold for bonus points
  }
  if (percent === 0) {
    return "#21262D"; // 0% - Dark gray (not pure black)
  }
  if (percent > 0 && percent < 25) {
    return "#0E4429"; // 1-24% - Darkest Green
  }
  if (percent >= 25 && percent < 50) {
    return "#006D32"; // 25-49% - Dark Green
  }
  if (percent >= 50 && percent < 75) {
    return "#26A641"; // 50-74% - Medium Green
  }
  if (percent >= 75 && percent < 100) {
    return "#39D353"; // 75-99% - Light Green
  }
  if (percent === 100) {
    return "#57FF7A"; // 100% - Lightest Green
  }
  return "#21262D";
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function GithubStyleHeatmap() {
  const { getProgress, getDayEntry, trackerData } = useTracker();
  const today = startOfDay(new Date());
  const currentYear = today.getFullYear();
  
  // Find the earliest year with data
  const earliestYear = useMemo(() => {
    const dates = Object.keys(trackerData || {});
    if (dates.length === 0) return currentYear;
    const years = dates.map(d => parseInt(d.split("-")[0]));
    return Math.min(...years);
  }, [trackerData]);

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipData, setTooltipData] = useState({
    date: "",
    percent: 0,
  });

  // Generate year data organized by months
  const yearData = useMemo(() => {
    const yearStart = startOfYear(new Date(selectedYear, 0, 1));
    const yearEnd = endOfYear(new Date(selectedYear, 11, 31));
    
    const allDays = eachDayOfInterval({ start: yearStart, end: yearEnd });
    
    // Group by months
    const monthsData: any[] = [];
    
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const monthDays = allDays.filter(day => day.getMonth() === monthIndex);
      
      // Create weeks array for this month
      const weeks: any[] = [];
      let currentWeek: any[] = [];
      
      monthDays.forEach((day, index) => {
        const dayOfWeek = getDay(day);
        
        // Start new week on Sunday
        if (dayOfWeek === 0 && currentWeek.length > 0) {
          weeks.push(currentWeek);
          currentWeek = [];
        }
        
        // Fill empty days at start of month
        if (index === 0 && dayOfWeek > 0) {
          for (let i = 0; i < dayOfWeek; i++) {
            currentWeek.push(null);
          }
        }
        
        const dateKey = format(day, "yyyy-MM-dd");
        const isFuture = isAfter(day, today);
        const progress = isFuture ? 0 : getProgress(dateKey);
        const hasBonus = false; // TODO: Add bonus logic
        
        currentWeek.push({
          date: day,
          dateKey,
          progress,
          isFuture,
          hasBonus,
          color: isFuture ? "#1C2128" : getColorByPercentage(progress, hasBonus),
        });
      });
      
      // Add last week
      if (currentWeek.length > 0) {
        // Fill remaining days in week
        while (currentWeek.length < 7) {
          currentWeek.push(null);
        }
        weeks.push(currentWeek);
      }
      
      monthsData.push({
        monthIndex,
        monthName: MONTH_NAMES[monthIndex],
        weeks,
      });
    }
    
    return monthsData;
  }, [selectedYear, getProgress, today]);

  // Calculate stats
  const stats = useMemo(() => {
    let totalDays = 0;
    let perfectDays = 0;
    let activeDays = 0;
    let totalProgress = 0;
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Collect all days in chronological order
    const allDays: any[] = [];
    yearData.forEach(month => {
      month.weeks.forEach((week: any[]) => {
        week.forEach(day => {
          if (day && !day.isFuture) {
            allDays.push(day);
          }
        });
      });
    });

    // Sort by date
    allDays.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Calculate streaks
    allDays.forEach((day, index) => {
      totalDays++;
      totalProgress += day.progress;
      if (day.progress === 100) {
        perfectDays++;
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
      if (day.progress > 0) activeDays++;
    });

    // Check if current streak is still active (last day was perfect)
    if (allDays.length > 0) {
      const lastDay = allDays[allDays.length - 1];
      if (lastDay.progress === 100) {
        currentStreak = tempStreak;
      }
    }

    return {
      totalDays,
      perfectDays,
      activeDays,
      avgProgress: totalDays > 0 ? Math.round(totalProgress / totalDays) : 0,
      currentStreak,
      longestStreak,
    };
  }, [yearData]);

  const toggleTooltip = (day: any) => {
    if (!day || day.isFuture) return;
    
    if (tooltipVisible) {
      setTooltipVisible(false);
      return;
    }
    
    setTooltipData({
      date: format(day.date, "EEEE, MMMM dd, yyyy"),
      percent: day.progress,
    });
    setTooltipVisible(true);
  };

  const hideTooltip = () => {
    setTooltipVisible(false);
  };

  const goToPreviousYear = () => {
    if (selectedYear > earliestYear) {
      setSelectedYear(selectedYear - 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const goToNextYear = () => {
    if (selectedYear < currentYear) {
      setSelectedYear(selectedYear + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <View style={styles.container}>
      {/* Year Selector */}
      <View style={styles.yearSelector}>
        <Pressable
          onPress={goToPreviousYear}
          style={[
            styles.yearButton,
            selectedYear <= earliestYear && styles.yearButtonDisabled,
          ]}
          disabled={selectedYear <= earliestYear}
        >
          <Text
            style={[
              styles.yearButtonText,
              selectedYear <= earliestYear && styles.yearButtonTextDisabled,
            ]}
          >
            ◀
          </Text>
        </Pressable>

        <Text style={styles.yearText}>{selectedYear}</Text>

        <Pressable
          onPress={goToNextYear}
          style={[
            styles.yearButton,
            selectedYear >= currentYear && styles.yearButtonDisabled,
          ]}
          disabled={selectedYear >= currentYear}
        >
          <Text
            style={[
              styles.yearButtonText,
              selectedYear >= currentYear && styles.yearButtonTextDisabled,
            ]}
          >
            ▶
          </Text>
        </Pressable>
      </View>

      {/* Stats Header */}
      <View style={styles.statsHeader}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.activeDays}</Text>
            <Text style={styles.statLabel}>active</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.perfectDays}</Text>
            <Text style={styles.statLabel}>perfect</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.currentStreak}</Text>
            <Text style={styles.statLabel}>current 🔥</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.longestStreak}</Text>
            <Text style={styles.statLabel}>longest 🏆</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.avgProgress}%</Text>
            <Text style={styles.statLabel}>avg</Text>
          </View>
        </View>
      </View>

      {/* Heatmap */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        style={styles.scrollView}
      >
        <View style={styles.heatmapContainer}>
          {/* Day Labels */}
          <View style={styles.dayLabelsColumn}>
            <View style={styles.monthLabelSpacer} />
            {DAY_NAMES.map((dayName) => (
              <View key={dayName} style={styles.dayLabelRow}>
                <Text style={styles.dayText}>{dayName}</Text>
              </View>
            ))}
          </View>

          {/* Months Grid */}
          <View style={styles.monthsContainer}>
            {yearData.map((month, monthIndex) => (
              <View key={monthIndex} style={styles.monthColumn}>
                {/* Month Label */}
                <View style={styles.monthLabelContainer}>
                  <Text style={styles.monthText}>{month.monthName}</Text>
                </View>

                {/* Weeks Grid */}
                <View style={styles.weeksGrid}>
                  {month.weeks.map((week: any[], weekIndex: number) => (
                    <View key={weekIndex} style={styles.weekColumn}>
                      {week.map((day, dayIndex) => (
                        <Pressable
                          key={dayIndex}
                          onPress={(e) => {
                            e.stopPropagation();
                            if (day) toggleTooltip(day);
                          }}
                          style={[
                            styles.cell,
                            {
                              backgroundColor: day ? day.color : "transparent",
                              opacity: day && day.isFuture ? 0.3 : 1,
                            },
                          ]}
                        />
                      ))}
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Less</Text>
        <View style={styles.legendContainer}>
          {[0, 12, 37, 62, 87, 100].map((percent, index) => (
            <View
              key={index}
              style={[
                styles.legendBox,
                { backgroundColor: getColorByPercentage(percent) },
              ]}
            />
          ))}
          <View
            style={[
              styles.legendBox,
              { backgroundColor: "#FFD700", marginLeft: 4 },
            ]}
          />
        </View>
        <Text style={styles.footerText}>More</Text>
      </View>

      {/* Tooltip */}
      {tooltipVisible && (
        <Pressable
          style={styles.tooltipOverlay}
          onPress={hideTooltip}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.tooltip}>
              <Text style={styles.tooltipDate}>{tooltipData.date}</Text>
              <Text style={styles.tooltipPercent}>
                {tooltipData.percent}% completion
              </Text>
            </View>
          </Pressable>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0D1117",
    padding: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  yearSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    gap: 16,
  },

  yearButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#161B22",
    justifyContent: "center",
    alignItems: "center",
  },

  yearButtonDisabled: {
    backgroundColor: "#0A0A0A",
  },

  yearButtonText: {
    color: "#C9D1D9",
    fontSize: 14,
    fontWeight: "600",
  },

  yearButtonTextDisabled: {
    color: "#30363D",
  },

  yearText: {
    color: "#C9D1D9",
    fontSize: 20,
    fontWeight: "800",
  },

  statsHeader: {
    marginBottom: 16,
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#161B22",
    borderRadius: 8,
    padding: 10,
  },

  statItem: {
    alignItems: "center",
  },

  statValue: {
    color: "#57FF7A",
    fontSize: 18,
    fontWeight: "800",
  },

  statLabel: {
    color: "#8B949E",
    fontSize: 10,
    marginTop: 2,
  },

  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#30363D",
  },

  scrollView: {
    marginBottom: 12,
  },

  heatmapContainer: {
    flexDirection: "row",
  },

  dayLabelsColumn: {
    marginRight: 8,
  },

  monthLabelSpacer: {
    height: 24,
    marginBottom: 4,
  },

  dayLabelRow: {
    height: CELL_SIZE + 4,
    justifyContent: "center",
  },

  dayText: {
    color: "#8B949E",
    fontSize: 10,
    fontWeight: "500",
  },

  monthsContainer: {
    flexDirection: "row",
    gap: 8,
  },

  monthColumn: {
    alignItems: "center",
  },

  monthLabelContainer: {
    height: 24,
    justifyContent: "center",
    marginBottom: 4,
  },

  monthText: {
    color: "#8B949E",
    fontSize: 10,
    fontWeight: "600",
  },

  weeksGrid: {
    flexDirection: "row",
    gap: 4,
  },

  weekColumn: {
    gap: 4,
  },

  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#0D1117",
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 4,
  },

  footerText: {
    color: "#8B949E",
    fontSize: 10,
    marginHorizontal: 4,
  },

  legendContainer: {
    flexDirection: "row",
    gap: 3,
  },

  legendBox: {
    width: 13,
    height: 13,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#0D1117",
  },

  tooltipOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  tooltip: {
    backgroundColor: "#1C2128",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#30363D",
    minWidth: 200,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 10,
  },

  tooltipDate: {
    color: "#C9D1D9",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },

  tooltipPercent: {
    color: "#57FF7A",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
});