import { useTracker } from "@/context/TrackerContext";
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  isAfter,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  subDays,
} from "date-fns";
import * as Haptics from "expo-haptics";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

export default function MonthlyOverview() {
  const { width } = useWindowDimensions();
  const isMobile = width < 500;
  const isSmallMobile = width < 380;

  const CELL_WIDTH = isSmallMobile ? 40 : isMobile ? 45 : 50;
  const DATE_CELL_WIDTH = isSmallMobile ? 55 : isMobile ? 60 : 70;
  const PERCENT_CELL_WIDTH = isSmallMobile ? 36 : isMobile ? 40 : 50;
  const EMOJI_CELL_WIDTH = isSmallMobile ? 32 : isMobile ? 36 : 45;
  const NOTES_CELL_WIDTH = isSmallMobile ? 70 : isMobile ? 80 : 100;

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

  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipText, setTooltipText] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const monthDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const celebrationAnim = useRef(new Animated.Value(0)).current;
  const [celebratingDay, setCelebratingDay] = useState<string | null>(null);

  function goToPrevMonth() {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function goToNextMonth() {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function goToCurrentMonth() {
    setCurrentMonth(new Date());
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

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

  function showTooltip(text: string, event: any) {
    const { pageX, pageY } = event.nativeEvent;
    setTooltipText(text);
    setTooltipPosition({ x: pageX, y: pageY - 50 });
    setTooltipVisible(true);
  }

  function hideTooltip() {
    setTooltipVisible(false);
  }

  useEffect(() => {
    monthDays.forEach((day) => {
      const key = format(day, "yyyy-MM-dd");
      const progress = getProgress(key);

      if (progress === 100 && celebratingDay !== key && !isAfter(day, today)) {
        setCelebratingDay(key);
        celebrationAnim.setValue(0);

        Animated.timing(celebrationAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.back(1.6)),
          useNativeDriver: true,
        }).start(() => {
          setTimeout(() => setCelebratingDay(null), 1500);
        });
      }
    });
  }, [trackerData, trackedHabits]);

  const monthStats = useMemo(() => {
    let totalDays = 0;
    let completedDays = 0;
    let totalProgress = 0;

    monthDays.forEach((day) => {
      if (!isAfter(day, today)) {
        totalDays++;
        const progress = getProgress(format(day, "yyyy-MM-dd"));
        totalProgress += progress;
        if (progress === 100) completedDays++;
      }
    });

    return {
      totalDays,
      completedDays,
      averageProgress: totalDays > 0 ? Math.round(totalProgress / totalDays) : 0,
    };
  }, [monthDays, trackerData, trackedHabits, today]);

  const isCurrentMonth = isSameMonth(currentMonth, new Date());

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={[styles.title, isMobile && styles.titleMobile]}>
          📊 Monthly Overview
        </Text>

        <View style={styles.monthNav}>
          <Pressable onPress={goToPrevMonth} style={styles.navBtn}>
            <Text style={styles.navBtnText}>◀</Text>
          </Pressable>

          <Pressable onPress={goToCurrentMonth} style={styles.monthDisplay}>
            <Text style={[styles.monthText, isMobile && styles.monthTextMobile]}>
              {format(currentMonth, isMobile ? "MMM yyyy" : "MMMM yyyy")}
            </Text>
            {!isCurrentMonth && (
              <Text style={styles.currentMonthHint}>Tap for today</Text>
            )}
          </Pressable>

          <Pressable
            onPress={goToNextMonth}
            style={[styles.navBtn, isCurrentMonth && styles.navBtnDisabled]}
            disabled={isCurrentMonth}
          >
            <Text style={[styles.navBtnText, isCurrentMonth && styles.navBtnTextDisabled]}>
              ▶
            </Text>
          </Pressable>
        </View>
      </View>

      {/* STATS */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: "#E8F5E9" }]}>
          <Text style={[styles.statValue, isMobile && styles.statValueMobile]}>
            {monthStats.completedDays}
          </Text>
          <Text style={[styles.statLabel, isMobile && styles.statLabelMobile]}>
            Perfect Days
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#E3F2FD" }]}>
          <Text style={[styles.statValue, isMobile && styles.statValueMobile]}>
            {monthStats.averageProgress}%
          </Text>
          <Text style={[styles.statLabel, isMobile && styles.statLabelMobile]}>
            Avg Progress
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#FFF3E0" }]}>
          <Text style={[styles.statValue, isMobile && styles.statValueMobile]}>
            {trackedHabits.length}
          </Text>
          <Text style={[styles.statLabel, isMobile && styles.statLabelMobile]}>
            Habits
          </Text>
        </View>
      </View>

      {/* TABLE - CENTERED */}
      {trackedHabits.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyTitle}>No habits being tracked</Text>
          <Text style={styles.emptySubtitle}>
            Add habits in the Daily Tracker to see them here!
          </Text>
        </View>
      ) : (
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
                  <Pressable
                    key={habit.id}
                    style={[styles.cell, styles.headerCell, { width: CELL_WIDTH }]}
                    onLongPress={(e) => showTooltip(habit.title, e)}
                    onPressOut={hideTooltip}
                    delayLongPress={200}
                  >
                    <Text style={styles.habitEmoji}>{habit.emoji}</Text>
                  </Pressable>
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
                            onLongPress={(e) => showTooltip(habit.title, e)}
                            onPressOut={hideTooltip}
                            delayLongPress={300}
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

                      {celebratingDay === key && progress === 100 && (
                        <Animated.View
                          style={[
                            styles.celebrateBadge,
                            {
                              opacity: celebrationAnim,
                              transform: [{ scale: celebrationAnim }],
                            },
                          ]}
                        >
                          <Text style={styles.celebrateText}>🎉 Perfect! 🎊</Text>
                        </Animated.View>
                      )}
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      )}

      {/* TOOLTIP */}
      <Modal
        visible={tooltipVisible}
        transparent
        animationType="fade"
        onRequestClose={hideTooltip}
      >
        <Pressable style={styles.tooltipOverlay} onPress={hideTooltip}>
          <View
            style={[
              styles.tooltip,
              { left: Math.max(10, tooltipPosition.x - 60), top: tooltipPosition.y },
            ]}
          >
            <Text style={styles.tooltipText}>{tooltipText}</Text>
          </View>
        </Pressable>
      </Modal>

      {/* LEGEND */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <Text style={styles.legendIcon}>✅</Text>
          <Text style={styles.legendText}>Done</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={styles.legendIcon}>⬜</Text>
          <Text style={styles.legendText}>Edit</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={styles.legendIcon}>❌</Text>
          <Text style={styles.legendText}>Missed</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={styles.legendIcon}>—</Text>
          <Text style={styles.legendText}>Future</Text>
        </View>
      </View>
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
  },

  loadingContainer: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
  },

  loadingText: {
    color: "#666",
    fontSize: 14,
  },

  header: {
    marginBottom: 12,
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1a1a2e",
    textAlign: "center",
    marginBottom: 10,
  },

  titleMobile: {
    fontSize: 18,
  },

  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E8E8E8",
    justifyContent: "center",
    alignItems: "center",
  },

  navBtnDisabled: {
    backgroundColor: "#F5F5F5",
  },

  navBtnText: {
    fontSize: 12,
    color: "#333",
    fontWeight: "600",
  },

  navBtnTextDisabled: {
    color: "#CCC",
  },

  monthDisplay: {
    alignItems: "center",
    paddingHorizontal: 12,
  },

  monthText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },

  monthTextMobile: {
    fontSize: 14,
  },

  currentMonthHint: {
    fontSize: 9,
    color: "#4CAF50",
    marginTop: 1,
  },

  statsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },

  statCard: {
    flex: 1,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },

  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#333",
  },

  statValueMobile: {
    fontSize: 18,
  },

  statLabel: {
    fontSize: 10,
    color: "#666",
    marginTop: 2,
    fontWeight: "500",
  },

  statLabelMobile: {
    fontSize: 9,
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 30,
  },

  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
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
    paddingHorizontal: 16,
  },

  // ✅ FIX: Center the table
  tableWrapper: {
    alignItems: "center",
    marginBottom: 10,
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

  celebrateBadge: {
    position: "absolute",
    left: "50%",
    top: "50%",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    elevation: 10,
    zIndex: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: "#FFF",
  },

  celebrateText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFF",
  },

  tooltipOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },

  tooltip: {
    position: "absolute",
    backgroundColor: "#333",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    maxWidth: 200,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  tooltipText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },

  legend: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 14,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },

  legendIcon: {
    fontSize: 12,
  },

  legendText: {
    fontSize: 10,
    color: "#666",
  },
});