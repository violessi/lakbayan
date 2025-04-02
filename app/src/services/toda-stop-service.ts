import { supabase } from "@utils/supabase";

export const insertStop = async (stopData: StopData) => {
  const { data, error } = await supabase.from("toda-stops").insert([stopData]);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// This function fetches all stops by default or list of specific stops by ID
export const fetchStops = async (ids?: string[]): Promise<StopData[]> => {
  const query = supabase.from("toda-stops").select();
  if (ids && ids.length > 0) {
    query.in("id", ids);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const fetchStopDetails = async (id: string): Promise<StopData | null> => {
  const { data, error } = await supabase.from("toda-stops").select().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return data[0];
};
