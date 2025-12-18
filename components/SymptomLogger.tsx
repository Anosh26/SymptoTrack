import React, { useState } from "react";
import { View, Text, Button, TextInput, FlatList, StyleSheet } from "react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export default function SymptomLogger() {
  const [symptomText, setSymptomText] = useState("");
  
  // 1. DATABASE HOOKS
  // Get the current test user
  const currentUser = useQuery(api.patients.getAnyPatient);
  // Get symptoms for this user (if user exists)
  const symptoms = useQuery(api.symptoms.getSymptoms, 
    currentUser ? { userId: currentUser._id } : "skip"
  );
  
  // Mutations to write data
  const createPatient = useMutation(api.patients.createPatient);
  const logSymptom = useMutation(api.symptoms.logSymptom);

  // 2. HANDLERS
  const handleCreateUser = async () => {
    await createPatient({ name: "Test Patient", email: "test@test.com", phone: "555-0100" });
  };

  const handleLogSymptom = async () => {
    if (!currentUser || !symptomText) return;
    await logSymptom({
      userId: currentUser._id,
      description: symptomText,
      severity: 5, // Defaulting to 5 for this test
    });
    setSymptomText(""); // Clear input
  };

  // 3. UI RENDER
  if (currentUser === undefined) return <Text>Loading...</Text>;

  if (currentUser === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to SymptoTrack</Text>
        <Text style={styles.label}>No users found.</Text>
        <Button title="Create Test Patient Account" onPress={handleCreateUser} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Patient: {currentUser.name}</Text>
      
      {/* INPUT FORM */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="How do you feel? (e.g. Headache)"
          value={symptomText}
          onChangeText={setSymptomText}
        />
        <Button title="Log" onPress={handleLogSymptom} />
      </View>

      {/* REAL-TIME LIST */}
      <Text style={styles.subtitle}>Recent Symptoms:</Text>
      <FlatList
        data={symptoms}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.symptomText}>{item.description}</Text>
            <Text style={styles.date}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  subtitle: { fontSize: 18, marginTop: 20, marginBottom: 10, fontWeight: "600" },
  inputContainer: { flexDirection: "row", gap: 10, marginBottom: 10 },
  input: { flex: 1, borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 8 },
  item: { padding: 15, backgroundColor: "#f0f0f0", marginBottom: 10, borderRadius: 8 },
  symptomText: { fontSize: 16, fontWeight: "500" },
  date: { color: "#666", fontSize: 12, marginTop: 4 },
  label: { marginBottom: 20, fontSize: 16 }
});