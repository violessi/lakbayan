import { insertData, updateData, deleteData, fetchData, fetchDataRPC } from "@api/supabase";
import {
  TransitJournalSchema,
  FullTripsSchema,
  FullTripSchema,
  SegmentsSchema,
  LiveUpdatesSchema,
  LiveUpdateTypeSchema,
} from "types/schema";
import {
  convertKeysToSnakeCase,
  convertKeysToCamelCase,
  convertToPointWKT,
  convertToMultiPointWKT,
  convertToLineStringWKT,
} from "@utils/map-utils";
import { groupBy } from "lodash";

// Inserts a new trip record into the database
export async function insertTrip(trip: CreateTrip): Promise<string> {
  try {
    const payload = convertKeysToSnakeCase(trip);
    payload.start_coords = convertToPointWKT(payload.start_coords);
    payload.end_coords = convertToPointWKT(payload.end_coords);
    const res = await insertData("trips", [payload]);
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
    const res = await insertData("segments", payload);
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
    const res = await insertData("trip_segment_links", payload);
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
    const res = await insertData("live_updates", [payload]);
    return res[0].id;
  } catch (error) {
    throw new Error("Error inserting live status");
  }
}

// Inserts a new transit journal record into the database
export async function insertTransitJournal(journal: CreateTransitJournal): Promise<string> {
  try {
    const payload = convertKeysToSnakeCase(journal);
    const res = await insertData("transit_journals", [payload]);
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
    const [data, ...rest] = await fetchData("transit_journals", ["*"], { id: journalId });
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

// Fetches the latest 3 unique transit journals done by a user
export async function fetchLatestTransitJournals(userId: string): Promise<TransitJournal[]> {
  try {
    const data = await fetchData(
      "transit_journals",
      ["*"],
      { user_id: userId },
      { order_by: { column: "created_at", ascending: false }, limit: 15 }, // Fetch more than 3 for deduplication
    );

    const formattedData = data.map(convertKeysToCamelCase);

    // Deduplicate by tripId and keep most recent
    const uniqueByTripId = new Map<string, TransitJournal>();
    for (const journal of formattedData) {
      if (!uniqueByTripId.has(journal.tripId)) {
        const validatedJournal = TransitJournalSchema.parse(journal);
        uniqueByTripId.set(validatedJournal.tripId, validatedJournal);
      }
    }

    const uniqueJournals = Array.from(uniqueByTripId.values()).slice(0, 3);

    const result = TransitJournalSchema.array().safeParse(uniqueJournals);
    if (!result.success) throw new Error("Invalid Transit Journal Data");

    return result.data;
  } catch (error) {
    throw new Error("Error fetching latest transit journals");
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

export async function fetchLiveUpdatesBBox(coordinates: Coordinates[]) {
  try {
    const args = {
      min_lat: coordinates[0][1],
      min_lon: coordinates[0][0],
      max_lat: coordinates[1][1],
      max_lon: coordinates[1][0],
    };
    const res = await fetchDataRPC("fetch_live_updates_bbox", args);

    // Validate the response data
    const result = LiveUpdatesSchema.safeParse(res);
    if (!result.success) throw new Error("Invalid Live Update Data");
    return result.data;
  } catch (error) {
    throw new Error("Error fetching live updates");
  }
}

export async function fetchLiveUpdatesLine(line: Coordinates[], distance: number) {
  try {
    const args = { line: convertToLineStringWKT(line), distance };
    const res = await fetchDataRPC("fetch_live_updates_line", args);

    // Validate the response data
    const result = LiveUpdatesSchema.safeParse(res);
    if (!result.success) throw new Error("Invalid Live Update Data");
    return result.data;
  } catch (error) {
    throw new Error("Error fetching live updates");
  }
}

type HasHistory = Record<LiveUpdateType, boolean>;

export async function fetchLiveUpdatesHistory(line: Coordinates[], distance: number) {
  try {
    const args = { line: convertToLineStringWKT(line), distance };
    const res = await fetchDataRPC("fetch_live_updates_history", args);

    // Validate the response data
    const result = LiveUpdatesSchema.safeParse(res);
    if (!result.success) throw new Error("Invalid Live Update Data");

    const byType = groupBy(result.data, (update) => update.type);
    const updated = Object.entries(byType).reduce((acc: HasHistory, [key, value]) => {
      acc[key as LiveUpdateType] = value.length > 0;
      return acc;
    }, {} as HasHistory);

    return updated;
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
    await updateData(payload, "transit_journals", { id: transitJournal.id });
  } catch (error) {
    throw new Error("Error updating transit journal");
  }
}

export async function incrementSegmentGPSCount(
  segmentIds: string[],
  toVerify: Boolean,
): Promise<void> {
  try {
    const segments = await fetchSegments(segmentIds);
    const payload = segments.map((segment) => ({
      id: segment.id,
      gps_verified: toVerify ? segment.gpsVerified + 1 : segment.gpsVerified,
    }));
    await Promise.all(
      payload.map(async (segment) => {
        await updateData(segment, "segments", { id: segment.id });
      }),
    );
  } catch (error) {
    throw new Error("Error updating segments");
  }
}

export async function deleteSegments(segmentIds: string[]): Promise<void> {
  if (segmentIds.length === 0) return;
  try {
    await deleteData("segments", { id: segmentIds });
  } catch (error) {
    throw new Error("Error deleting segments");
  }
}
