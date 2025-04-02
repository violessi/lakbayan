import { supabase } from "@utils/supabase";
import { newError } from "@utils/utils";

// Inserts data into a specified Supabase table.
export async function insertData(table: string, payload: any[]): Promise<any[]> {
  const errMsg = `Failed to insert data into ${table}`;
  try {
    const { data, error } = await supabase.from(table).insert(payload).select();
    if (error) throw new Error(error.message);
    return data;
  } catch (error: Error | any) {
    console.error("[API ERROR]", errMsg, error.message);
    throw new Error(error.message || errMsg);
  }
}

// Updates data in a specified Supabase table.
export async function updateData(
  payload: any,
  table: string,
  filters: Record<string, any>,
): Promise<any[]> {
  const errMsg = `Failed to update data in ${table}`;
  try {
    let query = supabase.from(table).update(payload);
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    const { data, error } = await query.select();
    if (error) throw new Error(error.message);
    return data;
  } catch (error: Error | any) {
    console.error("[API ERROR]", errMsg, error.message);
    throw new Error(error.message || errMsg);
  }
}

export async function deleteData(table: string, filters: Record<string, any[]>): Promise<string[]> {
  const errMsg = `Failed to delete data from ${table}`;

  try {
    let query = supabase.from(table).delete();

    // Apply filters dynamically
    Object.entries(filters).forEach(([key, value]) => {
      query = query.in(key, value);
    });

    const { data, error } = await query.select(); // Select returns deleted rows
    if (error) throw new Error(error.message);
    return data.map((row) => row.id);
  } catch (error: Error | any) {
    console.error("[API ERROR]", errMsg, error.message);
    throw new Error(error.message || errMsg);
  }
}

export async function fetchData(
  table: string,
  columns: string[] = ["*"],
  filters: Record<string, any> = {},
): Promise<any[]> {
  const errMsg = `Failed to fetch data from ${table}`;
  try {
    let query = supabase.from(table).select(columns.join(", "));

    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data;
  } catch (error: any) {
    console.error("[API ERROR]", errMsg, error.message);
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
    console.error("[API ERROR]", errMsg, error.message);
    throw new Error(error.message || errMsg);
  }
}
