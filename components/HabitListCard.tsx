import { useHabitList } from "@/context/HabitListContext";
import { Habit } from "@/storage/habitStorage";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";

/* ================= CONSTANTS ================= */

const HABIT_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
  "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9",
];

const QUOTES = [
  "Progress over perfection",
  "Small steps matter",
  "Consistency beats motivation",
  "Build habits daily",
  "Show up every day",
  "Focus on today",
  "One step forward",
  "Discipline creates freedom",
  "Do it anyway",
  "Action builds confidence",
  "Trust the process",
  "Keep moving forward",
  "Start where you are",
  "Done is better",
  "Momentum matters",
  "Little wins add up",
  "Be better today",
  "Commit to growth",
  "Habits shape destiny",
  "Effort compounds daily",
  "Stay the course",
  "Progress is progress",
  "Focus beats talent",
  "Build before results",
  "Patience pays off",
  "Daily effort counts",
  "Keep it simple",
  "Consistency creates change",
  "Grow one percent",
  "Choose discipline",
  "Move with purpose",
  "Create your routine",
  "Success is built",
  "Do the work",
  "Routine beats luck",
  "Focus and repeat",
  "Start small today",
  "Execution over excuses",
  "Daily actions win",
  "Keep your promise",
  "Build momentum",
  "Train your mind",
  "Progress takes time",
  "Win the day",
  "Clarity creates action",
  "Stay consistent",
  "Habits over goals",
  "Do less better",
  "Effort builds skill",
  "Choose progress",
  "One habit at a time",
  "Be reliable",
  "Discipline is power",
  "Stay intentional",
  "Daily growth matters",
  "Work quietly",
  "Results will follow",
  "Keep improving",
  "Practice daily",
  "Control your focus",
  "Small actions win",
  "Create consistency",
  "Build resilience",
  "Move with intention",
  "Action over thinking",
  "Keep your rhythm",
  "Progress is earned",
  "Build your future",
  "Daily discipline wins",
  "Focus on inputs",
  "Stay patient",
  "Consistency builds confidence",
  "Commit daily",
  "Make it routine",
  "Habits drive success",
  "Stay on track",
  "Focus fuels progress",
  "Build systems",
  "Repeat the basics",
  "Effort every day",
  "Be unstoppable",
  "Show discipline",
  "Stay focused",
  "Build strength daily",
  "Win small battles",
  "Create structure",
  "Progress takes repetition",
  "Consistency is strength",
  "Be intentional today",
  "Trust repetition",
  "One task done",
  "Build your edge",
  "Keep discipline",
  "Daily progress wins",
  "Stay committed",
  "Improve daily",
  "Success is routine",
  "Create momentum daily",
  "Show up focused",
  "Build clarity",
  "Do what matters",
  "One day stronger",
  "Stay disciplined",
  "Consistency compounds",
  "Build your habits",
  "Choose effort",
  "Focus creates results",
  "Win with habits",
  "Repeat good actions",
  "Keep standards high",
  "Build daily discipline",
  "Progress loves patience",
  "Stay steady",
  "Action builds results",
  "Focus on process",
  "Keep going",
  "Habits shape life",
  "Discipline equals growth",
  "Daily effort wins",
  "Build consistency",
  "Choose growth",
  "Keep improving daily",
  "Trust daily work",
  "Progress is built",
  "Small habits win",
  "Stay consistent today",
  "Create better habits",
  "Be disciplined daily",
  "Win with focus",
  "Commit to routine",
  "Stay intentional daily",
  "Build better days",
  "Consistency creates momentum",
  "Effort defines outcome",
  "Repeat what works",
  "Build the habit",
  "Focus daily",
  "Progress every day",
  "Stay on purpose",
  "Daily habits matter",
  "Keep discipline strong",
  "Build yourself daily",
  "Consistency is progress",
  "Action fuels success",
  "Create winning habits",
  "Stay patient daily",
  "Focus on consistency",
  "Build momentum slowly",
  "Progress through effort",
  "Be consistent now",
  "Habits over motivation",
  "Daily work wins",
  "Trust small steps",
  "Stay focused daily",
  "Create daily wins",
  "Build discipline daily",
  "Consistency equals results",
  "Focus beats excuses",
  "Build progress daily",
  "Choose action today",
  "Keep habits simple",
  "Daily progress counts",
  "Stay committed daily",
  "Discipline builds success",
  "Build one habit",
  "Progress over excuses",
  "Stay consistent always",
  "Action creates change",
  "Daily effort compounds",
  "Build the routine",
  "Focus on today only",
  "Consistency creates freedom",
  "Be better each day",
  "Progress through consistency",
  "Habits drive progress",
  "Daily action matters",
  "Commit and repeat",
  "Stay disciplined today",
  "Build momentum now",
  "Progress is earned daily",
  "Consistency wins long term",
  "Daily habits shape you",
  "Focus builds results",
  "Create better routines",
  "Stay consistent long term",
  "Build your discipline",
  "Progress starts now",
  "Daily effort builds success",
  "Habits create outcomes",
  "Focus on execution",
  "Consistency is the edge",
  "Build small daily",
  "Commit to action",
  "Stay patient and consistent",
  "Daily progress builds confidence",
  "Habits shape identity",
  "Do it daily",
  "Consistency defines success",
  "Build habits intentionally",
  "Focus creates momentum",
  "Daily work builds greatness",
  "Stay disciplined long term",
  "Small habits compound",
  "Progress loves consistency",
  "Build better habits daily",
  "Choose consistency today",
  "Action is the answer",
  "Daily routines win",
  "Stay focused on growth",
  "Consistency builds mastery",
  "Progress through habits",
  "Build discipline slowly",
  "Daily effort matters most",
  "Stay consistent forever"
];


/* ================= COMPONENT ================= */

export default function HabitListCard() {
  // ✅ Use context instead of local state
  const {
    habits,
    addHabit,
    deleteHabit,
    updateHabit,
    reorderHabits,
    isLoading,
  } = useHabitList();

  const [showAdd, setShowAdd] = useState(false);
  const [newHabit, setNewHabit] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0]);
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  const [showDeleteSection, setShowDeleteSection] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);
  const [showDeleteDropdown, setShowDeleteDropdown] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  function getRandomColor() {
    return HABIT_COLORS[Math.floor(Math.random() * HABIT_COLORS.length)];
  }

  function handleAddHabit() {
    const trimmed = newHabit.trim();
    if (!trimmed) {
      Alert.alert("Empty Habit", "Please enter a habit name.");
      return;
    }

    const isDuplicate = habits.some(
      (h) => h.title.toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicate) {
      Alert.alert("Duplicate Habit", "This habit already exists.");
      return;
    }

    const newHabitObj: Habit = {
      id: Date.now().toString(),
      title: trimmed,
      createdAt: new Date().toISOString(),
      color: selectedColor,
    };

    addHabit(newHabitObj);
    setNewHabit("");
    setSelectedColor(getRandomColor());
    setShowAdd(false);
    Keyboard.dismiss();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function handleDeleteHabit() {
    if (!selectedDeleteId) {
      Alert.alert("No Selection", "Please select a habit to delete first.");
      return;
    }

    const habit = habits.find((h) => h.id === selectedDeleteId);

    Alert.alert(
      "Delete Habit",
      `Are you sure you want to delete "${habit?.title}"? All tracking data will also be removed.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteHabit(selectedDeleteId);
            setSelectedDeleteId(null);
            setShowDeleteSection(false);
            setShowDeleteDropdown(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
  }

  function startEdit(habit: Habit) {
    setEditingId(habit.id);
    setEditText(habit.title);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function saveEdit() {
    if (!editingId) return;
    const trimmed = editText.trim();
    if (!trimmed) {
      Alert.alert("Empty Name", "Habit name cannot be empty.");
      return;
    }
    updateHabit(editingId, trimmed);
    setEditingId(null);
    setEditText("");
    Keyboard.dismiss();
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText("");
    Keyboard.dismiss();
  }

  function toggleAddForm() {
    setShowAdd(!showAdd);
    setShowDeleteSection(false);
    setShowDeleteDropdown(false);
    if (!showAdd) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      Keyboard.dismiss();
      setNewHabit("");
    }
  }

  function toggleDeleteSection() {
    setShowDeleteSection(!showDeleteSection);
    setShowAdd(false);
    setShowDeleteDropdown(false);
    if (showDeleteSection) {
      setSelectedDeleteId(null);
    }
  }

  function onDragEnd({ data }: { data: Habit[] }) {
    reorderHabits(data);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  function onDragBegin() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }

  function selectHabitForDelete(id: string) {
    setSelectedDeleteId(id);
    setShowDeleteDropdown(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Habit>) => {
    const isEditing = editingId === item.id;

    return (
      <ScaleDecorator activeScale={1.05}>
        <Pressable
          onLongPress={drag}
          disabled={isActive}
          style={[styles.habitRow, isActive && styles.habitRowActive]}
        >
          <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />

          <Pressable onLongPress={drag} style={styles.dragHandle}>
            <Text style={styles.dragIcon}>⋮⋮</Text>
          </Pressable>

          {isEditing ? (
            <View style={styles.editContainer}>
              <TextInput
                value={editText}
                onChangeText={setEditText}
                style={styles.editInput}
                autoFocus
                onSubmitEditing={saveEdit}
                onBlur={cancelEdit}
                selectTextOnFocus
              />
              <View style={styles.editActions}>
                <Pressable onPress={saveEdit} style={styles.editBtn}>
                  <Text style={styles.editBtnText}>✓</Text>
                </Pressable>
                <Pressable onPress={cancelEdit} style={styles.cancelBtn}>
                  <Text style={styles.cancelBtnText}>✕</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable onPress={() => startEdit(item)} style={styles.habitContent}>
              <Text style={styles.habitText}>{item.title}</Text>
              <Text style={styles.habitMeta}>
                {new Date(item.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </Pressable>
          )}
        </Pressable>
      </ScaleDecorator>
    );
  };

  const selectedHabit = habits.find((h) => h.id === selectedDeleteId);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* Quote */}
      <View style={styles.quoteContainer}>
        <View style={styles.quoteLine} />
        <View style={styles.quoteContent}>
          <Text style={styles.quoteText}>{quote}</Text>
          <Text style={styles.quoteSubtext}>
            {habits.length} habit{habits.length !== 1 ? "s" : ""} tracked
          </Text>
        </View>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>My Habits</Text>
          <Text style={styles.subtitle}>Long press to reorder • Tap to edit</Text>
        </View>

        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyTitle}>No habits yet</Text>
            <Text style={styles.emptySubtitle}>
              Start building your daily routine!
            </Text>
          </View>
        ) : (
          <DraggableFlatList
            data={habits}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            onDragEnd={onDragEnd}
            onDragBegin={onDragBegin}
            scrollEnabled={false}
            activationDistance={10}
            containerStyle={styles.listContainer}
          />
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Pressable
            onPress={toggleAddForm}
            style={[styles.actionBtn, styles.addActionBtn, showAdd && styles.actionBtnActive]}
          >
            <Text style={styles.actionBtnIcon}>{showAdd ? "×" : "+"}</Text>
            <Text style={styles.actionBtnText}>{showAdd ? "Cancel" : "Add Habit"}</Text>
          </Pressable>

          {habits.length > 0 && (
            <Pressable
              onPress={toggleDeleteSection}
              style={[styles.actionBtn, styles.deleteActionBtn, showDeleteSection && styles.deleteActionBtnActive]}
            >
              <Text style={styles.deleteActionBtnIcon}>{showDeleteSection ? "×" : "🗑"}</Text>
              <Text style={styles.deleteActionBtnText}>{showDeleteSection ? "Cancel" : "Delete"}</Text>
            </Pressable>
          )}
        </View>

        {/* Add Form */}
        {showAdd && (
          <View style={styles.addForm}>
            <Text style={styles.addFormTitle}>✨ New Habit</Text>
            <TextInput
              ref={inputRef}
              value={newHabit}
              onChangeText={setNewHabit}
              placeholder="What habit do you want to build?"
              placeholderTextColor="#888"
              style={styles.input}
              onSubmitEditing={handleAddHabit}
              maxLength={50}
            />
            <Text style={styles.charCount}>{newHabit.length}/50</Text>

            <View style={styles.colorSection}>
              <Text style={styles.colorLabel}>Choose Color:</Text>
              <View style={styles.colorPicker}>
                {HABIT_COLORS.map((color) => (
                  <Pressable
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorOptionSelected,
                    ]}
                  >
                    {selectedColor === color && <Text style={styles.colorCheck}>✓</Text>}
                  </Pressable>
                ))}
              </View>
            </View>

            <Pressable
              onPress={handleAddHabit}
              style={[styles.submitButton, { backgroundColor: selectedColor }, !newHabit.trim() && styles.submitButtonDisabled]}
              disabled={!newHabit.trim()}
            >
              <Text style={styles.submitButtonText}>+ Add Habit</Text>
            </Pressable>
          </View>
        )}

        {/* Delete Section */}
        {showDeleteSection && habits.length > 0 && (
          <View style={styles.deleteSection}>
            <Text style={styles.deleteSectionTitle}>🗑 Delete Habit</Text>
            <Text style={styles.deleteSectionSubtitle}>Select a habit to remove</Text>

            <Pressable
              onPress={() => setShowDeleteDropdown(!showDeleteDropdown)}
              style={[styles.dropdownTrigger, selectedHabit && { borderColor: selectedHabit.color, borderWidth: 2 }]}
            >
              {selectedHabit ? (
                <View style={styles.selectedHabitDisplay}>
                  <View style={[styles.selectedHabitColor, { backgroundColor: selectedHabit.color }]} />
                  <Text style={styles.selectedHabitText}>{selectedHabit.title}</Text>
                </View>
              ) : (
                <Text style={styles.dropdownPlaceholder}>Tap to select...</Text>
              )}
              <Text style={styles.dropdownArrow}>{showDeleteDropdown ? "▲" : "▼"}</Text>
            </Pressable>

            {showDeleteDropdown && (
              <View style={styles.dropdown}>
                {habits.map((habit) => (
                  <Pressable
                    key={habit.id}
                    onPress={() => selectHabitForDelete(habit.id)}
                    style={[styles.dropdownItem, selectedDeleteId === habit.id && styles.dropdownItemSelected]}
                  >
                    <View style={[styles.dropdownItemColor, { backgroundColor: habit.color }]} />
                    <Text style={styles.dropdownItemText}>{habit.title}</Text>
                    {selectedDeleteId === habit.id && <Text style={styles.dropdownItemCheck}>✓</Text>}
                  </Pressable>
                ))}
              </View>
            )}

            <Pressable
              onPress={handleDeleteHabit}
              style={[styles.deleteConfirmBtn, !selectedDeleteId && styles.deleteConfirmBtnDisabled]}
              disabled={!selectedDeleteId}
            >
              <Text style={styles.deleteConfirmBtnText}>🗑 Delete Selected</Text>
            </Pressable>
            <Text style={styles.deleteWarning}>⚠️ This cannot be undone</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  loadingContainer: { padding: 40, alignItems: "center" },
  loadingText: { color: "#FFF", fontSize: 16 },

  quoteContainer: { flexDirection: "row", alignItems: "center", marginBottom: 16, paddingHorizontal: 4 },
  quoteLine: { width: 4, height: 40, backgroundColor: "#A8E6CF", marginRight: 12, borderRadius: 2 },
  quoteContent: { flex: 1 },
  quoteText: { color: "#FFF", fontSize: 18, fontWeight: "600", fontStyle: "italic" },
  quoteSubtext: { color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 2 },

  card: { backgroundColor: "#2D2D2B", borderRadius: 20, padding: 20 },
  header: { marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "800", color: "#FFF" },
  subtitle: { fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 },

  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: "#FFF", marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: "rgba(255,255,255,0.6)", textAlign: "center" },

  listContainer: { marginBottom: 8 },
  habitRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#3A3A38", borderRadius: 14, marginBottom: 10, padding: 14, overflow: "hidden" },
  habitRowActive: { backgroundColor: "#4A4A48" },
  colorIndicator: { position: "absolute", left: 0, top: 0, bottom: 0, width: 5, borderTopLeftRadius: 14, borderBottomLeftRadius: 14 },
  dragHandle: { paddingHorizontal: 8, paddingVertical: 4, marginLeft: 4 },
  dragIcon: { color: "rgba(255,255,255,0.4)", fontSize: 16 },
  habitContent: { flex: 1, marginLeft: 8 },
  habitText: { color: "#FFF", fontSize: 16, fontWeight: "500" },
  habitMeta: { color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 2 },

  editContainer: { flex: 1, flexDirection: "row", alignItems: "center", marginLeft: 8 },
  editInput: { flex: 1, backgroundColor: "#2A2A28", color: "#FFF", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 16, marginRight: 8 },
  editActions: { flexDirection: "row", gap: 6 },
  editBtn: { backgroundColor: "#4ECDC4", width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  editBtnText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
  cancelBtn: { backgroundColor: "#666", width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  cancelBtnText: { color: "#FFF", fontSize: 16, fontWeight: "600" },

  actionButtons: { flexDirection: "row", gap: 12, marginTop: 16 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 12, gap: 8 },
  addActionBtn: { backgroundColor: "rgba(168,230,207,0.15)", borderWidth: 1, borderColor: "rgba(168,230,207,0.3)" },
  deleteActionBtn: { backgroundColor: "rgba(255,107,107,0.1)", borderWidth: 1, borderColor: "rgba(255,107,107,0.2)" },
  actionBtnActive: { backgroundColor: "rgba(168,230,207,0.3)", borderColor: "#A8E6CF" },
  deleteActionBtnActive: { backgroundColor: "rgba(255,107,107,0.25)", borderColor: "#FF6B6B" },
  actionBtnIcon: { color: "#A8E6CF", fontSize: 18, fontWeight: "600" },
  actionBtnText: { color: "#A8E6CF", fontSize: 14, fontWeight: "600" },
  deleteActionBtnIcon: { color: "#FF6B6B", fontSize: 16 },
  deleteActionBtnText: { color: "#FF6B6B", fontSize: 14, fontWeight: "600" },

  addForm: { backgroundColor: "#3A3A38", borderRadius: 16, padding: 16, marginTop: 16 },
  addFormTitle: { color: "#A8E6CF", fontSize: 17, fontWeight: "700", marginBottom: 12 },
  input: { backgroundColor: "#2A2A28", color: "#FFF", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16 },
  charCount: { color: "rgba(255,255,255,0.4)", fontSize: 11, textAlign: "right", marginTop: 6 },
  colorSection: { marginTop: 16 },
  colorLabel: { color: "rgba(255,255,255,0.7)", fontSize: 13, marginBottom: 10 },
  colorPicker: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  colorOption: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  colorOptionSelected: { borderWidth: 3, borderColor: "#FFF" },
  colorCheck: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  submitButton: { marginTop: 20, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { color: "#FFF", fontSize: 16, fontWeight: "700" },

  deleteSection: { backgroundColor: "#3A3A38", borderRadius: 16, padding: 16, marginTop: 16 },
  deleteSectionTitle: { color: "#FF6B6B", fontSize: 17, fontWeight: "700" },
  deleteSectionSubtitle: { color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 2, marginBottom: 14 },
  dropdownTrigger: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#2A2A28", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  dropdownPlaceholder: { color: "rgba(255,255,255,0.4)", fontSize: 15 },
  dropdownArrow: { color: "rgba(255,255,255,0.5)", fontSize: 12 },
  selectedHabitDisplay: { flexDirection: "row", alignItems: "center", flex: 1 },
  selectedHabitColor: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  selectedHabitText: { color: "#FFF", fontSize: 15, fontWeight: "500" },
  dropdown: { backgroundColor: "#2A2A28", borderRadius: 12, marginTop: 8, overflow: "hidden" },
  dropdownItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
  dropdownItemSelected: { backgroundColor: "rgba(255,107,107,0.15)" },
  dropdownItemColor: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  dropdownItemText: { color: "#FFF", fontSize: 15, flex: 1 },
  dropdownItemCheck: { color: "#FF6B6B", fontSize: 14, fontWeight: "600" },
  deleteConfirmBtn: { backgroundColor: "#FF6B6B", borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 16 },
  deleteConfirmBtnDisabled: { backgroundColor: "rgba(255,107,107,0.3)" },
  deleteConfirmBtnText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  deleteWarning: { color: "rgba(255,255,255,0.4)", fontSize: 11, textAlign: "center", marginTop: 10 },
});