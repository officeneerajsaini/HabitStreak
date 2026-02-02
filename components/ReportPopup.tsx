// components/ReportPopup.tsx

import { useRoutine } from "@/context/RoutineContext";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface ReportPopupProps {
  visible: boolean;
  routineId: string;
  routineTitle: string;
  date: string;
  onClose: () => void;
}

export default function ReportPopup({
  visible,
  routineId,
  routineTitle,
  date,
  onClose,
}: ReportPopupProps) {
  const { addRoutineReport, removePendingReport } = useRoutine();
  const [report, setReport] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible) {
      setReport("");
      setIsSubmitting(false);
      // Focus input after a short delay
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      // Clear any pending retry
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    }
  }, [visible]);

  // Auto-retry with notifications if user closes without submitting
  useEffect(() => {
    if (visible && !isSubmitting) {
      // Set up retry notification after 2 minutes
      retryTimeoutRef.current = setTimeout(async () => {
        if (visible && !report.trim()) {
          // Schedule a notification to remind user
          try {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: `📝 Reminder: ${routineTitle} Report`,
                body: `You haven't submitted your report yet. Please write about how your ${routineTitle} routine went.`,
                sound: true,
                priority: Notifications.AndroidNotificationPriority.HIGH,
                data: {
                  type: 'routine-report',
                  routineId,
                  routineTitle,
                  date,
                },
              },
              trigger: null, // Show immediately
            });
          } catch (error) {
            console.error('Failed to schedule retry notification:', error);
          }
          
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          // Force focus again if popup is still visible
          if (visible) {
            inputRef.current?.focus();
          }
        }
      }, 120000); // 2 minutes
    }

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [visible, isSubmitting, report, routineId, routineTitle, date]);

  const handleSubmit = async () => {
    const trimmed = report.trim();
    if (!trimmed) {
      Alert.alert(
        "Report Required",
        "Please write something about how your routine went. This helps with accountability and reflection.",
        [{ text: "OK" }]
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      setIsSubmitting(true);
      await addRoutineReport(routineId, date, trimmed);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setReport(""); // Clear the report
      // Close immediately after successful save
      setTimeout(() => {
        onClose();
      }, 100);
    } catch (error) {
      console.error("Failed to save report:", error);
      Alert.alert("Error", "Failed to save report. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (report.trim()) {
      // If there's text, ask if they want to save
      Alert.alert(
        "Save Report?",
        "You have written something. Do you want to save it?",
        [
          { 
            text: "Discard", 
            style: "destructive", 
            onPress: () => {
              setReport("");
              onClose();
            }
          },
          { text: "Save", onPress: handleSubmit },
        ]
      );
    } else {
      // If empty, warn and schedule notification reminder
      Alert.alert(
        "Report Required",
        "You haven't written anything yet. You'll receive a notification reminder in 2 minutes.",
        [
          { 
            text: "OK", 
            onPress: async () => {
              // Schedule notification for 2 minutes from now
              try {
                await Notifications.scheduleNotificationAsync({
                  content: {
                    title: `📝 Reminder: ${routineTitle} Report`,
                    body: `Please write your report about how your ${routineTitle} routine went.`,
                    sound: true,
                    priority: Notifications.AndroidNotificationPriority.HIGH,
                    data: {
                      type: 'routine-report',
                      routineId,
                      routineTitle,
                      date,
                    },
                  },
                  trigger: { seconds: 120 }, // 2 minutes from now
                });
              } catch (error) {
                console.error('Failed to schedule reminder notification:', error);
              }
              onClose();
            }
          }
        ]
      );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>📝 How was {routineTitle}?</Text>
            <Text style={styles.subtitle}>
              Write a short report about what you did
            </Text>
          </View>

          <TextInput
            ref={inputRef}
            style={styles.input}
            value={report}
            onChangeText={setReport}
            placeholder="e.g., Did 30 pushups, felt great 💪"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            maxLength={500}
            autoFocus
            editable={!isSubmitting}
          />

          <Text style={styles.charCount}>{report.length}/500</Text>

          <View style={styles.buttonRow}>
            <Pressable
              onPress={handleClose}
              style={[styles.button, styles.cancelButton]}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>

            <Pressable
              onPress={handleSubmit}
              style={[
                styles.button,
                styles.saveButton,
                (!report.trim() || isSubmitting) && styles.saveButtonDisabled,
              ]}
              disabled={!report.trim() || isSubmitting}
            >
              <Text style={styles.saveButtonText}>
                {isSubmitting ? "Saving..." : "Save"}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.hint}>
            💡 This report will be automatically saved to your daily notes
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 500,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#333",
    minHeight: 120,
    textAlignVertical: "top",
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  charCount: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginTop: 8,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  saveButtonDisabled: {
    backgroundColor: "#CCC",
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  hint: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    fontStyle: "italic",
  },
});
