import React, { useState, useEffect } from "react";
import { View, Text, Button, TextInput, FlatList, StyleSheet } from "react-native";
import { supabase } from "../lib/supabase"; // Import the file you just made

export default function SymptomLogger() {
  const [symptomText, setSymptomText] = useState("");
  const [symptoms, setSymptoms] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // 1. Load Data on Startup
  useEffect(() => {
    fetchUserAndSymptoms();
  }, []);

  const fetchUserAndSymptoms = async () => {
    // A. Get the Test Patient (We created this in the SQL step)
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .limit(1)
      .single();

    if (user) {
      setUserId(user.id);
      
      // B. Get Symptoms for this user
      const { data: list } = await supabase
        .from('symptoms')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });
        
      if (list) setSymptoms(list);
    }
  };

  // 2. Function to Log Data
  const handleLogSymptom = async () => {
    if (!userId || !symptomText) return;

    // C. Insert into Database
    const { error } = await supabase
      .from('symptoms')
      .insert({
        user_id: userId,
        description: symptomText,
        severity: 5, // Hardcoded for now
      });

    if (!error) {
      setSymptomText(""); 
      fetchUserAndSymptoms(); // Refresh the list
    } else {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SymptoTrack (SQL)</Text>
      
      {/* Input Section */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="New Symptom..."
          value={symptomText}
          onChangeText={setSymptomText}
        />
        <Button title="Save" onPress={handleLogSymptom} />
      </View>

      {/* List Section */}
      <FlatList
        data={symptoms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.text}>{item.description}</Text>
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
  inputContainer: { flexDirection: "row", marginBottom: 20, gap: 10 },
  input: { flex: 1, borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5 },
  item: { padding: 15, backgroundColor: "#eee", marginBottom: 10, borderRadius: 5 },
  text: { fontSize: 16 },
  date: { fontSize: 12, color: "#666", marginTop: 5 },
});