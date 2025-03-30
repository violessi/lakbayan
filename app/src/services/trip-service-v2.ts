import { FullTripsSchema } from "types/schema";
import { TransitJournalSchema, FullTripSchema, SegmentsSchema } from "types/schema";

import { insertData, updateData, fetchData, fetchDataRPC } from "@api/supabase";
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

export async function insertLiveStatus(status: CreateLiveStatus): Promise<string> {
  try {
    const payload = convertKeysToSnakeCase(status);
    payload.coordinate = convertToPointWKT(payload.coordinate);

    console.log("Inserting live status", payload);
    const res = await insertData("live_status_v2", [payload]);
    return res[0].id;
  } catch (error) {
    throw new Error("Error inserting live status");
  }
}

// Inserts a new transit journal record into the database
export async function insertTransitJournal(journal: CreateTransitJournal): Promise<string> {
  try {
    const payload = convertKeysToSnakeCase(journal);
    // Insert the transit journal data into the database
    const res = await insertData("transit_journals_v2", [payload]);
    return res[0].id;
  } catch (error) {
    throw new Error("Error inserting transit journal");
  }
}

// Fetches the transit journal ID for a user
export async function fetchUserTransitJournal(userId: string): Promise<string | null> {
  try {
    // Fetch the transit journal ID from the database
    const [data, ...rest] = await fetchData("profiles", ["transit_journal_id"], { id: userId });
    if (rest.length > 0) throw new Error("Multiple profiles found");
    return data.transit_journal_id;
  } catch (error) {
    throw new Error("Error fetching transit journal");
  }
}

// Fetches the transit journal data for a given journal ID
export async function fetchTransitJournal(journalId: string): Promise<TransitJournal> {
  try {
    // Fetch the transit journal data from the database
    const [data, ...rest] = await fetchData("transit_journals_v2", ["*"], { id: journalId });
    if (rest.length > 0) throw new Error("Multiple transit journals found");

    // Validate the response data
    const formattedData = convertKeysToCamelCase(data);
    const result = TransitJournalSchema.safeParse(formattedData);
    if (!result.success) throw new Error("Invalid Transit Journal Data");
    return result.data;
  } catch (error) {
    throw new Error("Error fetching transit journal");
  }
}

export async function fetchSegments(segmentIds: string[]): Promise<Segment[]> {
  try {
    // Fetch the segment data from the database
    const segments = Promise.all(
      segmentIds.map(async (segmentId) => {
        console.log("Fetching segment", segmentId);
        const data = await fetchDataRPC("fetch_segment", { segment_id: segmentId });
        return data;
      }),
    );

    const result = SegmentsSchema.safeParse(segments);
    if (!result.success) throw new Error("Invalid Segment Data");
    return result.data;
  } catch (error) {
    console.log(error);
    throw new Error("Error fetching segments");
  }
}

// Fetches the trip data for a given trip ID
export async function fetchTrip(tripId: string): Promise<FullTrip> {
  try {
    // Fetch trip data from the database
    const [data, ...rest] = await fetchDataRPC("fetch_trip", { trip_id: tripId });
    if (rest.length > 0) throw new Error("Multiple trips found");

    // Validate the response data
    const formattedData = convertKeysToCamelCase(data);
    const result = FullTripSchema.safeParse(formattedData);
    if (!result.success) throw new Error("Invalid Trip Data");
    return result.data;
  } catch (error) {
    throw new Error("Error fetching trip data");
  }
}

// Fetches trip data based on provided details and radius
export async function fetchTripData(endpoints: TripEndpoints, radius: number): Promise<FullTrip[]> {
  try {
    const args = {
      start_lat: endpoints.startCoords[1],
      start_lon: endpoints.startCoords[0],
      end_lat: endpoints.endCoords[1],
      end_lon: endpoints.endCoords[0],
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

// Updates the profile record
export async function updateProfile(profile: Partial<Profile>): Promise<void> {
  try {
    const payload = convertKeysToSnakeCase(profile);
    // Update the profile data in the database
    await updateData(payload, "profiles", { id: profile.id });
  } catch (error) {
    throw new Error("Error updating profile");
  }
}
