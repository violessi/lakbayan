import { z } from "zod";

const numberStringNullable = z.string().transform((val) => (val ? parseFloat(val) : null));
const numberString = z.string().transform((val) => parseFloat(val));

export const GtfsShape = z.object({
  shape_id: z.string(),
  shape_pt_sequence: z.string(),
  shape_dist_traveled: numberStringNullable,
  shape_pt_lat: numberString,
  shape_pt_lon: numberString,
});

export const GtfsTrip = z.object({
  route_id: z.string(),
  service_id: z.string().nullable(),
  trip_short_name: z.string().nullable(),
  trip_headsign: z.string().nullable(),
  direction_id: z.string().nullable(),
  block_id: z.string().nullable(),
  shape_id: z.string().nullable(),
  trip_id: z.string().nullable(),
});

export const GtfsRoute = z.object({
  agency_id: z.string(),
  route_short_name: z.string().nullable(),
  route_long_name: z.string(),
  route_desc: z.string().nullable(),
  route_type: z.string().nullable(),
  route_url: z.string().nullable(),
  route_color: z.string().nullable(),
  route_text_color: z.string().nullable(),
  route_id: z.string(),
});

export type GtfsShape = z.infer<typeof GtfsShape>;
export type GtfsTrip = z.infer<typeof GtfsTrip>;
export type GtfsRoute = z.infer<typeof GtfsRoute>;

// ================== DATABASE ==================

export const TransportationMode = z.enum(["Train", "Bus", "Jeep", "UV", "Tricycle", "Walk"]);

export const TransitJournalStatus = z.enum(["Success", "Cancelled", "Ongoing"]);

export const Coordinates = z.tuple([z.number(), z.number()]);

export const LiveStatus = z.object({ type: z.string(), coordinates: Coordinates });

export const NavigationSteps = z.object({ instruction: z.string(), location: Coordinates });

export const TripDetails = z.object({
  startLocation: z.string(),
  endLocation: z.string(),
  startCoords: Coordinates,
  endCoords: Coordinates,
});

export const Trip = z.object({
  id: z.string(),
  contributorId: z.string(),
  name: z.string(),
  gpsVerified: z.number(),
  modVerified: z.number(),
  startLocation: z.string(),
  startCoords: Coordinates,
  endLocation: z.string(),
  endCoords: Coordinates,
  duration: z.number(),
  distance: z.number(),
  cost: z.number(),
  upvotes: z.number(),
  downvotes: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const Segment = z.object({
  id: z.string(),
  contributorId: z.string(),
  segmentName: z.string(),
  segmentMode: TransportationMode,
  landmark: z.string(),
  instruction: z.string(),
  gpsVerified: z.number(),
  modVerified: z.number(),
  duration: z.number(),
  distance: z.number(),
  cost: z.number(),
  liveStatus: z.array(LiveStatus),
  waypoints: z.array(Coordinates),
  navigationSteps: z.array(NavigationSteps),
  startLocation: z.string(),
  startCoords: Coordinates,
  endLocation: z.string(),
  endCoords: Coordinates,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const TripSegmentLink = z.object({
  id: z.string(),
  tripId: z.string(),
  segmentId: z.string(),
  segmentOrder: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const TransitJournal = z.object({
  id: z.string(),
  userId: z.string(),
  tripId: z.string(),
  preSegment: Segment.nullable(),
  postSegment: Segment.nullable(),
  startTime: z.string(),
  endTime: z.string().nullable(),
  status: TransitJournalStatus,
  createdAt: z.string(),
  updatedAt: z.string(),
});
