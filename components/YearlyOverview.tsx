import { useTracker } from "@/context/TrackerContext";
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  isAfter,
  isSameDay,
  startOfDay,
  startOfMonth,
  subDays
} from "date-fns";
import * as Haptics from "expo-haptics";
import { useMemo, useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const MONTHS = [
  ["January", "February"],
  ["March", "April"],
  ["May", "June"],
  ["July", "August"],
  ["September", "October"],
  ["November", "December"],
];

const SCREEN_WIDTH = Dimensions.get("window").width;

const CARDS_PER_ROW = 2;
const CARD_PADDING = 12;
const COLUMN_GAP = 12;
const TOTAL_HORIZONTAL_SPACING = (CARD_PADDING * 2) + COLUMN_GAP;
const CARD_WIDTH = (SCREEN_WIDTH - TOTAL_HORIZONTAL_SPACING) / CARDS_PER_ROW - 12;
const CARD_HEIGHT = CARD_WIDTH * 0.95;

const isSmallScreen = SCREEN_WIDTH < 400;
const CELL_WIDTH = isSmallScreen ? 40 : 45;
const DATE_CELL_WIDTH = isSmallScreen ? 55 : 60;
const PERCENT_CELL_WIDTH = isSmallScreen ? 36 : 40;
const EMOJI_CELL_WIDTH = isSmallScreen ? 32 : 36;
const NOTES_CELL_WIDTH = isSmallScreen ? 70 : 80;

export default function YearlyOverview() {
  const {
    trackedHabits,
    trackerData,
    toggleCompletion,
    updateNote,
    getProgress,
    getDayEntry,
    isLoading,
  } = useTracker();
  
  const today = startOfDay(new Date());
  const yesterday = subDays(today, 1);
  const currentYear = today.getFullYear();
  
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const monthlyProgress = useMemo(() => {
    const progress: Record<string, number> = {};
    const allMonths = MONTHS.flat();

    allMonths.forEach((monthName, monthIndex) => {
      const monthDate = new Date(currentYear, monthIndex, 1);
      
      if (isAfter(monthDate, today)) {
        progress[monthName] = 0;
        return;
      }

      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      const monthDays = eachDayOfInterval({ 
        start: monthStart, 
        end: monthEnd 
      });

      let totalProgress = 0;
      let validDays = 0;

      monthDays.forEach((day) => {
        if (!isAfter(day, today)) {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayProgress = getProgress(dateKey);
          totalProgress += dayProgress;
          validDays++;
        }
      });

      progress[monthName] = validDays > 0 
        ? Math.round(totalProgress / validDays) 
        : 0;
    });

    return progress;
  }, [trackedHabits, today, currentYear]);

  // ✅ FIXED: Current Streak - checks backwards from today
  const getMonthStreakData = (monthIndex: number) => {
    const monthDate = new Date(currentYear, monthIndex, 1);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    
    const monthDays = eachDayOfInterval({ 
      start: monthStart, 
      end: monthEnd 
    });

    let longestStreak = 0;
    let tempStreak = 0;
    let perfectDays = 0;
    let totalDays = 0;

    // Calculate longest streak and perfect days
    monthDays.forEach((day) => {
      if (!isAfter(day, today)) {
        totalDays++;
        const dateKey = format(day, "yyyy-MM-dd");
        const dayProgress = getProgress(dateKey);
        
        if (dayProgress === 100) {
          perfectDays++;
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      }
    });

    // ✅ Calculate current streak by checking backwards from today
    let currentStreak = 0;
    
    // Only count if today is in the selected month
    const isTodayInMonth = today >= monthStart && today <= monthEnd;
    
    if (isTodayInMonth && trackedHabits.length > 0) {
      // Start from today and check backwards
      let checkDate = startOfDay(new Date(today));
      
      while (checkDate >= monthStart) {
        const dateKey = format(checkDate, "yyyy-MM-dd");
        const dayProgress = getProgress(dateKey);
        
        // Debug: Uncomment to see what's happening
        // console.log(`Checking ${dateKey}: ${dayProgress}%`);
        
        if (dayProgress === 100) {
          currentStreak++;
          checkDate = subDays(checkDate, 1);
        } else {
          break; // Streak broken
        }
      }
    }

    return {
      currentStreak,
      longestStreak,
      perfectDays,
      totalDays,
      averageProgress: monthlyProgress[MONTHS.flat()[monthIndex]],
    };
  };

  const getProgressColor = (percent: number) => {
    if (percent === 0) return "#5A5A58";
    if (percent < 50) return "#EF5350";
    if (percent < 70) return "#FFA726";
    if (percent < 90) return "#66BB6A";
    return "#4CAF50";
  };

  function getDayEmoji(progress: number) {
    if (progress < 50) return "🤨";
    if (progress < 70) return "😊";
    if (progress < 100) return "😄";
    return "🥳";
  }

  function isEditable(day: Date): boolean {
    return isSameDay(day, today) || isSameDay(day, yesterday);
  }

  function handleToggle(dateKey: string, habitId: string) {
    toggleCompletion(dateKey, habitId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>📅 Monthly Overview</Text>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  // Monthly Detail View with Table
  if (selectedMonth !== null) {
    const monthName = MONTHS.flat()[selectedMonth];
    const monthDate = new Date(currentYear, selectedMonth, 1);
    const isFutureMonth = isAfter(monthDate, today);
    const streakData = getMonthStreakData(selectedMonth);
    
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return (
      <View style={styles.container}>
        <View style={styles.detailHeader}>
          <Pressable onPress={() => setSelectedMonth(null)} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Gallery view</Text>
          </Pressable>
        </View>

        <Text style={styles.detailTitle}>{monthName} {currentYear}</Text>

        {isFutureMonth ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>Future Month</Text>
            <Text style={styles.emptySubtitle}>
              This month hasn't started yet!
            </Text>
          </View>
        ) : trackedHabits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>No habits tracked</Text>
            <Text style={styles.emptySubtitle}>
              Start tracking habits to see your progress!
            </Text>
          </View>
        ) : (
          <>
            {/* ✅ CENTERED TABLE */}
            <View style={styles.tableWrapper}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={true}
                contentContainerStyle={styles.tableScrollContent}
              >
                <View style={styles.table}>
                  {/* HEADER ROW */}
                  <View style={styles.tableRow}>
                    <View style={[styles.cell, styles.headerCell, { width: DATE_CELL_WIDTH }]}>
                      <Text style={styles.headerText}>Day</Text>
                    </View>

                    {trackedHabits.map((habit) => (
                      <View
                        key={habit.id}
                        style={[styles.cell, styles.headerCell, { width: CELL_WIDTH }]}
                      >
                        <Text style={styles.habitEmoji}>{habit.emoji}</Text>
                      </View>
                    ))}

                    <View style={[styles.cell, styles.headerCell, { width: PERCENT_CELL_WIDTH }]}>
                      <Text style={styles.headerText}>%</Text>
                    </View>

                    <View style={[styles.cell, styles.headerCell, { width: EMOJI_CELL_WIDTH }]}>
                      <Text style={styles.headerText}>😊</Text>
                    </View>

                    <View style={[styles.cell, styles.headerCell, styles.lastCell, { width: NOTES_CELL_WIDTH }]}>
                      <Text style={styles.headerText}>Notes</Text>
                    </View>
                  </View>

                  {/* DATA ROWS */}
                  <ScrollView
                    style={styles.dataScroll}
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled={true}
                  >
                    {monthDays.map((day, rowIndex) => {
                      const key = format(day, "yyyy-MM-dd");
                      const isTodayRow = isSameDay(day, today);
                      const isYesterdayRow = isSameDay(day, yesterday);
                      const isFuture = isAfter(day, today);
                      const canEdit = isEditable(day);
                      const progress = getProgress(key);
                      const isEvenRow = rowIndex % 2 === 0;
                      const entry = getDayEntry(key);

                      return (
                        <View
                          key={key}
                          style={[
                            styles.tableRow,
                            isEvenRow && styles.evenRow,
                            isTodayRow && styles.todayRow,
                            isYesterdayRow && styles.yesterdayRow,
                          ]}
                        >
                          <View style={[styles.cell, { width: DATE_CELL_WIDTH }]}>
                            <Text style={[styles.dateText, isTodayRow && styles.todayText]}>
                              {format(day, "EEE")}
                            </Text>
                            <Text style={[styles.dateNumber, isTodayRow && styles.todayText]}>
                              {format(day, "dd")}
                            </Text>
                            {isTodayRow && (
                              <View style={styles.todayBadge}>
                                <Text style={styles.todayBadgeText}>TODAY</Text>
                              </View>
                            )}
                          </View>

                          {trackedHabits.map((habit) => {
                            const done = entry.completedHabitIds?.includes(habit.id) || false;

                            return (
                              <Pressable
                                key={habit.id}
                                disabled={!canEdit}
                                onPress={() => handleToggle(key, habit.id)}
                                style={[
                                  styles.cell,
                                  { width: CELL_WIDTH },
                                  done && styles.completedCell,
                                  !canEdit && styles.disabledCell,
                                ]}
                              >
                                <Text style={styles.checkIcon}>
                                  {isFuture ? "—" : done ? "✅" : canEdit ? "⬜" : "❌"}
                                </Text>
                              </Pressable>
                            );
                          })}

                          <View style={[styles.cell, { width: PERCENT_CELL_WIDTH }]}>
                            <Text
                              style={[
                                styles.percentText,
                                progress === 100 && styles.fullProgress,
                                progress >= 70 && progress < 100 && styles.highProgress,
                                progress > 0 && progress < 50 && styles.lowProgress,
                              ]}
                            >
                              {isFuture ? "—" : `${progress}%`}
                            </Text>
                          </View>

                          <View style={[styles.cell, { width: EMOJI_CELL_WIDTH }]}>
                            <Text style={styles.emojiText}>
                              {isFuture ? "—" : getDayEmoji(progress)}
                            </Text>
                          </View>

                          <View style={[styles.cell, styles.lastCell, { width: NOTES_CELL_WIDTH }]}>
                            <TextInput
                              value={entry.note || ""}
                              editable={canEdit}
                              placeholder={canEdit ? "Note..." : "—"}
                              placeholderTextColor="#999"
                              onChangeText={(text) => updateNote(key, text)}
                              style={[styles.notesInput, !canEdit && styles.disabledInput]}
                              multiline
                              numberOfLines={2}
                              maxLength={200}
                              textAlignVertical="top"
                            />
                          </View>
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>
              </ScrollView>
            </View>

            {/* Streak Statistics Below Table */}
            <View style={styles.streakSection}>
              <Text style={styles.streakSectionTitle}>📊 Month Statistics</Text>
              
              <View style={styles.streakContainer}>
                <View style={[styles.streakCard, styles.currentStreakCard]}>
                  <Text style={styles.streakIcon}>🔥</Text>
                  <Text style={[styles.streakValue, styles.currentStreakValue]}>
                    {streakData.currentStreak}
                  </Text>
                  <Text style={[styles.streakLabel, styles.currentStreakLabel]}>
                    Current Streak
                  </Text>
                  <Text style={[styles.streakSubtext, styles.currentStreakSubtext]}>
                    {streakData.currentStreak > 0 ? "days in a row!" : "from today back"}
                  </Text>
                </View>

                <View style={[styles.streakCard, styles.longestStreakCard]}>
                  <Text style={styles.streakIcon}>🔥</Text>
                  <Text style={[styles.streakValue, styles.longestStreakValue]}>
                    {streakData.longestStreak}
                  </Text>
                  <Text style={[styles.streakLabel, styles.longestStreakLabel]}>
                    Longest Streak
                  </Text>
                  <Text style={[styles.streakSubtext, styles.longestStreakSubtext]}>
                    in this month
                  </Text>
                </View>

                <View style={[styles.streakCard, styles.perfectDaysCard]}>
                  <Text style={styles.streakIcon}>✅</Text>
                  <Text style={[styles.streakValue, styles.perfectDaysValue]}>
                    {streakData.perfectDays}
                  </Text>
                  <Text style={[styles.streakLabel, styles.perfectDaysLabel]}>
                    Perfect Days
                  </Text>
                  <Text style={[styles.streakSubtext, styles.perfectDaysSubtext]}>
                    out of {streakData.totalDays}
                  </Text>
                </View>

                <View style={[styles.streakCard, styles.avgProgressCard]}>
                  <Text style={styles.streakIcon}>📈</Text>
                  <Text style={[styles.streakValue, styles.avgProgressValue]}>
                    {streakData.averageProgress}%
                  </Text>
                  <Text style={[styles.streakLabel, styles.avgProgressLabel]}>
                    Avg Progress
                  </Text>
                  <Text style={[styles.streakSubtext, styles.avgProgressSubtext]}>
                    for the month
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}
      </View>
    );
  }

  // Gallery View
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📅 Monthly Overview</Text>
        <View style={styles.galleryBadge}>
          <Text style={styles.galleryBadgeText}>Gallery view</Text>
        </View>
      </View>

      {trackedHabits.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>No habits tracked yet</Text>
          <Text style={styles.emptySubtitle}>
            Start tracking habits to see your yearly progress!
          </Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={true}
        >
          {MONTHS.map((monthPair, rowIndex) => (
            <View key={rowIndex} style={styles.monthRow}>
              {monthPair.map((month) => {
                const monthIndex = MONTHS.flat().indexOf(month);
                const percent = monthlyProgress[month];
                const progressColor = getProgressColor(percent);
                const monthDate = new Date(currentYear, monthIndex, 1);
                const isFutureMonth = isAfter(monthDate, today);

                return (
                  <Pressable
                    key={month}
                    onPress={() => {
                      setSelectedMonth(monthIndex);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }}
                    style={({ pressed }) => [
                      styles.card,
                      pressed && styles.cardPressed,
                    ]}
                  >
                    <View style={styles.monthImageContainer}>
                      <Text style={styles.monthImage}>{month}</Text>
                    </View>
                    
                    <View style={styles.cardFooter}>
                      <View style={styles.monthInfo}>
                        <Text style={styles.cardMonthIcon}>📅</Text>
                        <Text style={styles.cardMonthText}>{month}</Text>
                      </View>
                      
                      <View style={styles.progressRow}>
                        <View style={styles.progressBarBg}>
                          <View
                            style={[
                              styles.progressBarFill,
                              { 
                                width: `${percent}%`,
                                backgroundColor: progressColor,
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.percentTextCard}>
                          {isFutureMonth ? "0%" : `${percent}%`}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 12,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    minHeight: 400,
  },

  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },

  loadingText: {
    color: "#666",
    fontSize: 14,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1a1a2e",
  },

  galleryBadge: {
    backgroundColor: "#3949AB",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },

  galleryBadgeText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "600",
  },

  detailHeader: {
    marginBottom: 8,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },

  backButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3949AB",
  },

  detailTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1a1a2e",
    textAlign: "center",
    marginBottom: 16,
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },

  emptySubtitle: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
  },

  scrollView: {
    flex: 1,
  },

  monthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 12,
  },

  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#3A3A38",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  cardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },

  monthImageContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },

  monthImage: {
    fontSize: SCREEN_WIDTH < 400 ? 13 : 15,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    paddingHorizontal: 4,
  },

  cardFooter: {
    backgroundColor: "#3A3A38",
    padding: SCREEN_WIDTH < 400 ? 8 : 9,
  },

  monthInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  cardMonthIcon: {
    fontSize: SCREEN_WIDTH < 400 ? 10 : 11,
    marginRight: 3,
  },

  cardMonthText: {
    fontSize: SCREEN_WIDTH < 400 ? 11 : 12,
    fontWeight: "600",
    color: "#FFF",
  },

  progressRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  progressBarBg: {
    flex: 1,
    height: SCREEN_WIDTH < 400 ? 5 : 6,
    backgroundColor: "#5A5A58",
    borderRadius: 3,
    overflow: "hidden",
    marginRight: 6,
  },

  progressBarFill: {
    height: "100%",
  },

  percentTextCard: {
    color: "#FFF",
    fontSize: SCREEN_WIDTH < 400 ? 10 : 11,
    fontWeight: "600",
    minWidth: SCREEN_WIDTH < 400 ? 28 : 30,
    textAlign: "right",
  },

  // ✅ CENTERED TABLE
  tableWrapper: {
    alignItems: "center",
    marginBottom: 16,
  },

  tableScrollContent: {
    alignItems: "center",
  },

  table: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    overflow: "hidden",
  },

  dataScroll: {
    maxHeight: 320,
  },

  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },

  evenRow: {
    backgroundColor: "#FAFAFA",
  },

  todayRow: {
    backgroundColor: "#E8F5E9",
  },

  yesterdayRow: {
    backgroundColor: "#FFF8E1",
  },

  cell: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 3,
    borderRightWidth: 1,
    borderRightColor: "#E8E8E8",
  },

  lastCell: {
    borderRightWidth: 0,
  },

  headerCell: {
    backgroundColor: "#3949AB",
    paddingVertical: 10,
  },

  headerText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 10,
    textAlign: "center",
  },

  habitEmoji: {
    fontSize: 16,
  },

  completedCell: {
    backgroundColor: "rgba(76, 175, 80, 0.15)",
  },

  disabledCell: {
    opacity: 0.6,
  },

  dateText: {
    fontWeight: "500",
    fontSize: 9,
    color: "#666",
  },

  dateNumber: {
    fontWeight: "700",
    fontSize: 12,
    color: "#333",
  },

  todayText: {
    color: "#2E7D32",
  },

  todayBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    marginTop: 1,
  },

  todayBadgeText: {
    color: "#FFF",
    fontSize: 7,
    fontWeight: "700",
  },

  checkIcon: {
    fontSize: 14,
  },

  percentText: {
    fontWeight: "700",
    fontSize: 11,
    color: "#666",
  },

  fullProgress: {
    color: "#2E7D32",
  },

  highProgress: {
    color: "#F57C00",
  },

  lowProgress: {
    color: "#D32F2F",
  },

  emojiText: {
    fontSize: 14,
  },

  notesInput: {
    flex: 1,
    fontSize: 9,
    color: "#333",
    paddingHorizontal: 2,
    paddingVertical: 2,
    width: "100%",
    minHeight: 30,
    maxHeight: 50,
  },

  disabledInput: {
    color: "#999",
  },

  streakSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },

  streakSectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },

  streakContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },

  streakCard: {
    width: "48%",
    borderRadius: 10,
    padding: SCREEN_WIDTH < 400 ? 10 : 12,
    alignItems: "center",
    borderWidth: 1,
  },

  streakIcon: {
    fontSize: 20,
    marginBottom: 2,
  },

  streakValue: {
    fontSize: SCREEN_WIDTH < 400 ? 22 : 24,
    fontWeight: "800",
    marginBottom: 2,
  },

  streakLabel: {
    fontSize: SCREEN_WIDTH < 400 ? 11 : 12,
    fontWeight: "600",
    marginBottom: 1,
  },

  streakSubtext: {
    fontSize: SCREEN_WIDTH < 400 ? 8 : 9,
    textAlign: "center",
  },

  currentStreakCard: {
    backgroundColor: "#FFF3E0",
    borderColor: "#FFB74D",
  },
  currentStreakValue: {
    color: "#F57C00",
  },
  currentStreakLabel: {
    color: "#E65100",
  },
  currentStreakSubtext: {
    color: "#F57C00",
  },

  longestStreakCard: {
    backgroundColor: "#FFEBEE",
    borderColor: "#FF8A80",
  },
  longestStreakValue: {
    color: "#D84315",
  },
  longestStreakLabel: {
    color: "#BF360C",
  },
  longestStreakSubtext: {
    color: "#D84315",
  },

  perfectDaysCard: {
    backgroundColor: "#E8F5E9",
    borderColor: "#81C784",
  },
  perfectDaysValue: {
    color: "#2E7D32",
  },
  perfectDaysLabel: {
    color: "#1B5E20",
  },
  perfectDaysSubtext: {
    color: "#388E3C",
  },

  avgProgressCard: {
    backgroundColor: "#FFF9C4",
    borderColor: "#FFD54F",
  },
  avgProgressValue: {
    color: "#F57F17",
  },
  avgProgressLabel: {
    color: "#F57F17",
  },
  avgProgressSubtext: {
    color: "#FBC02D",
  },
});