import { supabase } from "@utils/supabase";
import { newError } from "@utils/utils";

// type APISuccess = { data: any[]; error: null };
// type APIFailure = { data: null; error: APIError };
// type APIResponse = Promise<APISuccess | APIFailure>;

// Inserts data into a specified Supabase table.
export async function insertData(table: string, payload: any[]): Promise<any[]> {
  const errMsg = `Failed to insert data into ${table}`;
  try {
    const { data, error } = await supabase.from(table).insert(payload).select();
    if (error) throw new Error(error.message);
    return data;
  } catch (error: Error | any) {
    throw new Error(error.message || errMsg);
  }
}

// Inserts data into a specified Supabase table.
export async function fetchDataRPC(fn: string, params: any): Promise<any[]> {
  const errMsg = `Failed to fetch data from ${fn}`;
  try {
    const { data, error } = await supabase.rpc(fn, params);
    if (error) throw new Error(error.message);
    return data;
  } catch (error: Error | any) {
    throw new Error(error.message || errMsg);
  }
}
