import { newError } from "@utils/utils";
import { FullTripsSchema } from "types/schema";
import { insertData, fetchDataRPC } from "@api/supabase";
import {
  convertKeysToSnakeCase,
  convertKeysToCamelCase,
  convertToPointWKT,
  convertToMultiPointWKT,
} from "@utils/map-utils";

// Inserts a new trip record into the database
export async function insertTrip(trip: CreateTrip): Promise<string> {
  try {
    const payload = convertKeysToSnakeCase(trip);
    payload.start_coords = convertToPointWKT(payload.start_coords);
    payload.end_coords = convertToPointWKT(payload.end_coords);

    // Insert the trip data into the database
    const res = await insertData("trips_v2", [payload]);
    return res[0].id;
  } catch (error) {
    throw new Error("Error inserting trip");
  }
}

// Inserts multiple segment records into the database
export async function insertSegments(segments: CreateSegment[]): Promise<string[]> {
  try {
    const formattedSegments = segments.map(convertKeysToSnakeCase);
    const payload = formattedSegments.map((segment) => ({
      ...segment,
      start_coords: convertToPointWKT(segment.start_coords),
      end_coords: convertToPointWKT(segment.end_coords),
      waypoints: convertToMultiPointWKT(segment.waypoints),
    }));

    // Insert the segment data into the database
    const res = await insertData("segments_v2", payload);
    return res.map(({ id }) => id);
  } catch (error) {
    throw new Error("Error inserting segments");
  }
}

// Inserts trip-segment links into the database
export async function insertTripSegmentLinks(
  tripId: string,
  segmentIds: string[],
): Promise<string[]> {
  try {
    const payload = segmentIds.map((segmentId, segmentOrder) => ({
      trip_id: tripId,
      segment_id: segmentId,
      segment_order: segmentOrder,
    }));

    // Insert the trip-segment links into the database
    const res = await insertData("trip_segment_links_v2", payload);
    return res.map(({ id }) => id);
  } catch (error: Error | any) {
    throw new Error("Error inserting trip-segment links");
  }
}

// Fetches trip data based on provided details and radius
export async function fetchTripData(tripDetails: TripDetails, radius: number): Promise<FullTrip[]> {
  try {
    const args = {
      start_lat: tripDetails.startCoords[1],
      start_lon: tripDetails.startCoords[0],
      end_lat: tripDetails.endCoords[1],
      end_lon: tripDetails.endCoords[0],
      radius,
    };

    // Fetch nearby trips from the database
    const res = await fetchDataRPC("fetch_nearby_trips", args);
    const formattedData = res.map(convertKeysToCamelCase);

    // Validate the response data
    const result = FullTripsSchema.safeParse(formattedData);
    if (!result.success) throw new Error("Invalid Trip Data");

    return result.data;
  } catch (error) {
    throw new Error("Error fetching trip data");
  }
}
