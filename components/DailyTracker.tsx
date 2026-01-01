import {
  addDays,
  format,
  isAfter,
  isSameDay,
  startOfDay,
  subDays,
} from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
  
  /* ================= TYPES ================= */
  
  type Task = {
    id: string;
    title: string;
  };
  
  type DailyEntry = {
    completedTaskIds: string[];
    note: string;
  };
  
  type DailyData = {
    [date: string]: DailyEntry;
  };
  
  /* ================= HELPERS ================= */
  
  function get7Days() {
    const today = startOfDay(new Date());
    return Array.from({ length: 7 }, (_, i) => addDays(today, i - 3));
  }
  
  /* ================= CONSTANTS ================= */
  
  const CELL_WIDTH = 70;
  const DATE_CELL_WIDTH = 80;
  const PERCENT_CELL_WIDTH = 50;
  const EMOJI_CELL_WIDTH = 45;
  const NOTES_CELL_WIDTH = 120;
  
  /* ================= COMPONENT ================= */
  
  export default function DailyTracker() {
    const days = useMemo(get7Days, []);
    const today = startOfDay(new Date());
    const yesterday = subDays(today, 1);
  
    /* ===== TASKS ===== */
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState("");
    const [selectedDeleteId, setSelectedDeleteId] = useState<string>("");
    const [showDropdown, setShowDropdown] = useState(false);
  
    /* ===== DAILY DATA ===== */
    const [data, setData] = useState<DailyData>(() => {
      const obj: DailyData = {};
      days.forEach((d) => {
        obj[format(d, "yyyy-MM-dd")] = {
          completedTaskIds: [],
          note: "",
        };
      });
      return obj;
    });
  
    /* ===== CELEBRATION ===== */
    const celebrationAnim = useRef(new Animated.Value(0)).current;
    const [celebratingDay, setCelebratingDay] = useState<string | null>(null);
  
    /* ================= LOGIC ================= */
  
    function addTask() {
      if (!newTask.trim()) return;
  
      setTasks((prev) => [
        ...prev,
        { id: Date.now().toString(), title: newTask.trim() },
      ]);
  
      setNewTask("");
    }
  
    function deleteTask() {
      if (!selectedDeleteId) return;
  
      setTasks((prev) => prev.filter((t) => t.id !== selectedDeleteId));
  
      setData((prev) => {
        const updated: DailyData = {};
        Object.keys(prev).forEach((k) => {
          updated[k] = {
            ...prev[k],
            completedTaskIds: prev[k].completedTaskIds.filter(
              (id) => id !== selectedDeleteId
            ),
          };
        });
        return updated;
      });
  
      setSelectedDeleteId("");
      setShowDropdown(false);
    }
  
    function toggleTask(dateKey: string, taskId: string) {
      setData((prev) => {
        const entry = prev[dateKey];
        const exists = entry.completedTaskIds.includes(taskId);
  
        return {
          ...prev,
          [dateKey]: {
            ...entry,
            completedTaskIds: exists
              ? entry.completedTaskIds.filter((id) => id !== taskId)
              : [...entry.completedTaskIds, taskId],
          },
        };
      });
    }
  
    function getProgress(dateKey: string) {
      if (tasks.length === 0) return 0;
      return Math.round(
        (data[dateKey].completedTaskIds.length / tasks.length) * 100
      );
    }
  
    function getDayEmoji(progress: number) {
      if (progress < 50) return "🤨";
      if (progress < 70) return "😊";
      if (progress < 100) return "😄";
      return "🤭";
    }
  
    /* ===== CELEBRATION TRIGGER ===== */
  
    useEffect(() => {
      days.forEach((day) => {
        const key = format(day, "yyyy-MM-dd");
        const progress = getProgress(key);
  
        if (progress === 100 && celebratingDay !== key) {
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
    }, [data, tasks]);
  
    /* ================= UI ================= */
  
    return (
      <View style={styles.container}>
        <Text style={styles.title}>📋 Daily Habit Tracker</Text>
  
        {/* TABLE CONTAINER */}
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View style={styles.table}>
            {/* ===== HEADER ROW ===== */}
            <View style={styles.tableRow}>
              <View style={[styles.cell, styles.headerCell, styles.dateCell]}>
                <Text style={styles.headerText}>Day</Text>
              </View>
  
              {tasks.map((t) => (
                <View
                  key={t.id}
                  style={[styles.cell, styles.headerCell, styles.taskCell]}
                >
                  <Text style={styles.headerText} numberOfLines={1}>
                    {t.title}
                  </Text>
                </View>
              ))}
  
              {tasks.length === 0 && (
                <View style={[styles.cell, styles.headerCell, styles.taskCell]}>
                  <Text style={styles.emptyText}>No tasks</Text>
                </View>
              )}
  
              <View
                style={[styles.cell, styles.headerCell, styles.percentCell]}
              >
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
              const isEditable = isToday || isYesterday;
              const progress = getProgress(key);
              const isEvenRow = rowIndex % 2 === 0;
  
              return (
                <View
                  key={key}
                  style={[
                    styles.tableRow,
                    isEvenRow && styles.evenRow,
                    isToday && styles.todayRow,
                  ]}
                >
                  {/* DATE CELL */}
                  <View style={[styles.cell, styles.dateCell]}>
                    <Text
                      style={[styles.dateText, isToday && styles.todayText]}
                    >
                      {format(day, "EEE dd")}
                    </Text>
                    {isToday && <Text style={styles.todayBadge}>Today</Text>}
                  </View>
  
                  {/* TASK CELLS */}
                  {tasks.map((t) => {
                    const done = data[key].completedTaskIds.includes(t.id);
  
                    return (
                      <Pressable
                        key={t.id}
                        disabled={!isEditable}
                        onPress={() => toggleTask(key, t.id)}
                        style={[
                          styles.cell,
                          styles.taskCell,
                          done && styles.completedCell,
                          !isEditable && styles.disabledCell,
                        ]}
                      >
                        <Text style={styles.checkIcon}>
                          {done ? "✅" : isEditable ? "⬜" : "—"}
                        </Text>
                      </Pressable>
                    );
                  })}
  
                  {tasks.length === 0 && (
                    <View style={[styles.cell, styles.taskCell]}>
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
                        progress < 50 && styles.lowProgress,
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
                      value={data[key].note}
                      editable={isEditable}
                      placeholder={isEditable ? "Add note..." : "—"}
                      placeholderTextColor="#999"
                      onChangeText={(text) =>
                        setData((prev) => ({
                          ...prev,
                          [key]: { ...prev[key], note: text },
                        }))
                      }
                      style={[
                        styles.notesInput,
                        !isEditable && styles.disabledInput,
                      ]}
                    />
                  </View>
  
                  {/* 🎉 CELEBRATION */}
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
                      <Text style={styles.celebrateText}>
                        🎉 Great job! 🎊
                      </Text>
                    </Animated.View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
  
        {/* ===== CONTROLS SECTION ===== */}
        <View style={styles.controlsContainer}>
          {/* ADD TASK */}
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Add Task:</Text>
            <TextInput
              value={newTask}
              onChangeText={setNewTask}
              placeholder="Enter task name..."
              placeholderTextColor="#999"
              style={styles.controlInput}
              onSubmitEditing={addTask}
            />
            <Pressable onPress={addTask} style={styles.addButton}>
              <Text style={styles.addButtonText}>+ Add</Text>
            </Pressable>
          </View>
  
          {/* DELETE TASK */}
          {tasks.length > 0 && (
            <View style={styles.controlRow}>
              <Text style={styles.controlLabel}>Delete Task:</Text>
              <Pressable
                onPress={() => setShowDropdown(!showDropdown)}
                style={styles.dropdownTrigger}
              >
                <Text style={styles.dropdownTriggerText}>
                  {tasks.find((t) => t.id === selectedDeleteId)?.title ||
                    "Select task..."}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </Pressable>
  
              <Pressable
                onPress={deleteTask}
                style={[
                  styles.deleteButton,
                  !selectedDeleteId && styles.disabledButton,
                ]}
                disabled={!selectedDeleteId}
              >
                <Text style={styles.deleteButtonText}>🗑 Delete</Text>
              </Pressable>
  
              {/* DROPDOWN */}
              {showDropdown && (
                <View style={styles.dropdown}>
                  {tasks.map((t) => (
                    <Pressable
                      key={t.id}
                      onPress={() => {
                        setSelectedDeleteId(t.id);
                        setShowDropdown(false);
                      }}
                      style={[
                        styles.dropdownItem,
                        selectedDeleteId === t.id && styles.dropdownItemSelected,
                      ]}
                    >
                      <Text style={styles.dropdownItemText}>{t.title}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          )}
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
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
  
    title: {
      fontSize: 20,
      fontWeight: "700",
      marginBottom: 16,
      color: "#1a1a2e",
      textAlign: "center",
    },
  
    /* ===== TABLE STYLES ===== */
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
      backgroundColor: "#E3F2FD",
    },
  
    /* ===== CELL STYLES ===== */
    cell: {
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 6,
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
      fontSize: 13,
      textAlign: "center",
    },
  
    dateCell: {
      width: DATE_CELL_WIDTH,
      alignItems: "flex-start",
      paddingLeft: 10,
    },
  
    taskCell: {
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
      backgroundColor: "#E8F5E9",
    },
  
    disabledCell: {
      opacity: 0.5,
    },
  
    /* ===== TEXT STYLES ===== */
    dateText: {
      fontWeight: "600",
      fontSize: 13,
      color: "#333",
    },
  
    todayText: {
      color: "#1565C0",
      fontWeight: "700",
    },
  
    todayBadge: {
      fontSize: 9,
      color: "#1565C0",
      fontWeight: "600",
      marginTop: 2,
    },
  
    checkIcon: {
      fontSize: 18,
    },
  
    emptyText: {
      color: "#999",
      fontSize: 12,
    },
  
    percentText: {
      fontWeight: "700",
      fontSize: 13,
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
      fontSize: 18,
    },
  
    notesInput: {
      flex: 1,
      fontSize: 12,
      color: "#333",
      paddingHorizontal: 4,
      paddingVertical: 2,
      width: "100%",
    },
  
    disabledInput: {
      color: "#999",
    },
  
    /* ===== CELEBRATION ===== */
    celebrateBadge: {
      position: "absolute",
      right: -10,
      top: -8,
      backgroundColor: "#4CAF50",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      elevation: 6,
      zIndex: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
  
    celebrateText: {
      fontSize: 12,
      fontWeight: "700",
      color: "#FFF",
    },
  
    /* ===== CONTROLS ===== */
    controlsContainer: {
      marginTop: 20,
      gap: 12,
    },
  
    controlRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      position: "relative",
    },
  
    controlLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: "#555",
      width: 80,
    },
  
    controlInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: "#DDD",
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      backgroundColor: "#FAFAFA",
    },
  
    addButton: {
      backgroundColor: "#4CAF50",
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
    },
  
    addButtonText: {
      color: "#FFF",
      fontWeight: "600",
      fontSize: 14,
    },
  
    dropdownTrigger: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#DDD",
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: "#FAFAFA",
    },
  
    dropdownTriggerText: {
      fontSize: 14,
      color: "#333",
    },
  
    dropdownArrow: {
      fontSize: 10,
      color: "#666",
    },
  
    dropdown: {
      position: "absolute",
      top: 44,
      left: 88,
      right: 90,
      backgroundColor: "#FFF",
      borderWidth: 1,
      borderColor: "#DDD",
      borderRadius: 8,
      zIndex: 100,
      elevation: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
  
    dropdownItem: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#EEE",
    },
  
    dropdownItemSelected: {
      backgroundColor: "#E3F2FD",
    },
  
    dropdownItemText: {
      fontSize: 14,
      color: "#333",
    },
  
    deleteButton: {
      backgroundColor: "#F44336",
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 8,
    },
  
    disabledButton: {
      backgroundColor: "#BDBDBD",
    },
  
    deleteButtonText: {
      color: "#FFF",
      fontWeight: "600",
      fontSize: 13,
    },
  });