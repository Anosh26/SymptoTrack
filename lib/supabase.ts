import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://plpqlkqeyrgvlpayoaar.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBscHFsa3FleXJndmxwYXlvYWFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MzE1MTcsImV4cCI6MjA4MjMwNzUxN30.umoV3YW12A3zg3NR_wJGatScFH1dk-GOqm9voblHtPY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);