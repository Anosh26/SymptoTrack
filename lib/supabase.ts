import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://plpqlkqeyrgvlpayoaar.supabase.co'; // Replace with your actual Supabase URL
const supabaseAnonKey = 'sb_publishable_IQHZZkVsc8CheqvEPffAkQ_2BexHRbE'; // Replace with your actual Supabase anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Existing SymptomRecord type
export type SymptomRecord = {
  id: string;
  user_id: string;
  symptoms: string;
  painlvl: number;
  timestamp: string;
  description: string | null;
};

// Existing AppointmentRecord type
export type AppointmentRecord = {
  id: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  status: string;
  type: string;
  notes: string | null;
  created_at: string;
};

// User record from users table
export type UserRecord = {
  id: string;
  created_at: string;
  name: string;
  email: string | null;
  phone_number: string | null;
  role: 'patient' | 'doctor' | 'caregiver';
  assigned_doc: string | null;
  age: number;
  condition: string;
  status: 'Active' | 'Recovered' | 'Critical';
  risk_level: 'Low' | 'Moderate' | 'High';
  trend: 'up' | 'down' | 'stable';
  avatar_url: string | null;
};

// Patient profile from patient_profiles table
export type PatientProfileRecord = {
  user_id: string;
  age: number;
  condition: string;
  status: 'Active' | 'Recovered' | 'Critical';
  risk_level: 'Low' | 'Moderate' | 'High';
  trend: string;
  assigned_doctor_id: string | null;
  private_notes: string;
};

// Doctor profile from doctor_profiles table
export type DoctorProfileRecord = {
  user_id: string;
  specialization: string | null;
  hospital: string | null;
  experience: string | null;
  license_id: string | null;
  phone_number: string | null;
  gender: string | null;
  bio: string;
  department: string;
  qualifications: string;
  working_days: string;
  working_hours: string;
  consultation_mode: string;
  job_title: string;
  status: string;
};