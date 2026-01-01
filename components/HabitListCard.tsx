import { loadHabits, saveHabits } from "@/storage/habitStorage";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

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


export default function HabitListCard() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newHabit, setNewHabit] = useState("");

  useEffect(() => {
    loadHabits().then(setHabits);
  }, []);

  useEffect(() => {
    saveHabits(habits);
  }, [habits]);


  function addHabit() {
    if (!newHabit.trim()) return;

    setHabits((prev) => [
      ...prev,
      { id: Date.now().toString(), title: newHabit },
    ]);

    setNewHabit("");
    setShowAdd(false);
  }


  function deleteHabit(id: string) {
    Alert.alert(
      "Delete Habit",
      "This habit will be removed from all future tracking. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            setHabits((prev) => prev.filter((h) => h.id !== id)),
        },
      ]
    );
  }


  const renderItem = ({ item, drag, isActive }: RenderItemParams<Habit>) => {
    return (
      <View
        style={[
          styles.habitRow,
          isActive && { opacity: 0.6 },
        ]}
      >
        {/* Drag Handle */}
        <Pressable onLongPress={drag} style={styles.dragHandle}>
          <Text style={styles.dragIcon}>≡</Text>
        </Pressable>

        <Text style={styles.habitText}>{item.title}</Text>

        {/* Delete */}
        <Pressable onPress={() => deleteHabit(item.id)}>
          <Text style={styles.delete}>🗑</Text>
        </Pressable>
      </View>
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
          scrollEnabled={false}
          activationDistance={10} // 🔥 REQUIRED
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
  dragHandle: {
    paddingHorizontal: 6,
    paddingTop: 4,
  },

  dragIcon: {
    color: "#FFF",
    fontSize: 18,
    marginRight: 8,
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
  delete: {
    color: "#FFF",
    fontSize: 22,
    marginLeft: 10,
  },
});
