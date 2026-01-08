import * as Haptics from "expo-haptics";
import { useState } from "react";
import {
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

interface MonthlyMilestone {
  month: number; // 0-11
  title: string;
  description: string;
  completed: boolean;
  notes: string;
}

interface YearlyGoal {
  id: string;
  title: string;
  description: string;
  label: string; // Short text instead of emoji
  deadline: string; // YYYY-MM-DD
  year: number;
  milestones: MonthlyMilestone[];
}

export default function GoalsManager() {
  const [goals, setGoals] = useState<YearlyGoal[]>([]);
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [showAddMilestoneModal, setShowAddMilestoneModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<{
    goalId: string;
    month: number;
  } | null>(null);

  // Add Goal Form
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalDescription, setNewGoalDescription] = useState("");
  const [newGoalLabel, setNewGoalLabel] = useState("");
  const [newGoalDeadline, setNewGoalDeadline] = useState("");
  const [newGoalYear, setNewGoalYear] = useState(new Date().getFullYear().toString());

  // Add/Edit Milestone Form
  const [milestoneMonth, setMilestoneMonth] = useState(0);
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [milestoneDescription, setMilestoneDescription] = useState("");
  const [milestoneNotes, setMilestoneNotes] = useState("");

  const handleAddGoal = () => {
    if (!newGoalTitle.trim()) {
      Alert.alert("Error", "Please enter a goal title");
      return;
    }

    const newGoal: YearlyGoal = {
      id: `goal-${Date.now()}`,
      title: newGoalTitle.trim(),
      description: newGoalDescription.trim(),
      label: newGoalLabel.trim(),
      deadline: newGoalDeadline.trim(),
      year: parseInt(newGoalYear),
      milestones: Array.from({ length: 12 }, (_, i) => ({
        month: i,
        title: "",
        description: "",
        completed: false,
        notes: "",
      })),
    };

    setGoals([...goals, newGoal]);
    setNewGoalTitle("");
    setNewGoalDescription("");
    setNewGoalLabel("");
    setNewGoalDeadline("");
    setShowAddGoalModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleSaveMilestone = () => {
    if (!editingMilestone) return;
    if (!milestoneTitle.trim()) {
      Alert.alert("Error", "Please enter a milestone title");
      return;
    }

    setGoals(
      goals.map((goal) => {
        if (goal.id === editingMilestone.goalId) {
          const updatedMilestones = [...goal.milestones];
          updatedMilestones[editingMilestone.month] = {
            month: editingMilestone.month,
            title: milestoneTitle.trim(),
            description: milestoneDescription.trim(),
            completed: updatedMilestones[editingMilestone.month].completed,
            notes: milestoneNotes.trim(),
          };
          return { ...goal, milestones: updatedMilestones };
        }
        return goal;
      })
    );

    setMilestoneTitle("");
    setMilestoneDescription("");
    setMilestoneNotes("");
    setEditingMilestone(null);
    setShowAddMilestoneModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const toggleMilestoneCompletion = (goalId: string, month: number) => {
    setGoals(
      goals.map((goal) => {
        if (goal.id === goalId) {
          const updatedMilestones = [...goal.milestones];
          updatedMilestones[month].completed = !updatedMilestones[month].completed;
          return { ...goal, milestones: updatedMilestones };
        }
        return goal;
      })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const openMilestoneEditor = (goalId: string, month: number) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    const milestone = goal.milestones[month];
    setMilestoneMonth(month);
    setMilestoneTitle(milestone.title);
    setMilestoneDescription(milestone.description);
    setMilestoneNotes(milestone.notes);
    setEditingMilestone({ goalId, month });
    setShowAddMilestoneModal(true);
  };

  const deleteGoal = (goalId: string) => {
    Alert.alert("Delete Goal", "Are you sure you want to delete this goal?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setGoals(goals.filter((g) => g.id !== goalId));
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        },
      },
    ]);
  };

  const getProgressPercentage = (milestones: MonthlyMilestone[]) => {
    const completedCount = milestones.filter((m) => m.completed).length;
    return Math.round((completedCount / 12) * 100);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎯 My Goals</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => setShowAddGoalModal(true)}
        >
          <Text style={styles.addButtonText}>+ Add Goal</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {goals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyText}>No goals yet</Text>
            <Text style={styles.emptySubtext}>
              Create your first yearly goal to get started!
            </Text>
          </View>
        ) : (
          goals.map((goal) => {
            const progress = getProgressPercentage(goal.milestones);
            const isExpanded = expandedGoalId === goal.id;

            return (
              <View key={goal.id} style={styles.goalCard}>
                {/* Goal Header */}
                <Pressable
                  onPress={() =>
                    setExpandedGoalId(isExpanded ? null : goal.id)
                  }
                  style={styles.goalHeader}
                >
                  <View style={styles.goalHeaderLeft}>
                    {goal.label && (
                      <View style={styles.labelBadge}>
                        <Text style={styles.labelText}>{goal.label}</Text>
                      </View>
                    )}
                    <View style={styles.goalInfo}>
                      <Text style={styles.goalTitle}>{goal.title}</Text>
                      {goal.description && (
                        <Text style={styles.goalDescription} numberOfLines={2}>
                          {goal.description}
                        </Text>
                      )}
                      {goal.deadline && (
                        <Text style={styles.goalDeadline}>
                          📅 Deadline: {goal.deadline}
                        </Text>
                      )}
                    </View>
                  </View>
                  <Text style={styles.expandIcon}>{isExpanded ? "▼" : "▶"}</Text>
                </Pressable>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[styles.progressFill, { width: `${progress}%` }]}
                    />
                  </View>
                  <Text style={styles.progressText}>{progress}%</Text>
                </View>
                <Text style={styles.progressSubtext}>
                  {goal.milestones.filter((m) => m.completed).length}/12 months
                  completed
                </Text>

                {/* Expanded Milestones */}
                {isExpanded && (
                  <View style={styles.milestonesContainer}>
                    <Text style={styles.milestonesTitle}>
                      📅 Monthly Milestones
                    </Text>

                    {goal.milestones.map((milestone, index) => {
                      const hasContent = milestone.title || milestone.description;

                      return (
                        <Pressable
                          key={index}
                          onPress={() => openMilestoneEditor(goal.id, index)}
                          style={[
                            styles.milestoneItem,
                            milestone.completed && styles.milestoneCompleted,
                          ]}
                        >
                          <Pressable
                            onPress={() =>
                              toggleMilestoneCompletion(goal.id, index)
                            }
                            style={styles.checkbox}
                          >
                            <Text style={styles.checkboxIcon}>
                              {milestone.completed ? "✅" : "⬜"}
                            </Text>
                          </Pressable>

                          <View style={styles.milestoneContent}>
                            <Text style={styles.monthName}>
                              {MONTHS[index]} {goal.year}
                            </Text>
                            {hasContent ? (
                              <>
                                <Text style={styles.milestoneTitle}>
                                  {milestone.title}
                                </Text>
                                {milestone.description && (
                                  <Text style={styles.milestoneDescription}>
                                    {milestone.description}
                                  </Text>
                                )}
                                {milestone.notes && (
                                  <Text style={styles.milestoneNotes}>
                                    📝 {milestone.notes}
                                  </Text>
                                )}
                              </>
                            ) : (
                              <Text style={styles.emptyMilestone}>
                                Tap to add milestone
                              </Text>
                            )}
                          </View>
                        </Pressable>
                      );
                    })}

                    {/* Delete Goal Button */}
                    <Pressable
                      onPress={() => deleteGoal(goal.id)}
                      style={styles.deleteGoalButton}
                    >
                      <Text style={styles.deleteGoalText}>
                        🗑️ Delete Goal
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Add Goal Modal */}
      <Modal
        visible={showAddGoalModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Goal</Text>

            <Text style={styles.inputLabel}>Goal Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Complete diploma and get internship"
              value={newGoalTitle}
              onChangeText={setNewGoalTitle}
              maxLength={100}
            />

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your goal in detail..."
              value={newGoalDescription}
              onChangeText={setNewGoalDescription}
              multiline
              numberOfLines={3}
              maxLength={500}
            />

            <Text style={styles.inputLabel}>Short Label</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Career, Education, Health"
              value={newGoalLabel}
              onChangeText={setNewGoalLabel}
              maxLength={20}
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.inputLabel}>Year</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2026"
                  value={newGoalYear}
                  onChangeText={setNewGoalYear}
                  keyboardType="number-pad"
                  maxLength={4}
                />
              </View>

              <View style={styles.halfWidth}>
                <Text style={styles.inputLabel}>Deadline</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={newGoalDeadline}
                  onChangeText={setNewGoalDeadline}
                  maxLength={10}
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setShowAddGoalModal(false)}
                style={[styles.modalButton, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleAddGoal}
                style={[styles.modalButton, styles.saveButton]}
              >
                <Text style={styles.saveButtonText}>Create Goal</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add/Edit Milestone Modal */}
      <Modal
        visible={showAddMilestoneModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {MONTHS[milestoneMonth]} Milestone
            </Text>

            <Text style={styles.inputLabel}>Milestone Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Complete Module 1, 2, 3"
              value={milestoneTitle}
              onChangeText={setMilestoneTitle}
              maxLength={100}
            />

            <Text style={styles.inputLabel}>Target/Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="What do you want to achieve this month?"
              value={milestoneDescription}
              onChangeText={setMilestoneDescription}
              multiline
              numberOfLines={3}
              maxLength={500}
            />

            <Text style={styles.inputLabel}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Any additional notes..."
              value={milestoneNotes}
              onChangeText={setMilestoneNotes}
              multiline
              numberOfLines={2}
              maxLength={300}
            />

            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => {
                  setShowAddMilestoneModal(false);
                  setEditingMilestone(null);
                  setMilestoneTitle("");
                  setMilestoneDescription("");
                  setMilestoneNotes("");
                }}
                style={[styles.modalButton, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSaveMilestone}
                style={[styles.modalButton, styles.saveButton]}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    minHeight: 400,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1a1a2e",
  },

  addButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },

  addButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },

  scrollView: {
    maxHeight: 600,
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },

  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },

  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },

  emptySubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },

  goalCard: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },

  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  goalHeaderLeft: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
  },

  labelBadge: {
    backgroundColor: "#3949AB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },

  labelText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "600",
  },

  goalInfo: {
    flex: 1,
  },

  goalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 4,
  },

  goalDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },

  goalDeadline: {
    fontSize: 12,
    color: "#FF5722",
    fontWeight: "600",
  },

  expandIcon: {
    fontSize: 16,
    color: "#666",
  },

  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
  },

  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
  },

  progressText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4CAF50",
    minWidth: 45,
    textAlign: "right",
  },

  progressSubtext: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },

  milestonesContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },

  milestonesTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 12,
  },

  milestoneItem: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#FFF",
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },

  milestoneCompleted: {
    backgroundColor: "#E8F5E9",
    borderColor: "#4CAF50",
  },

  checkbox: {
    marginRight: 12,
  },

  checkboxIcon: {
    fontSize: 20,
  },

  milestoneContent: {
    flex: 1,
  },

  monthName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3949AB",
    marginBottom: 4,
  },

  milestoneTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },

  milestoneDescription: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },

  milestoneNotes: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },

  emptyMilestone: {
    fontSize: 13,
    color: "#999",
    fontStyle: "italic",
  },

  deleteGoalButton: {
    backgroundColor: "#FFEBEE",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#EF5350",
  },

  deleteGoalText: {
    color: "#D32F2F",
    fontSize: 14,
    fontWeight: "600",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
    width: "90%",
    maxHeight: "80%",
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 20,
    textAlign: "center",
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginBottom: 6,
    marginTop: 12,
  },

  input: {
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: "#333",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },

  textArea: {
    height: 80,
    textAlignVertical: "top",
  },

  row: {
    flexDirection: "row",
    gap: 12,
  },

  halfWidth: {
    flex: 1,
  },

  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },

  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  cancelButton: {
    backgroundColor: "#F5F5F5",
  },

  cancelButtonText: {
    color: "#666",
    fontSize: 15,
    fontWeight: "600",
  },

  saveButton: {
    backgroundColor: "#4CAF50",
  },

  saveButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },
});