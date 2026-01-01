import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";

type Habit = {
  id: string;
  title: string;
};

const INITIAL_HABITS: Habit[] = [
  { id: "1", title: "Drink 2.5 L of water 💧" },
  { id: "2", title: "Exercise 30 minutes 🏋️" },
  { id: "3", title: "Plan today's tasks 📋" },
  { id: "4", title: "Eat healthy, real foods 🥗" },
  { id: "5", title: "Study ≥ 6 hours 💻" },
  { id: "6", title: "No caffeine ☕" },
  { id: "7", title: "No scrolling 📱" },
  { id: "8", title: "No sugar 🍰" },
  { id: "9", title: "Social media ≤ 120 min 📱" },
  { id: "10", title: "Email 5:00 PM 📧" },
  { id: "11", title: "Journal & self-reflect ✒️" },
  { id: "12", title: "Read 30 minutes 📖" },
  { id: "13", title: "Sleep ≥ 8 hours 💤" },
];

export default function HabitListCard() {
  const [habits, setHabits] = useState(INITIAL_HABITS);
  const [showAdd, setShowAdd] = useState(false);
  const [newHabit, setNewHabit] = useState("");

  function addHabit() {
    if (!newHabit.trim()) return;

    setHabits((prev) => [
      ...prev,
      { id: Date.now().toString(), title: newHabit },
    ]);

    setNewHabit("");
    setShowAdd(false);
  }

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Habit>) => {
    return (
      <Pressable
        onLongPress={drag}
        disabled={isActive}
        style={[
          styles.habitRow,
          isActive && { opacity: 0.6 },
        ]}
      >
        <Text style={styles.bullet}>•</Text>
        <Text style={styles.habitText}>{item.title}</Text>
      </Pressable>
    );
  };

  return (
    <View>
      {/* Quote */}
      <View style={styles.quoteContainer}>
        <View style={styles.quoteLine} />
        <Text style={styles.quoteText}>Progress not Perfection</Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.title}>Habit List</Text>

        <DraggableFlatList
          data={habits}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onDragEnd={({ data }) => setHabits(data)}
          scrollEnabled={false} // ❌ NO SCROLL INSIDE
        />

        {/* Add habit (hidden by default) */}
        {showAdd ? (
          <View style={styles.addContainer}>
            <TextInput
              value={newHabit}
              onChangeText={setNewHabit}
              placeholder="New habit..."
              placeholderTextColor="#AAA"
              style={styles.input}
              onSubmitEditing={addHabit}
            />
            <Pressable onPress={addHabit}>
              <Text style={styles.addBtn}>Add</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => setShowAdd(true)}>
            <Text style={styles.showAdd}>+ Add habit</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  quoteContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  quoteLine: {
    width: 4,
    height: 22,
    backgroundColor: "#FFF",
    marginRight: 10,
    borderRadius: 2,
  },
  quoteText: {
    color: "#FFF",
    fontSize: 16,
  },
  card: {
    backgroundColor: "#3A3A38",
    borderRadius: 18,
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 10,
  },
  habitRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  bullet: {
    color: "#FFF",
    fontSize: 22,
    marginRight: 10,
  },
  habitText: {
    color: "#FFF",
    fontSize: 17,
    lineHeight: 26,
    flex: 1,
  },
  showAdd: {
    color: "#A8E6CF",
    marginTop: 8,
    fontSize: 15,
  },
  addContainer: {
    marginTop: 8,
  },
  input: {
    backgroundColor: "#2A2A28",
    color: "#FFF",
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
  },
  addBtn: {
    color: "#A8E6CF",
    fontWeight: "600",
  },
});
