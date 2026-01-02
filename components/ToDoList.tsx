import * as Haptics from "expo-haptics";
import { useState } from "react";
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

type Priority = "high" | "medium" | "low";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
}

const PRIORITY_COLORS = {
  high: {
    bg: "#FFEBEE",
    border: "#EF5350",
    text: "#C62828",
    label: "Super Important",
  },
  medium: {
    bg: "#FFF3E0",
    border: "#FFA726",
    text: "#E65100",
    label: "Important",
  },
  low: {
    bg: "#E8F5E9",
    border: "#66BB6A",
    text: "#2E7D32",
    label: "Less Important",
  },
};

const MAX_TODOS = 5;

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputText, setInputText] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<Priority>("medium");
  const [showInput, setShowInput] = useState(false);

  const addTodo = () => {
    if (inputText.trim() === "") return;
    if (todos.length >= MAX_TODOS) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    const newTodo: Todo = {
      id: Date.now().toString(),
      text: inputText.trim(),
      completed: false,
      priority: selectedPriority,
    };

    // Sort by priority: high > medium > low, maintaining order within same priority
    let updatedTodos = [...todos];
    
    // Find the correct position to insert based on priority
    let insertIndex = 0;
    
    if (selectedPriority === "high") {
      // High priority goes at the top
      insertIndex = 0;
    } else if (selectedPriority === "medium") {
      // Medium goes after all high priority tasks
      insertIndex = updatedTodos.findIndex(todo => todo.priority === "low");
      if (insertIndex === -1) insertIndex = updatedTodos.length;
    } else {
      // Low priority goes at the bottom
      insertIndex = updatedTodos.length;
    }
    
    updatedTodos.splice(insertIndex, 0, newTodo);
    setTodos(updatedTodos);
    setInputText("");
    setShowInput(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const canAddMore = todos.length < MAX_TODOS;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>✅ Today's Tasks</Text>
        <Text style={styles.counter}>
          {todos.length}/{MAX_TODOS}
        </Text>
      </View>

      {/* Add Task Button */}
      {canAddMore && !showInput && (
        <Pressable
          style={styles.addButton}
          onPress={() => {
            setShowInput(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <Text style={styles.addButtonText}>+ Add Task</Text>
        </Pressable>
      )}

      {/* Input Section */}
      {showInput && (
        <View style={styles.inputSection}>
          <TextInput
            style={styles.input}
            placeholder="What needs to be done?"
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            autoFocus
            maxLength={60}
          />

          {/* Priority Selector */}
          <View style={styles.prioritySelector}>
            <Text style={styles.priorityLabel}>Priority:</Text>
            <View style={styles.priorityButtons}>
              {(["high", "medium", "low"] as Priority[]).map((priority) => (
                <Pressable
                  key={priority}
                  style={[
                    styles.priorityButton,
                    {
                      backgroundColor: PRIORITY_COLORS[priority].bg,
                      borderColor: PRIORITY_COLORS[priority].border,
                      borderWidth: selectedPriority === priority ? 2 : 1,
                    },
                  ]}
                  onPress={() => {
                    setSelectedPriority(priority);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text
                    style={[
                      styles.priorityButtonText,
                      { color: PRIORITY_COLORS[priority].text },
                    ]}
                  >
                    {PRIORITY_COLORS[priority].label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Pressable
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => {
                setShowInput(false);
                setInputText("");
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[
                styles.actionButton,
                styles.saveButton,
                !inputText.trim() && styles.saveButtonDisabled,
              ]}
              onPress={addTodo}
              disabled={!inputText.trim()}
            >
              <Text style={styles.saveButtonText}>Add Task</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Todo List */}
      {todos.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyText}>No tasks yet</Text>
          <Text style={styles.emptySubtext}>Add your first task to get started!</Text>
        </View>
      ) : (
        <FlatList
          data={todos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={[
                styles.todoItem,
                {
                  backgroundColor: PRIORITY_COLORS[item.priority].bg,
                  borderColor: PRIORITY_COLORS[item.priority].border,
                  opacity: item.completed ? 0.5 : 1,
                },
              ]}
            >
              {/* Priority Badge */}
              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: PRIORITY_COLORS[item.priority].border },
                ]}
              >
                <Text style={styles.priorityBadgeText}>
                  {item.priority === "high" ? "🔥" : item.priority === "medium" ? "⚡" : "✓"}
                </Text>
              </View>

              {/* Checkbox */}
              <Pressable
                style={styles.checkbox}
                onPress={() => toggleTodo(item.id)}
              >
                <Text style={styles.checkboxIcon}>
                  {item.completed ? "✅" : "⬜"}
                </Text>
              </Pressable>

              {/* Task Text */}
              <Pressable
                style={styles.todoTextContainer}
                onPress={() => toggleTodo(item.id)}
              >
                <Text
                  style={[
                    styles.todoText,
                    item.completed && styles.completedText,
                  ]}
                  numberOfLines={2}
                >
                  {item.text}
                </Text>
              </Pressable>

              {/* Delete Button */}
              <Pressable
                style={styles.deleteButton}
                onPress={() => deleteTodo(item.id)}
              >
                <Text style={styles.deleteButtonText}>🗑️</Text>
              </Pressable>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Max Limit Warning */}
      {!canAddMore && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>
            ⚠️ Maximum 5 tasks reached. Complete or delete tasks to add more.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 14,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    minHeight: 200,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1a1a2e",
  },

  counter: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  addButton: {
    backgroundColor: "#3949AB",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 12,
  },

  addButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },

  inputSection: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },

  input: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: "#333",
    borderWidth: 1,
    borderColor: "#DDD",
    marginBottom: 12,
  },

  prioritySelector: {
    marginBottom: 12,
  },

  priorityLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },

  priorityButtons: {
    flexDirection: "row",
    gap: 8,
  },

  priorityButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: "center",
  },

  priorityButtonText: {
    fontSize: 11,
    fontWeight: "600",
  },

  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },

  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  cancelButton: {
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#DDD",
  },

  cancelButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
  },

  saveButton: {
    backgroundColor: "#3949AB",
  },

  saveButtonDisabled: {
    backgroundColor: "#CCC",
  },

  saveButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },

  emptySubtext: {
    fontSize: 13,
    color: "#666",
  },

  listContent: {
    paddingBottom: 8,
  },

  todoItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    gap: 8,
  },

  priorityBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  priorityBadgeText: {
    fontSize: 12,
  },

  checkbox: {
    padding: 4,
  },

  checkboxIcon: {
    fontSize: 20,
  },

  todoTextContainer: {
    flex: 1,
  },

  todoText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },

  completedText: {
    textDecorationLine: "line-through",
    color: "#999",
  },

  deleteButton: {
    padding: 4,
  },

  deleteButtonText: {
    fontSize: 18,
  },

  warningBanner: {
    backgroundColor: "#FFF3E0",
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#FFB74D",
  },

  warningText: {
    fontSize: 12,
    color: "#E65100",
    textAlign: "center",
  },
});