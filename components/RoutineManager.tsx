// components/RoutineManager.tsx

import { useRoutine } from "@/context/RoutineContext";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import TimePicker from "./TimePicker";

const ROUTINE_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
  "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9",
];

export default function RoutineManager() {
  const {
    routines,
    addRoutine,
    updateRoutine,
    deleteRoutine,
    toggleRoutineEnabled,
  } = useRoutine();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newRoutine, setNewRoutine] = useState({
    title: "",
    startTime: "06:00",
    endTime: "07:00",
    color: ROUTINE_COLORS[0],
    enabled: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const handleAddRoutine = async () => {
    const trimmed = newRoutine.title.trim();
    if (!trimmed) {
      Alert.alert("Empty Title", "Please enter a routine name.");
      return;
    }

    // Validate time
    if (newRoutine.startTime >= newRoutine.endTime) {
      Alert.alert("Invalid Time", "End time must be after start time.");
      return;
    }

    try {
      await addRoutine(newRoutine);
      setNewRoutine({
        title: "",
        startTime: "06:00",
        endTime: "07:00",
        color: ROUTINE_COLORS[Math.floor(Math.random() * ROUTINE_COLORS.length)],
        enabled: true,
      });
      setShowAddForm(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert("Error", "Failed to add routine. Please try again.");
    }
  };

  const handleDeleteRoutine = (id: string, title: string) => {
    Alert.alert(
      "Delete Routine",
      `Are you sure you want to delete "${title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteRoutine(id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            } catch (error) {
              Alert.alert("Error", "Failed to delete routine.");
            }
          },
        },
      ]
    );
  };

  const handleToggleEnabled = async (id: string) => {
    try {
      await toggleRoutineEnabled(id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      Alert.alert("Error", "Failed to update routine.");
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const parseTimeInput = (input: string): string | null => {
    // Accept formats: "6:00", "06:00", "6:00 AM", etc.
    const cleaned = input.trim().toUpperCase();
    
    // Try to parse as HH:MM
    const timeMatch = cleaned.match(/^(\d{1,2}):(\d{2})/);
    if (!timeMatch) return null;
    
    let hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2];
    
    // Check for AM/PM
    if (cleaned.includes("PM") && hours !== 12) hours += 12;
    if (cleaned.includes("AM") && hours === 12) hours = 0;
    
    if (hours < 0 || hours > 23 || parseInt(minutes) > 59) return null;
    
    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>⏰ Daily Routines</Text>
          <Text style={styles.subtitle}>
            Set fixed daily routines with reminders
          </Text>
        </View>
        <Pressable
          onPress={() => setShowAddForm(!showAddForm)}
          style={[styles.addButton, showAddForm && styles.addButtonActive]}
        >
          <Text style={styles.addButtonText}>
            {showAddForm ? "✕" : "+"}
          </Text>
        </Pressable>
      </View>

      {showAddForm && (
        <View style={styles.addForm}>
          <Text style={styles.addFormTitle}>✨ New Routine</Text>

          <Text style={styles.label}>Routine Name</Text>
          <TextInput
            value={newRoutine.title}
            onChangeText={(text) =>
              setNewRoutine({ ...newRoutine, title: text })
            }
            placeholder="e.g., Morning Exercise"
            placeholderTextColor="#888"
            style={styles.input}
            maxLength={50}
          />

          <View style={styles.timeRow}>
            <View style={styles.timeGroup}>
              <Text style={styles.label}>Start Time</Text>
              <Pressable
                onPress={() => setShowStartTimePicker(true)}
                style={styles.timeButton}
              >
                <Text style={styles.timeButtonText}>
                  {formatTime(newRoutine.startTime)}
                </Text>
                <Text style={styles.timeButtonHint}>Tap to change</Text>
              </Pressable>
            </View>

            <View style={styles.timeGroup}>
              <Text style={styles.label}>End Time</Text>
              <Pressable
                onPress={() => setShowEndTimePicker(true)}
                style={styles.timeButton}
              >
                <Text style={styles.timeButtonText}>
                  {formatTime(newRoutine.endTime)}
                </Text>
                <Text style={styles.timeButtonHint}>Tap to change</Text>
              </Pressable>
            </View>
          </View>

          {/* Time Pickers */}
          <TimePicker
            visible={showStartTimePicker}
            value={newRoutine.startTime}
            onClose={() => setShowStartTimePicker(false)}
            onConfirm={(time) => {
              setNewRoutine({ ...newRoutine, startTime: time });
            }}
            title="Select Start Time"
          />

          <TimePicker
            visible={showEndTimePicker}
            value={newRoutine.endTime}
            onClose={() => setShowEndTimePicker(false)}
            onConfirm={(time) => {
              setNewRoutine({ ...newRoutine, endTime: time });
            }}
            title="Select End Time"
          />

          <Text style={styles.label}>Color</Text>
          <View style={styles.colorPicker}>
            {ROUTINE_COLORS.map((color) => (
              <Pressable
                key={color}
                onPress={() => setNewRoutine({ ...newRoutine, color })}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  newRoutine.color === color && styles.colorOptionSelected,
                ]}
              >
                {newRoutine.color === color && (
                  <Text style={styles.colorCheck}>✓</Text>
                )}
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={handleAddRoutine}
            style={[
              styles.submitButton,
              { backgroundColor: newRoutine.color },
              !newRoutine.title.trim() && styles.submitButtonDisabled,
            ]}
            disabled={!newRoutine.title.trim()}
          >
            <Text style={styles.submitButtonText}>+ Add Routine</Text>
          </Pressable>
        </View>
      )}

      {routines.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>⏰</Text>
          <Text style={styles.emptyTitle}>No routines yet</Text>
          <Text style={styles.emptySubtitle}>
            Add your first daily routine to get started!
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.routinesList}>
          {routines.map((routine) => (
            <View key={routine.id} style={styles.routineCard}>
              <View
                style={[
                  styles.colorIndicator,
                  { backgroundColor: routine.color },
                ]}
              />

              <View style={styles.routineContent}>
                <View style={styles.routineHeader}>
                  <Text style={styles.routineTitle}>{routine.title}</Text>
                  <Pressable
                    onPress={() => handleToggleEnabled(routine.id)}
                    style={[
                      styles.toggleButton,
                      routine.enabled && styles.toggleButtonActive,
                    ]}
                  >
                    <Text style={styles.toggleButtonText}>
                      {routine.enabled ? "ON" : "OFF"}
                    </Text>
                  </Pressable>
                </View>

                <Text style={styles.routineTime}>
                  {formatTime(routine.startTime)} – {formatTime(routine.endTime)}
                </Text>

                <View style={styles.routineActions}>
                  <Pressable
                    onPress={() => handleDeleteRoutine(routine.id, routine.title)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>🗑 Delete</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {routines.length > 0 && (
        <Text style={styles.hint}>
          💡 You'll get a notification at start time and a report popup 5 minutes before end time
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#2D2D2B",
    borderRadius: 20,
    padding: 20,
    marginVertical: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFF",
  },
  subtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(168,230,207,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(168,230,207,0.3)",
  },
  addButtonActive: {
    backgroundColor: "rgba(255,107,107,0.2)",
    borderColor: "#FF6B6B",
  },
  addButtonText: {
    color: "#A8E6CF",
    fontSize: 20,
    fontWeight: "600",
  },
  addForm: {
    backgroundColor: "#3A3A38",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  addFormTitle: {
    color: "#A8E6CF",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 16,
  },
  label: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#2A2A28",
    color: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  timeRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  timeGroup: {
    flex: 1,
  },
  timeButton: {
    backgroundColor: "#2A2A28",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  timeButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  timeButtonHint: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
  },
  colorPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: "#FFF",
  },
  colorCheck: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
  },
  routinesList: {
    maxHeight: 400,
  },
  routineCard: {
    flexDirection: "row",
    backgroundColor: "#3A3A38",
    borderRadius: 14,
    marginBottom: 12,
    overflow: "hidden",
  },
  colorIndicator: {
    width: 5,
  },
  routineContent: {
    flex: 1,
    padding: 14,
  },
  routineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  routineTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  toggleButtonActive: {
    backgroundColor: "rgba(76, 175, 80, 0.3)",
    borderColor: "#4CAF50",
  },
  toggleButtonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  routineTime: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    marginBottom: 8,
  },
  routineActions: {
    flexDirection: "row",
    gap: 8,
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(255,107,107,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,107,107,0.3)",
  },
  deleteButtonText: {
    color: "#FF6B6B",
    fontSize: 12,
    fontWeight: "600",
  },
  hint: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    marginTop: 12,
    fontStyle: "italic",
  },
});
