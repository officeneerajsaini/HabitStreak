// components/DailyTracker.tsx

import { useTracker } from "@/context/TrackerContext";
import {
  addDays,
  format,
  isAfter,
  isSameDay,
  startOfDay,
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

/* ================= CONSTANTS ================= */

const CELL_WIDTH = 50;
const DATE_CELL_WIDTH = 80;
const PERCENT_CELL_WIDTH = 50;
const EMOJI_CELL_WIDTH = 45;
const NOTES_CELL_WIDTH = 100;

/* ================= HELPERS ================= */

function get7Days() {
  const today = startOfDay(new Date());
  return Array.from({ length: 7 }, (_, i) => addDays(today, i - 3));
}

/* ================= COMPONENT ================= */

export default function DailyTracker() {
  const { width } = useWindowDimensions();
  const isMobile = width < 500;

  const {
    trackedHabits,
    addTrackedHabit,
    deleteTrackedHabit,
    trackerData,
    toggleCompletion,
    updateNote,
    getProgress,
    getDayEntry,
    isLoading,
  } = useTracker();

  const days = useMemo(get7Days, []);
  const today = startOfDay(new Date());
  const yesterday = subDays(today, 1);

  /* ===== LOCAL STATE ===== */
  const [newHabitTitle, setNewHabitTitle] = useState("");
  const [newHabitEmoji, setNewHabitEmoji] = useState("");
  const [selectedDeleteId, setSelectedDeleteId] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Tooltip state
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipText, setTooltipText] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  /* ===== CELEBRATION ===== */
  const celebrationAnim = useRef(new Animated.Value(0)).current;
  const [celebratingDay, setCelebratingDay] = useState<string | null>(null);

  /* ================= HANDLERS ================= */

  function handleAddHabit() {
    if (!newHabitTitle.trim()) return;

    addTrackedHabit(newHabitTitle, newHabitEmoji || "📌");
    setNewHabitTitle("");
    setNewHabitEmoji("");
    setShowAddForm(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function handleDeleteHabit() {
    if (!selectedDeleteId) return;
    deleteTrackedHabit(selectedDeleteId);
    setSelectedDeleteId("");
    setShowDropdown(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }

  function handleToggle(dateKey: string, habitId: string) {
    toggleCompletion(dateKey, habitId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function isEditable(day: Date): boolean {
    return isSameDay(day, today) || isSameDay(day, yesterday);
  }

  function getDayEmoji(progress: number) {
    if (progress < 50) return "🤨";
    if (progress < 70) return "😊";
    if (progress < 100) return "😄";
    return "🥳";
  }

  // Show tooltip with habit name
  function showTooltip(text: string, event: any) {
    const { pageX, pageY } = event.nativeEvent;
    setTooltipText(text);
    setTooltipPosition({ x: pageX, y: pageY - 50 });
    setTooltipVisible(true);
  }

  function hideTooltip() {
    setTooltipVisible(false);
  }

  /* ===== CELEBRATION TRIGGER ===== */
  useEffect(() => {
    days.forEach((day) => {
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading tracker...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, isMobile && styles.titleMobile]}>
        📋 Daily Habit Tracker
      </Text>
      <Text style={styles.subtitle}>
        {trackedHabits.length} habit{trackedHabits.length !== 1 ? "s" : ""} being tracked • Long press emoji to see name
      </Text>

      {/* TABLE */}
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View style={styles.table}>
          {/* ===== HEADER ROW ===== */}
          <View style={styles.tableRow}>
            <View style={[styles.cell, styles.headerCell, styles.dateCell]}>
              <Text style={styles.headerText}>Day</Text>
            </View>

            {/* HABIT EMOJI HEADERS - Long press shows habit name */}
            {trackedHabits.map((habit) => (
              <Pressable
                key={habit.id}
                style={[styles.cell, styles.headerCell, styles.habitCell]}
                onLongPress={(e) => showTooltip(habit.title, e)}
                onPressOut={hideTooltip}
                delayLongPress={200}
              >
                <Text style={styles.habitEmoji}>{habit.emoji}</Text>
              </Pressable>
            ))}

            {trackedHabits.length === 0 && (
              <View style={[styles.cell, styles.headerCell, styles.habitCell, { width: 100 }]}>
                <Text style={styles.emptyHeaderText}>No habits</Text>
              </View>
            )}

            <View style={[styles.cell, styles.headerCell, styles.percentCell]}>
              <Text style={styles.headerText}>%</Text>
            </View>

            <View style={[styles.cell, styles.headerCell, styles.emojiCell]}>
              <Text style={styles.headerText}>😊</Text>
            </View>

            <View style={[styles.cell, styles.headerCell, styles.notesCell]}>
              <Text style={styles.headerText}>Notes</Text>
            </View>
          </View>

          {/* ===== DATA ROWS ===== */}
          {days.map((day, rowIndex) => {
            const key = format(day, "yyyy-MM-dd");
            const isToday = isSameDay(day, today);
            const isYesterday = isSameDay(day, yesterday);
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
                  isToday && styles.todayRow,
                  isYesterday && styles.yesterdayRow,
                ]}
              >
                {/* DATE CELL */}
                <View style={[styles.cell, styles.dateCell]}>
                  <Text style={[styles.dateText, isToday && styles.todayText]}>
                    {format(day, "EEE dd")}
                  </Text>
                  {isToday && <Text style={styles.todayBadge}>Today</Text>}
                </View>

                {/* HABIT CELLS */}
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
                        styles.habitCell,
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

                {trackedHabits.length === 0 && (
                  <View style={[styles.cell, styles.habitCell, { width: 100 }]}>
                    <Text style={styles.emptyText}>—</Text>
                  </View>
                )}

                {/* PROGRESS CELL */}
                <View style={[styles.cell, styles.percentCell]}>
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

                {/* EMOJI CELL */}
                <View style={[styles.cell, styles.emojiCell]}>
                  <Text style={styles.emojiText}>
                    {isFuture ? "—" : getDayEmoji(progress)}
                  </Text>
                </View>

                {/* NOTES CELL */}
                <View style={[styles.cell, styles.notesCell]}>
                  <TextInput
                    value={entry.note || ""}
                    editable={canEdit}
                    placeholder={canEdit ? "Note..." : "—"}
                    placeholderTextColor="#999"
                    onChangeText={(text) => updateNote(key, text)}
                    style={[
                      styles.notesInput,
                      !canEdit && styles.disabledInput,
                    ]}
                    maxLength={50}
                  />
                </View>

                {/* CELEBRATION - Centered Popup */}
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
                    <Text style={styles.celebrateText}>🎉 Great job! 🎊</Text>
                  </Animated.View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* ===== TOOLTIP MODAL ===== */}
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
              { 
                left: Math.max(10, Math.min(tooltipPosition.x - 60, width - 140)), 
                top: tooltipPosition.y 
              },
            ]}
          >
            <Text style={styles.tooltipText}>{tooltipText}</Text>
            <View style={styles.tooltipArrow} />
          </View>
        </Pressable>
      </Modal>

      {/* ===== ADD HABIT BUTTON ===== */}
      <Pressable
        onPress={() => setShowAddForm(!showAddForm)}
        style={[styles.toggleAddBtn, showAddForm && styles.toggleAddBtnActive]}
      >
        <Text style={styles.toggleAddBtnText}>
          {showAddForm ? "✕ Cancel" : "+ Add Habit to Track"}
        </Text>
      </Pressable>

      {/* ===== ADD FORM ===== */}
      {showAddForm && (
        <View style={styles.addForm}>
          <Text style={styles.addFormTitle}>🎯 Add Habit to Track</Text>

          <View style={styles.inputRow}>
            {/* Habit Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Habit Name</Text>
              <TextInput
                value={newHabitTitle}
                onChangeText={setNewHabitTitle}
                placeholder="e.g., Drink Water"
                placeholderTextColor="#999"
                style={styles.input}
                maxLength={30}
              />
            </View>

            {/* Simple Emoji Input - User types/pastes emoji from keyboard */}
            <View style={styles.emojiInputGroup}>
              <Text style={styles.inputLabel}>Emoji</Text>
              <TextInput
                value={newHabitEmoji}
                onChangeText={(text) => {
                  // Only allow 1-2 characters (some emojis are 2 chars)
                  if (text.length <= 2) {
                    setNewHabitEmoji(text);
                  }
                }}
                placeholder="📌"
                placeholderTextColor="#999"
                style={styles.emojiInput}
                maxLength={2}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <Text style={styles.inputHint}>
            💡 Tap emoji field → Use keyboard to add any emoji
          </Text>

          <Pressable
            onPress={handleAddHabit}
            style={[
              styles.addButton,
              !newHabitTitle.trim() && styles.addButtonDisabled,
            ]}
            disabled={!newHabitTitle.trim()}
          >
            <Text style={styles.addButtonText}>+ Add to Tracker</Text>
          </Pressable>
        </View>
      )}

      {/* ===== DELETE SECTION ===== */}
      {trackedHabits.length > 0 && (
        <View style={styles.deleteSection}>
          <Text style={styles.deleteSectionTitle}>🗑 Remove from Tracking</Text>

          <View style={styles.deleteRow}>
            <Pressable
              onPress={() => setShowDropdown(!showDropdown)}
              style={styles.dropdownTrigger}
            >
              <Text style={styles.dropdownTriggerText}>
                {trackedHabits.find((h) => h.id === selectedDeleteId)
                  ? `${trackedHabits.find((h) => h.id === selectedDeleteId)?.emoji} ${trackedHabits.find((h) => h.id === selectedDeleteId)?.title}`
                  : "Select habit..."}
              </Text>
              <Text style={styles.dropdownArrow}>{showDropdown ? "▲" : "▼"}</Text>
            </Pressable>

            <Pressable
              onPress={handleDeleteHabit}
              style={[
                styles.deleteButton,
                !selectedDeleteId && styles.deleteButtonDisabled,
              ]}
              disabled={!selectedDeleteId}
            >
              <Text style={styles.deleteButtonText}>🗑 Delete</Text>
            </Pressable>
          </View>

          {/* DROPDOWN */}
          {showDropdown && (
            <View style={styles.dropdown}>
              {trackedHabits.map((habit) => (
                <Pressable
                  key={habit.id}
                  onPress={() => {
                    setSelectedDeleteId(habit.id);
                    setShowDropdown(false);
                  }}
                  style={[
                    styles.dropdownItem,
                    selectedDeleteId === habit.id && styles.dropdownItemSelected,
                  ]}
                >
                  <Text style={styles.dropdownEmoji}>{habit.emoji}</Text>
                  <Text style={styles.dropdownItemText}>{habit.title}</Text>
                  {selectedDeleteId === habit.id && (
                    <Text style={styles.dropdownCheck}>✓</Text>
                  )}
                </Pressable>
              ))}
            </View>
          )}
        </View>
      )}

      {/* ===== LEGEND ===== */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <Text style={styles.legendIcon}>✅</Text>
          <Text style={styles.legendText}>Done</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={styles.legendIcon}>⬜</Text>
          <Text style={styles.legendText}>Editable</Text>
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

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  loadingContainer: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    marginVertical: 8,
  },

  loadingText: {
    color: "#666",
    fontSize: 14,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a2e",
    textAlign: "center",
  },

  titleMobile: {
    fontSize: 18,
  },

  subtitle: {
    fontSize: 11,
    color: "#888",
    textAlign: "center",
    marginBottom: 16,
    marginTop: 4,
  },

  table: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    overflow: "hidden",
  },

  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
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
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRightWidth: 1,
    borderRightColor: "#E0E0E0",
  },

  headerCell: {
    backgroundColor: "#3949AB",
    paddingVertical: 12,
  },

  headerText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 12,
  },

  emptyHeaderText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
  },

  habitEmoji: {
    fontSize: 18,
  },

  dateCell: {
    width: DATE_CELL_WIDTH,
    alignItems: "flex-start",
    paddingLeft: 10,
  },

  habitCell: {
    width: CELL_WIDTH,
  },

  percentCell: {
    width: PERCENT_CELL_WIDTH,
  },

  emojiCell: {
    width: EMOJI_CELL_WIDTH,
  },

  notesCell: {
    width: NOTES_CELL_WIDTH,
    borderRightWidth: 0,
  },

  completedCell: {
    backgroundColor: "rgba(76, 175, 80, 0.15)",
  },

  disabledCell: {
    opacity: 0.6,
  },

  dateText: {
    fontWeight: "600",
    fontSize: 13,
    color: "#333",
  },

  todayText: {
    color: "#2E7D32",
    fontWeight: "700",
  },

  todayBadge: {
    fontSize: 9,
    color: "#2E7D32",
    fontWeight: "600",
    marginTop: 2,
  },

  checkIcon: {
    fontSize: 16,
  },

  emptyText: {
    color: "#999",
    fontSize: 12,
  },

  percentText: {
    fontWeight: "700",
    fontSize: 12,
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
    fontSize: 16,
  },

  notesInput: {
    flex: 1,
    fontSize: 11,
    color: "#333",
    paddingHorizontal: 4,
    width: "100%",
  },

  disabledInput: {
    color: "#999",
  },

  celebrateBadge: {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: [{ translateX: -60 }, { translateY: -15 }],
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
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
    fontSize: 12,
    fontWeight: "700",
    color: "#FFF",
  },

  tooltipOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
  },

  tooltip: {
    position: "absolute",
    backgroundColor: "#333",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    maxWidth: 180,
    minWidth: 80,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },

  tooltipText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },

  tooltipArrow: {
    position: "absolute",
    bottom: -8,
    left: "50%",
    marginLeft: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#333",
  },

  toggleAddBtn: {
    backgroundColor: "#E8F5E9",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#4CAF50",
  },

  toggleAddBtnActive: {
    backgroundColor: "#FFEBEE",
    borderColor: "#F44336",
  },

  toggleAddBtnText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 14,
  },

  addForm: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },

  addFormTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 14,
  },

  inputRow: {
    flexDirection: "row",
    gap: 12,
  },

  inputGroup: {
    flex: 1,
  },

  emojiInputGroup: {
    width: 80,
  },

  inputLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
    fontWeight: "600",
  },

  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: "#333",
  },

  emojiInput: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 12,
    fontSize: 24,
    textAlign: "center",
  },

  inputHint: {
    fontSize: 11,
    color: "#888",
    marginTop: 10,
    fontStyle: "italic",
  },

  addButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },

  addButtonDisabled: {
    backgroundColor: "#CCC",
  },

  addButtonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },

  deleteSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },

  deleteSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 10,
  },

  deleteRow: {
    flexDirection: "row",
    gap: 10,
  },

  dropdownTrigger: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  dropdownTriggerText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },

  dropdownArrow: {
    fontSize: 10,
    color: "#666",
    marginLeft: 8,
  },

  deleteButton: {
    backgroundColor: "#F44336",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },

  deleteButtonDisabled: {
    backgroundColor: "#CCC",
  },

  deleteButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 13,
  },

  dropdown: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    marginTop: 8,
    overflow: "hidden",
  },

  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },

  dropdownItemSelected: {
    backgroundColor: "#FFF3E0",
  },

  dropdownEmoji: {
    fontSize: 16,
    marginRight: 10,
  },

  dropdownItemText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },

  dropdownCheck: {
    color: "#4CAF50",
    fontWeight: "700",
    fontSize: 14,
  },

  legend: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 16,
    paddingTop: 14,
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  legendIcon: {
    fontSize: 12,
  },

  legendText: {
    fontSize: 11,
    color: "#666",
  },
});