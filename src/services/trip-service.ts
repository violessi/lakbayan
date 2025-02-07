import { supabase } from "@utils/supabase";

export const insertTripSegment = async (route: Route) => {
  const {
    routeName,
    landmark,
    instruction,
    startLocation,
    startCoordinates,
    endLocation,
    endCoordinates,
    directions,
    transportationMode,
    cost,
  } = route;

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error("Error fetching user or no user is logged in:", authError);
    return null;
  }

  const contributorId = user.id;
  console.log("Contributor ID:", contributorId);

  const { data, error } = await supabase.from("trip-segments").insert([
    {
      segment_mode: transportationMode,
      segment_name: routeName,
      landmark,
      instruction,
      waypoints: JSON.stringify(directions.routes[0].geometry.coordinates),
      contributor_id: contributorId,
      last_updated: new Date().toISOString(),
      gps_verified: 0,
      mod_verified: 0,
      duration: Math.round(directions.routes[0].duration),
      start_location: startLocation,
      start_coords: startCoordinates,
      end_location: endLocation,
      end_coords: endCoordinates,
      cost,
    },
  ]);

  if (error) {
    console.error("Error inserting route:", error);
    return null;
  }

  return data;
};
