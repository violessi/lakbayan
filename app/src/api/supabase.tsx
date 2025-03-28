import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { newError } from "@utils/utils";

export const supabaseUrl = "https://bspdqbaestgrqeanapux.supabase.co";

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

// ================== API ==================
type APISuccess = { data: unknown[]; error: null };
type APIFailure = { data: null; error: ApiError };
type APIResponse = Promise<APISuccess | APIFailure>;

export async function insertData(table: string, payload: any[]): APIResponse {
  const errMsg = `Failed to insert data into ${table}`;
  try {
    const { data, error } = await supabase.from(table).insert(payload).select();
    return error ? { data: null, error: newError(errMsg, error) } : { data, error: null };
  } catch (error) {
    return { data: null, error: newError(errMsg, error) };
  }
}

export async function fetchDataRPC<T>(fn: string, params: any): APIResponse {
  const errMsg = "Failed to fetch data";
  try {
    const { data, error } = await supabase.rpc(fn, params);
    return error ? { data: null, error: newError(errMsg, error) } : { data, error: null };
  } catch (error) {
    return { data: null, error: newError(errMsg, error) };
  }
}
