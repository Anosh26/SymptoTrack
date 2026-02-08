import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase project credentials
const SUPABASE_URL = 'https://plpqlkqeyrgvlpayoaar.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_IQHZZkVsc8CheqvEPffAkQ_2BexHRbE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Type for the symptoms table
export type SymptomRecord = {
  id: string;
  user_id: string;
  symptoms: string;
  painlvl: number;
  timestamp: string;
  description: string | null;
};

// New AppointmentRecord type based on your database schema
export type AppointmentRecord = {
  id: string;
  patient_id: string;
  doctor_id: string;
  date: string; // This stores both date and time as timestamptz
  status: string;
  type: string;
  notes: string | null;
  created_at: string;
};