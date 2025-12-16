import { Patient } from '../types/patient';

export const MOCK_PATIENTS: Patient[] = [
  {
    id: '1',
    name: 'Ramesh Gupta',
    age: 58,
    riskLevel: 'HIGH',
    lastCheckIn: '10 mins ago',
    painLevel: 8,
    symptoms: ['Chest Pain', 'Shortness of Breath'],
  },
  {
    id: '2',
    name: 'Anita Desai',
    age: 45,
    riskLevel: 'LOW',
    lastCheckIn: '2 hours ago',
    painLevel: 2,
    symptoms: ['Mild Headache'],
  },
  {
    id: '3',
    name: 'Suresh Verma',
    age: 62,
    riskLevel: 'MODERATE',
    lastCheckIn: '5 hours ago',
    painLevel: 5,
    symptoms: ['Fatigue'],
  },
  {
    id: '4',
    name: 'Priya Sharma',
    age: 29,
    riskLevel: 'LOW',
    lastCheckIn: '1 day ago',
    painLevel: 0,
    symptoms: [],
  },
];