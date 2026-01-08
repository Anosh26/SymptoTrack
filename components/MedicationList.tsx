import React, { useState, useEffect } from "react";
import { View, Text, Button, FlatList, StyleSheet, Alert } from "react-native";
import { supabase } from "../lib/supabase";

export default function MedicationList({ userId }: { userId: string }) {
  const [meds, setMeds] = useState<any[]>([]);

  useEffect(() => {
    if (userId) fetchMeds();
  }, [userId]);

  const fetchMeds = async () => {
    // 1. Get the list of drugs for this patient
    const { data } = await supabase
      .from('medications')
      .select('*')
      .eq('user_id', userId);
    
    if (data) setMeds(data);
  };

  const handleTakeDose = async (medId: string, medName: string) => {
    // 2. Log that they took it
    const { error } = await supabase
      .from('medication_logs')
      .insert({
        medication_id: medId,
        status: 'taken',
        taken_at: new Date().toISOString(),
      });

    if (!error) {
      Alert.alert("Success", `Logged dose for ${medName}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Medications</Text>
      <FlatList
        data={meds}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.detail}>{item.dosage} • {item.frequency}</Text>
            </View>
            <Button title="Take" onPress={() => handleTakeDose(item.id, item.name)} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 20 },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  item: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    padding: 15, 
    backgroundColor: "#e3f2fd", // Light blue
    marginBottom: 8, 
    borderRadius: 8 
  },
  name: { fontSize: 16, fontWeight: "600" },
  detail: { color: "#555" }
});