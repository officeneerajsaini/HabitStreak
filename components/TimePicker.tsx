// components/TimePicker.tsx

import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface TimePickerProps {
  visible: boolean;
  value: string; // HH:mm format
  onClose: () => void;
  onConfirm: (time: string) => void;
  title?: string;
}

export default function TimePicker({
  visible,
  value,
  onClose,
  onConfirm,
  title = "Select Time",
}: TimePickerProps) {
  // Parse current value (24-hour format)
  const [hours24, minutes] = value.split(":").map(Number);
  // Convert to 12-hour format for display
  const hour12 = hours24 % 12 || 12;
  const [selectedHour, setSelectedHour] = useState(hour12);
  const [selectedMinute, setSelectedMinute] = useState(minutes || 0);
  const [selectedAMPM, setSelectedAMPM] = useState<"AM" | "PM">(hours24 >= 12 ? "PM" : "AM");

  const hoursList = Array.from({ length: 12 }, (_, i) => i + 1); // 1-12
  const minutesList = Array.from({ length: 60 }, (_, i) => i);
  const ampmList: ("AM" | "PM")[] = ["AM", "PM"];

  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);

  // Scroll to selected values when modal opens
  useEffect(() => {
    if (visible) {
      // Update state from value prop (24-hour format)
      const [h24, m] = value.split(":").map(Number);
      const h12 = h24 % 12 || 12;
      const ampm = h24 >= 12 ? "PM" : "AM";
      setSelectedHour(h12);
      setSelectedMinute(m || 0);
      setSelectedAMPM(ampm);

      // Scroll to position after a short delay
      setTimeout(() => {
        const hourOffset = (h12 - 1) * 56; // Approximate item height (1-12, so -1)
        const minuteOffset = (m || 0) * 56;
        hourScrollRef.current?.scrollTo({ y: hourOffset, animated: true });
        minuteScrollRef.current?.scrollTo({ y: minuteOffset, animated: true });
      }, 100);
    }
  }, [visible, value]);

  // Convert 12-hour to 24-hour format
  const convertTo24Hour = (hour12: number, minute: number, ampm: "AM" | "PM"): string => {
    let hour24 = hour12;
    if (ampm === "PM" && hour12 !== 12) {
      hour24 = hour12 + 12;
    } else if (ampm === "AM" && hour12 === 12) {
      hour24 = 0;
    }
    const h = hour24.toString().padStart(2, "0");
    const m = minute.toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  const formatDisplayTime = (hour: number, minute: number, ampm: "AM" | "PM") => {
    const m = minute.toString().padStart(2, "0");
    return `${hour}:${m} ${ampm}`;
  };

  const handleConfirm = () => {
    const timeString = convertTo24Hour(selectedHour, selectedMinute, selectedAMPM);
    onConfirm(timeString);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const handleCancel = () => {
    // Reset to original value
    const [h, m] = value.split(":").map(Number);
    setSelectedHour(h || 0);
    setSelectedMinute(m || 0);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.selectedTime}>
            {formatDisplayTime(selectedHour, selectedMinute, selectedAMPM)}
          </Text>

          <View style={styles.pickerContainer}>
            {/* Hours (12-hour) */}
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Hour</Text>
              <ScrollView
                ref={hourScrollRef}
                style={styles.scrollPicker}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {hoursList.map((hour) => (
                  <Pressable
                    key={hour}
                    onPress={() => {
                      setSelectedHour(hour);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[
                      styles.pickerItem,
                      selectedHour === hour && styles.pickerItemSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        selectedHour === hour && styles.pickerItemTextSelected,
                      ]}
                    >
                      {hour}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <Text style={styles.separator}>:</Text>

            {/* Minutes */}
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Minute</Text>
              <ScrollView
                ref={minuteScrollRef}
                style={styles.scrollPicker}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {minutesList.map((minute) => (
                  <Pressable
                    key={minute}
                    onPress={() => {
                      setSelectedMinute(minute);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[
                      styles.pickerItem,
                      selectedMinute === minute && styles.pickerItemSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        selectedMinute === minute && styles.pickerItemTextSelected,
                      ]}
                    >
                      {minute.toString().padStart(2, "0")}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* AM/PM */}
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>AM/PM</Text>
              <ScrollView
                style={styles.scrollPicker}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {ampmList.map((ampm) => (
                  <Pressable
                    key={ampm}
                    onPress={() => {
                      setSelectedAMPM(ampm);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[
                      styles.pickerItem,
                      selectedAMPM === ampm && styles.pickerItemSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        selectedAMPM === ampm && styles.pickerItemTextSelected,
                      ]}
                    >
                      {ampm}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <Pressable
              onPress={handleCancel}
              style={[styles.button, styles.cancelButton]}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleConfirm}
              style={[styles.button, styles.confirmButton]}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </Pressable>
          </View>
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
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a2e",
    textAlign: "center",
    marginBottom: 8,
  },
  selectedTime: {
    fontSize: 32,
    fontWeight: "800",
    color: "#4CAF50",
    textAlign: "center",
    marginBottom: 24,
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    height: 200,
  },
  pickerColumn: {
    flex: 1,
    alignItems: "center",
  },
  pickerLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
    marginBottom: 8,
  },
  scrollPicker: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    paddingVertical: 60,
    alignItems: "center",
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 2,
    borderRadius: 8,
    minWidth: 60,
    alignItems: "center",
  },
  pickerItemSelected: {
    backgroundColor: "#4CAF50",
  },
  pickerItemText: {
    fontSize: 18,
    color: "#666",
    fontWeight: "500",
  },
  pickerItemTextSelected: {
    color: "#FFF",
    fontWeight: "700",
  },
  separator: {
    fontSize: 32,
    fontWeight: "700",
    color: "#333",
    marginHorizontal: 8,
    marginTop: 30,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
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
  confirmButton: {
    backgroundColor: "#4CAF50",
  },
  confirmButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
