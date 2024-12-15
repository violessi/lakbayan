import { supabase } from "@utils/supabase";

interface StopData {
  name: string;
  color: string;
  landmark: string;
  latitude: number;
  longitude: number;
  type: string;
}

export const insertStop = async (stopData: StopData) => {
  const { data, error } = await supabase.from("stops").insert([stopData]);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
