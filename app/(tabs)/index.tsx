import { StyleSheet, View } from 'react-native';
// We use the '@' symbol to point to your components folder easily
import SymptomLogger from '@/components/SymptomLogger'; 

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <SymptomLogger />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // White background
  },
});