import { supabase } from "@utils/supabase";

export const insertStop = async (stopData: StopData) => {
  const { data, error } = await supabase.from("toda-stops").insert([stopData]);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const fetchStops = async () => {
  const { data, error } = await supabase.from("toda-stops").select();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
