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