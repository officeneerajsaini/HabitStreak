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

interface WinRow {
  id: string;
  streak: number;
  reward: string;
  date: string;
  notes: string;
}

interface PenaltyRow {
  id: string;
  streak: number;
  penalty: string;
  date: string;
  notes: string;
}

const DEFAULT_WINS = [
  7, 14, 21, 30, 45, 60, 75, 100, 150, 200, 250, 300, 365,
];

const DEFAULT_PENALTIES = [
  3, 5, 7, 10, 14, 21, 30,
];

export default function WinsAndPenalties() {
  // Initialize with default streaks
  const [rows, setRows] = useState<WinRow[]>(
    DEFAULT_WINS.map((days) => ({
      id: `win-${days}`,
      streak: days,
      reward: "",
      date: "",
      notes: "",
    }))
  );

  // Initialize penalties
  const [penaltyRows, setPenaltyRows] = useState<PenaltyRow[]>(
    DEFAULT_PENALTIES.map((days) => ({
      id: `penalty-${days}`,
      streak: days,
      penalty: "",
      date: "",
      notes: "",
    }))
  );

  const [editingCell, setEditingCell] = useState<{
    id: string;
    field: string;
  } | null>(null);

  // Start editing a cell
  const handleCellPress = (id: string, field: keyof WinRow) => {
    if (field === "id") return; // Don't edit ID
    
    setEditingCell({ id, field });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Auto-save when value changes
  const handleValueChange = (value: string) => {
    if (!editingCell) return;

    setRows((prev) =>
      prev.map((row) =>
        row.id === editingCell.id
          ? { ...row, [editingCell.field]: value }
          : row
      )
    );
  };

  // Finish editing
  const handleFinishEdit = () => {
    setEditingCell(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Add new row
  const handleAddRow = () => {
    Alert.prompt(
      "Add New Streak Goal",
      "Enter number of days:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Add",
          onPress: (days?: string) => {
            const daysNum = parseInt(days || "0");
            if (daysNum > 0) {
              const newRow: WinRow = {
                id: `win-${Date.now()}`,
                streak: daysNum,
                reward: "",
                date: "",
                notes: "",
              };
              setRows((prev) => [...prev, newRow].sort((a, b) => a.streak - b.streak));
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          },
        },
      ],
      "plain-text"
    );
  };

  // Delete row
  const handleDeleteRow = (id: string) => {
    Alert.alert(
      "Delete Row",
      "Are you sure you want to delete this streak goal?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setRows((prev) => prev.filter((row) => row.id !== id));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
  };

  // Penalties handlers
  const handleAddPenaltyRow = () => {
    Alert.prompt(
      "Add New Penalty Streak",
      "Enter number of days:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Add",
          onPress: (days?: string) => {
            const daysNum = parseInt(days || "0");
            if (daysNum > 0) {
              const newRow: PenaltyRow = {
                id: `penalty-${Date.now()}`,
                streak: daysNum,
                penalty: "",
                date: "",
                notes: "",
              };
              setPenaltyRows((prev) => [...prev, newRow].sort((a, b) => a.streak - b.streak));
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          },
        },
      ],
      "plain-text"
    );
  };

  const handleDeletePenaltyRow = (id: string) => {
    Alert.alert(
      "Delete Penalty",
      "Are you sure you want to delete this penalty?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setPenaltyRows((prev) => prev.filter((row) => row.id !== id));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
  };

  const handlePenaltyCellPress = (id: string, field: keyof PenaltyRow) => {
    if (field === "id") return;
    setEditingCell({ id, field });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePenaltyValueChange = (value: string) => {
    if (!editingCell) return;
    setPenaltyRows((prev) =>
      prev.map((row) =>
        row.id === editingCell.id
          ? { ...row, [editingCell.field]: value }
          : row
      )
    );
  };

  const renderPenaltyCell = (row: PenaltyRow, field: keyof PenaltyRow) => {
    const isEditing = editingCell?.id === row.id && editingCell?.field === field;
    const value = row[field];
    const isEmpty = !value || value === "";

    if (field === "streak") {
      return (
        <Pressable
          onPress={() => handlePenaltyCellPress(row.id, field)}
          style={[styles.cell, styles.colStreak, styles.cellPressable]}
        >
          {isEditing ? (
            <TextInput
              value={String(value)}
              onChangeText={handlePenaltyValueChange}
              onBlur={handleFinishEdit}
              autoFocus
              keyboardType="number-pad"
              style={styles.input}
              maxLength={4}
            />
          ) : (
            <Text style={styles.cellText}>⚠️ {value} Days</Text>
          )}
        </Pressable>
      );
    }

    const columnStyle =
      field === "penalty"
        ? styles.colReward
        : field === "date"
        ? styles.colDate
        : styles.colNotes;

    return (
      <Pressable
        onPress={() => handlePenaltyCellPress(row.id, field)}
        style={[styles.cell, columnStyle, styles.cellPressable, isEmpty && styles.emptyCell]}
      >
        {isEditing ? (
          <TextInput
            value={String(value)}
            onChangeText={handlePenaltyValueChange}
            onBlur={handleFinishEdit}
            autoFocus
            style={styles.input}
            placeholder={`Enter ${field}...`}
            placeholderTextColor="#888"
            maxLength={field === "notes" ? 100 : 50}
          />
        ) : (
          <Text style={[styles.cellText, isEmpty && styles.emptyText]}>
            {isEmpty ? "—" : String(value)}
          </Text>
        )}
      </Pressable>
    );
  };

  const renderCell = (row: WinRow, field: keyof WinRow) => {
    const isEditing = editingCell?.id === row.id && editingCell?.field === field;
    const value = row[field];
    const isEmpty = !value || value === "";

    // Streak column (number only, with emoji)
    if (field === "streak") {
      return (
        <Pressable
          onPress={() => handleCellPress(row.id, field)}
          style={[styles.cell, styles.colStreak, styles.cellPressable]}
        >
          {isEditing ? (
            <TextInput
              value={String(value)}
              onChangeText={handleValueChange}
              onBlur={handleFinishEdit}
              autoFocus
              keyboardType="number-pad"
              style={styles.input}
              maxLength={4}
            />
          ) : (
            <Text style={styles.cellText}>🔥 {value} Days</Text>
          )}
        </Pressable>
      );
    }

    // Other editable columns
    const columnStyle =
      field === "reward"
        ? styles.colReward
        : field === "date"
        ? styles.colDate
        : styles.colNotes;

    return (
      <Pressable
        onPress={() => handleCellPress(row.id, field)}
        style={[styles.cell, columnStyle, styles.cellPressable, isEmpty && styles.emptyCell]}
      >
        {isEditing ? (
          <TextInput
            value={String(value)}
            onChangeText={handleValueChange}
            onBlur={handleFinishEdit}
            autoFocus
            style={styles.input}
            placeholder={`Enter ${field}...`}
            placeholderTextColor="#888"
            maxLength={field === "notes" ? 100 : 50}
          />
        ) : (
          <Text style={[styles.cellText, isEmpty && styles.emptyText]}>
            {isEmpty ? "—" : String(value)}
          </Text>
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* WINS SECTION */}
      <View style={styles.section}>
        {/* Title & Add Button */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>🏆 My Wins</Text>
          <Pressable onPress={handleAddRow} style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Add</Text>
          </Pressable>
        </View>

      {/* Rule */}
      <View style={styles.ruleRow}>
        <View style={styles.ruleLine} />
        <Text style={styles.ruleText}>
          To consider it as a Day you should at least do more than 75% of the habits
        </Text>
      </View>

      {/* Hint */}
      <Text style={styles.hint}>💡 Tap any cell to edit • Auto-saves as you type</Text>

      {/* Table */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          {/* Table Header */}
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.cell, styles.colStreak, styles.headerText]}>
              🔥 The Streak
            </Text>
            <Text style={[styles.cell, styles.colReward, styles.headerText]}>
              🎁 The Reward
            </Text>
            <Text style={[styles.cell, styles.colDate, styles.headerText]}>
              📅 Date
            </Text>
            <Text style={[styles.cell, styles.colNotes, styles.headerText]}>
              📝 Notes
            </Text>
            <Text style={[styles.cell, styles.colActions, styles.headerText]}>
              Actions
            </Text>
          </View>

          {/* Table Rows */}
          <ScrollView 
            style={styles.tableScroll} 
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
          >
            {rows.map((row) => (
              <View key={row.id} style={styles.row}>
                {renderCell(row, "streak")}
                {renderCell(row, "reward")}
                {renderCell(row, "date")}
                {renderCell(row, "notes")}

                {/* Delete Button */}
                <View style={[styles.cell, styles.colActions]}>
                  <Pressable
                    onPress={() => handleDeleteRow(row.id)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>🗑️</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
      </View>

      {/* PENALTIES SECTION */}
      <View style={[styles.section, styles.penaltiesSection]}>
        {/* Title & Add Button */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>⚠️ My Penalties</Text>
          <Pressable onPress={handleAddPenaltyRow} style={[styles.addButton, styles.penaltyButton]}>
            <Text style={styles.addButtonText}>+ Add</Text>
          </Pressable>
        </View>

        {/* Hint */}
        <Text style={styles.hint}>💡 Tap any cell to edit • Auto-saves as you type</Text>

        {/* Penalties Table */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            {/* Table Header */}
            <View style={[styles.row, styles.headerRow]}>
              <Text style={[styles.cell, styles.colStreak, styles.headerText]}>
                ⚠️ The Streak
              </Text>
              <Text style={[styles.cell, styles.colReward, styles.headerText]}>
                ⚠️ The Penalty
              </Text>
              <Text style={[styles.cell, styles.colDate, styles.headerText]}>
                📅 Date
              </Text>
              <Text style={[styles.cell, styles.colNotes, styles.headerText]}>
                📝 Notes
              </Text>
              <Text style={[styles.cell, styles.colActions, styles.headerText]}>
                Actions
              </Text>
            </View>

            {/* Table Rows */}
            <ScrollView 
              style={styles.tableScroll} 
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
            >
              {penaltyRows.map((row) => (
                <View key={row.id} style={styles.row}>
                  {renderPenaltyCell(row, "streak")}
                  {renderPenaltyCell(row, "penalty")}
                  {renderPenaltyCell(row, "date")}
                  {renderPenaltyCell(row, "notes")}

                  {/* Delete Button */}
                  <View style={[styles.cell, styles.colActions]}>
                    <Pressable
                      onPress={() => handleDeletePenaltyRow(row.id)}
                      style={styles.deleteButton}
                    >
                      <Text style={styles.deleteButtonText}>🗑️</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#3A3A38",
    borderRadius: 16,
    padding: 14,
    marginTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  penaltiesSection: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 2,
    borderTopColor: "rgba(255,107,107,0.3)",
  },

  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  addButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  penaltyButton: {
    backgroundColor: "#FF6B6B",
  },

  addButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },

  ruleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },

  ruleLine: {
    width: 4,
    height: "100%",
    backgroundColor: "#FFFFFF",
    marginRight: 10,
    borderRadius: 2,
  },

  ruleText: {
    color: "#E0E0E0",
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },

  hint: {
    color: "#FFD700",
    fontSize: 12,
    marginBottom: 12,
    fontStyle: "italic",
  },

  tableScroll: {
    maxHeight: 400,
  },

  row: {
    flexDirection: "row",
    borderTopWidth: 0.5,
    borderColor: "#555",
    paddingVertical: 10,
    alignItems: "center",
  },

  headerRow: {
    borderTopWidth: 0,
    paddingBottom: 8,
    backgroundColor: "#2A2A28",
  },

  cell: {
    paddingHorizontal: 8,
    justifyContent: "center",
  },

  cellPressable: {
    minHeight: 40,
  },

  emptyCell: {
    opacity: 0.5,
  },

  cellText: {
    color: "#FFFFFF",
    fontSize: 14,
  },

  emptyText: {
    color: "#FFFFFF",
    fontStyle: "italic",
    opacity: 0.5,
  },

  headerText: {
    fontWeight: "700",
    fontSize: 13,
    color: "#FFD700",
  },

  colStreak: {
    width: 100,
  },

  colReward: {
    width: 120,
  },

  colDate: {
    width: 90,
  },

  colNotes: {
    width: 150,
  },

  colActions: {
    width: 60,
    alignItems: "center",
  },

  input: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    fontSize: 14,
    minWidth: 80,
    borderWidth: 1,
    borderColor: "#4CAF50",
  },

  deleteButton: {
    padding: 6,
  },

  deleteButtonText: {
    fontSize: 18,
  },
});