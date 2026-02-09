import { AppState } from 'react-native';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://plpqlkqeyrgvlpayoaar.supabase.co";
const supabaseAnonKey = "sb_publishable_IQHZZkVsc8CheqvEPffAkQ_2BexHRbE";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage, // <--- This saves the session to the phone
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// OPTIONAL: Tells Supabase to stop refreshing tokens when app is in background
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});