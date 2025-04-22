import { insertData, updateData, fetchData, deleteData } from "@api/supabase";

import {
    convertKeysToSnakeCase,
    convertToPointWKT,
  } from "@utils/map-utils";

// ============================SEARCH LOGS============================

export async function insertSearchLog(log: CreateSearchLog): Promise<string> {
    try {
        const payload = convertKeysToSnakeCase(log);
        payload.start_coords = convertToPointWKT(payload.start_coords);
        payload.end_coords = convertToPointWKT(payload.end_coords);
        const res = await insertData("logs_search_trip", [payload]);
        return res[0].id;
    } catch (error) {
        throw new Error("Error inserting search log");
    }
}

export async function updateSearchLog(log: Partial<SearchLog>): Promise<string> {
    try {
      const payload = convertKeysToSnakeCase(log);
  
      if (!log.id) throw new Error("Missing log ID for update");
  
      const res = await updateData(payload, "logs_search_trip", { id: log.id });
      return res[0].id;
    } catch (error) {
      throw new Error("Error updating search log");
    }
  }
  
export async function fetchSearchLogId(log: Partial<SearchLog>): Promise<string> {
    try {
      const payload = convertKeysToSnakeCase(log);
  
      const entries = await fetchData(
        "logs_search_trip",
        ["id", "user_id", "created_at"],
        { user_id: payload.user_id }
      );
  
      if (!entries || entries.length === 0) {
        throw new Error("No search log entries found for this user.");
      }
  
      const mostRecent = entries.reduce((latest, entry) =>
        new Date(entry.created_at) > new Date(latest.created_at) ? entry : latest
      );
  
      return mostRecent.id;
    } catch (error) {
      console.error("Error in fetchSearchLogId:", error);
      throw new Error("Error fetching search log");
    }
  }
  
// ============================SUBMIT LOGS============================

export async function insertSubmitLog(log: CreateSubmitLog): Promise<string> {
  try {
      const payload = convertKeysToSnakeCase(log);
      payload.start_coords = convertToPointWKT(payload.start_coords);
      payload.end_coords = convertToPointWKT(payload.end_coords);
      const res = await insertData("logs_submit_trip", [payload]);
      return res[0].id;
  } catch (error) {
      throw new Error("Error inserting submit log");
  }
}

export async function updateSubmitLog(log: Partial<SubmitLog>): Promise<string> {
  try {
    const payload = convertKeysToSnakeCase(log);

    if (!log.id) throw new Error("Missing log ID for update");

    const res = await updateData(payload, "logs_submit_trip", { id: log.id });
    return res[0].id;
  } catch (error) {
    throw new Error("Error updating submit log");
  }
}

export async function fetchSubmitLogId(log: Partial<SubmitLog>): Promise<string> {
  try {
    const payload = convertKeysToSnakeCase(log);

    const entries = await fetchData(
      "logs_submit_trip",
      ["id", "user_id", "created_at"],
      { user_id: payload.user_id }
    );

    if (!entries || entries.length === 0) {
      throw new Error("No submit log entries found for this user.");
    }

    const mostRecent = entries.reduce((latest, entry) =>
      new Date(entry.created_at) > new Date(latest.created_at) ? entry : latest
    );

    return mostRecent.id;
  } catch (error) {
    console.error("Error in fetchSubmitLogId:", error);
    throw new Error("Error fetching submit log");
  }
}

export async function deleteSubmitLog(log: Partial<SubmitLog>): Promise<void> {
  try {
    if (!log.id) throw new Error("Missing log ID for deletion");

    // deleteData expects filters to be Record<string, any[]>
    await deleteData("logs_submit_trip", { id: [log.id] });
  } catch (error) {
    console.error("[API ERROR] Error deleting submit log:", error);
    throw new Error("Error deleting submit log");
  }
}
