import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = "https://plpqlkqeyrgvlpayoaar.supabase.co";
const supabaseAnonKey = "sb_publishable_IQHZZkVsc8CheqvEPffAkQ_2BexHRbE";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);