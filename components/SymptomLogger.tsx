import React, { useEffect, useState } from "react";
import { Alert, Button, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { supabase } from "../lib/supabase";

export default function SymptomLogger() {
  const [symptomText, setSymptomText] = useState("");
  const [symptoms, setSymptoms] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // 1. Get the current user from Supabase Auth
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchSymptoms(user.id);
      }
    };
    getCurrentUser();
  }, []);

  const fetchSymptoms = async (uid: string) => {
    const { data: list, error } = await supabase
      .from('symptoms')
      .select('*')
      .eq('user_id', uid)
      .order('timestamp', { ascending: false });
      
    if (list) setSymptoms(list);
    if (error) console.error(error);
  };

  const handleLogSymptom = async () => {
    if (!userId || !symptomText) return;

    const { error } = await supabase
      .from('symptoms')
      .insert({
        user_id: userId, // Uses the Supabase User ID
        description: symptomText,
        painlvl: 5,
      });

    if (!error) {
      setSymptomText(""); 
      fetchSymptoms(userId); // Refresh list
    } else {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>SymptoTrack</Text>

      <View style={styles.divider} />

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

      <Text style={styles.subtitle}>Recent History</Text>
      {symptoms.map((item) => (
        <View key={item.id} style={styles.item}>
          <Text style={styles.text}>{item.description}</Text>
          <Text style={styles.date}>
            {new Date(item.timestamp || item.created_at).toLocaleString()}
          </Text>
        </View>
      ))}
      
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