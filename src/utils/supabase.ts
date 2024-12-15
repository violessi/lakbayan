import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://bspdqbaestgrqeanapux.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzcGRxYmFlc3RncnFlYW5hcHV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE0MzA0MjksImV4cCI6MjA0NzAwNjQyOX0.n3mqYGZI1kMn8hMd8gTAAaNSgGlkGBhC0CdxmKzss-I";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
