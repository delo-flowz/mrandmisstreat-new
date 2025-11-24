//import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// It's recommended to store these in environment variables
// and use something like `expo-constants` or `react-native-dotenv`
// to access them.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    // On the server, you could throw an error.
    // On the client, you can log a warning.
    console.warn("Supabase URL or Anon Key is missing. Make sure to set up your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);