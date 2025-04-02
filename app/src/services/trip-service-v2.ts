import { insertData, updateData, deleteData, fetchData, fetchDataRPC } from "@api/supabase";
import {
  TransitJournalSchema,
  FullTripsSchema,
  FullTripSchema,
  SegmentsSchema,
  LiveUpdatesSchema,
} from "types/schema";
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
    const res = await insertData("trip_segment_links_v2", payload);
    return res.map(({ id }) => id);
  } catch (error: Error | any) {
    throw new Error("Error inserting trip-segment links");
  }
}

// Inserts a new profile record into the database
export async function insertLiveUpdate(status: CreateLiveUpdate): Promise<string> {
  try {
    const payload = convertKeysToSnakeCase(status);
    payload.coordinate = convertToPointWKT(payload.coordinate);
    const res = await insertData("live_updates_v2", [payload]);
    return res[0].id;
  } catch (error) {
    throw new Error("Error inserting live status");
  }
}

// Inserts a new transit journal record into the database
export async function insertTransitJournal(journal: CreateTransitJournal): Promise<string> {
  try {
    const payload = convertKeysToSnakeCase(journal);
    const res = await insertData("transit_journals_v2", [payload]);
    return res[0].id;
  } catch (error) {
    throw new Error("Error inserting transit journal");
  }
}

// Fetches the transit journal ID for a user
export async function fetchUserTransitJournal(userId: string): Promise<string | null> {
  try {
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
    const segments = await Promise.all(
      segmentIds.map(async (segmentId) => {
        const data = await fetchDataRPC("fetch_segment", { segment_id: segmentId });
        return data;
      }),
    );

    // Validate the response data
    const result = SegmentsSchema.safeParse(segments);
    if (!result.success) throw new Error("Invalid Segment Data");
    return result.data;
  } catch (error) {
    throw new Error("Error fetching segments");
  }
}

// Fetches the trip data for a given trip ID
export async function fetchTrip(tripId: string): Promise<FullTrip> {
  try {
    const [data, ...rest] = await fetchDataRPC("fetch_trip", { trip_id: tripId });
    if (rest.length > 0) throw new Error("Multiple trips found");

    // Validate the response data
    const result = FullTripSchema.safeParse(data);
    if (!result.success) throw new Error("Invalid Trip Data");
    return result.data;
  } catch (error) {
    throw new Error("Error fetching trip data");
  }
}

// Fetches trip data based on provided details and radius
export async function fetchTripData(endpoints: TripEndpoints, radius: number): Promise<FullTrip[]> {
  try {
    const res = await fetchDataRPC("fetch_nearby_trips", {
      start_lat: endpoints.startCoords[1],
      start_lon: endpoints.startCoords[0],
      end_lat: endpoints.endCoords[1],
      end_lon: endpoints.endCoords[0],
      radius,
    });

    // Validate the response data
    const result = FullTripsSchema.safeParse(res);
    if (!result.success) throw new Error("Invalid Trip Data");
    return result.data;
  } catch (error) {
    throw new Error("Error fetching trip data");
  }
}

// Fetches nearby live updates based on provided coordinates and radius
export async function fetchNearbyLiveUpdates(
  coordinates: Coordinates,
  radius: number,
): Promise<LiveUpdate[]> {
  try {
    const args = { lat: coordinates[1], lon: coordinates[0], radius };
    const res = await fetchDataRPC("fetch_nearby_live_updates", args);

    // Validate the response data
    const result = LiveUpdatesSchema.safeParse(res);
    if (!result.success) throw new Error("Invalid Live Update Data");
    return result.data;
  } catch (error) {
    throw new Error("Error fetching live updates");
  }
}

// Updates the profile record
export async function updateProfile(profile: Partial<Profile>): Promise<void> {
  try {
    const payload = convertKeysToSnakeCase(profile);
    await updateData(payload, "profiles", { id: profile.id });
  } catch (error) {
    throw new Error("Error updating profile");
  }
}

export async function updateTransitJournal(transitJournal: Partial<TransitJournal>): Promise<void> {
  try {
    const payload = convertKeysToSnakeCase(transitJournal);
    await updateData(payload, "transit_journals_v2", { id: transitJournal.id });
  } catch (error) {
    throw new Error("Error updating transit journal");
  }
}

export async function deleteSegments(segmentIds: string[]): Promise<void> {
  if (segmentIds.length === 0) return;
  try {
    await deleteData("segments_v2", { id: segmentIds });
  } catch (error) {
    throw new Error("Error deleting segments");
  }
}
