import { supabase } from "@utils/supabase";

export const insertTripSegments = async (segments: Segment[]) => {
  const insertData = segments.map((segment) => ({
    id: segment.id,
    segment_mode: segment.segment_mode,
    segment_name: segment.segment_name,
    landmark: segment.landmark,
    instruction: segment.instruction,
    waypoints: JSON.stringify(segment.waypoints),
    contributor_id: segment.contributor_id,
    last_updated: new Date().toISOString(),
    gps_verified: 0,
    mod_verified: 0,
    duration: segment.duration,
    start_location: segment.start_location,
    start_coords: segment.start_coords,
    end_location: segment.end_location,
    end_coords: segment.end_coords,
    cost: segment.cost,
  }));

  // Insert all segments at once
  const { data, error } = await supabase
    .from("trip-segments")
    .insert(insertData)
    .select();

  if (error) {
    console.error("Error inserting segments:", error);
    return null;
  }
  console.log("Inserted segments:", data);

  return data;
};


export const insertTrip = async (trip: Trip) => {
  const {
    contributor_id,
    id,
    name,
    start_location,
    start_coords,
    end_location,
    end_coords,
    duration,
    cost,
  } = trip;

  // Insert the trip into the "trips" table
  const { data, error } = await supabase.from("trips").insert([
    {
      id,
      name,
      contributor_id,
      start_location,
      start_coords,
      end_location,
      end_coords,
      duration,
      cost,
      gps_verified: 0,
      mod_verified: 0,
    },
  ]).select();

  if (error) {
    console.error("Error inserting trip:", error);
    return null;
  }
  console.log("Inserted trip:", data);

  return data;
}

export const insertSegmentsToTrips = async (jointSegments: SegmentsToTrips[]) => {
  // Map over the jointSegments array to create the insert objects.
  const insertData = jointSegments.map(({ trip_id, segment_id, segment_order }) => ({
    trip_id,
    segment_id,
    segment_order,
  }));

  const { data, error } = await supabase
    .from("segments-to-trips")
    .insert(insertData)
    .select();

  if (error) {
    console.error("Error inserting segments-to-trips:", error);
    return null;
  }
  console.log("Inserted segments-to-trips:", data);

  return data;
};


// New helper function: sequentially insert a trip, a segment, and the join record.
export const insertTripAndRelated = async (
  trip: Trip,
  segments: Segment[],
  jointSegments: SegmentsToTrips[]
) => {
  // 1. Insert the trip first.
  const tripResult = await insertTrip(trip);
  if (!tripResult) {
    throw new Error("Trip insertion failed");
  }

  // 2. Insert the segment.
  const segmentResult = await insertTripSegments(segments);
  if (!segmentResult) {
    throw new Error("Segment insertion failed");
  }

  // 3. Insert the join record in segments-to-trips.
  const jointResult = await insertSegmentsToTrips(jointSegments);
  if (!jointResult) {
    throw new Error("Segments-to-trips insertion failed");
  }

  return { tripResult, segmentResult, jointResult };
};
