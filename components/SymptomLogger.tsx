import React, { useState, useEffect } from "react";
import { View, Text, Button, TextInput, FlatList, StyleSheet, ScrollView } from "react-native"; // Added ScrollView
import { supabase } from "../lib/supabase";
import MedicationList from "./MedicationList"; // <--- IMPORT THIS

export default function SymptomLogger() {
  const [symptomText, setSymptomText] = useState("");
  const [symptoms, setSymptoms] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUserAndSymptoms();
  }, []);

  const fetchUserAndSymptoms = async () => {
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .limit(1)
      .single();

    if (user) {
      setUserId(user.id);
      const { data: list } = await supabase
        .from('symptoms')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });
        
      if (list) setSymptoms(list);
    }
  };

  const handleLogSymptom = async () => {
    if (!userId || !symptomText) return;

    const { error } = await supabase
      .from('symptoms')
      .insert({
        user_id: userId,
        description: symptomText,
        severity: 5,
      });

    if (!error) {
      setSymptomText(""); 
      fetchUserAndSymptoms();
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>SymptoTrack</Text>
      
      {/* 1. MEDICATION SECTION (New) */}
      {userId && <MedicationList userId={userId} />}

      <View style={styles.divider} />

      {/* 2. SYMPTOM INPUT SECTION */}
      <Text style={styles.subtitle}>Log a Symptom</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="e.g. Headache"
          value={symptomText}
          onChangeText={setSymptomText}
        />
        <Button title="Save" onPress={handleLogSymptom} />
      </View>

      {/* 3. SYMPTOM HISTORY */}
      <Text style={styles.subtitle}>Recent History</Text>
      {/* We use .map() here because we are inside a ScrollView */}
      {symptoms.map((item) => (
        <View key={item.id} style={styles.item}>
          <Text style={styles.text}>{item.description}</Text>
          <Text style={styles.date}>{new Date(item.timestamp).toLocaleString()}</Text>
        </View>
      ))}
      
      {/* Bottom padding for scrolling */}
      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20, color: "#333" },
  subtitle: { fontSize: 20, fontWeight: "600", marginTop: 10, marginBottom: 10, color: "#444" },
  divider: { height: 1, backgroundColor: "#ccc", marginVertical: 20 },
  inputContainer: { flexDirection: "row", marginBottom: 20, gap: 10 },
  input: { flex: 1, borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8, fontSize: 16 },
  item: { padding: 15, backgroundColor: "#f5f5f5", marginBottom: 10, borderRadius: 8 },
  text: { fontSize: 16, fontWeight: "500" },
  date: { fontSize: 12, color: "#666", marginTop: 4 },
});