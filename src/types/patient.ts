export interface Patient {
  id: string;
  name: string;
  age: number;
  riskLevel: 'HIGH' | 'LOW' | 'MODERATE';
  lastCheckIn: string; // e.g., "10 mins ago"
  painLevel: number;   // 1-10
  symptoms: string[];  // e.g., ["Fever", "Swelling"]
}