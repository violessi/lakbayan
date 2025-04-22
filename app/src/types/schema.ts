import { create } from "lodash";
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

export const TransportationModeSchema = z.enum(["Train", "Bus", "Jeep", "UV", "Tricycle", "Walk"]);

export const TransitJournalStatusSchema = z.enum(["success", "cancelled", "ongoing"]);

export const LiveUpdateTypeSchema = z.enum(["Traffic", "Disruption", "Long Line"]);

export const CoordinatesSchema = z.tuple([z.number(), z.number()]);

export const NavigationStepsSchema = z.object({
  instruction: z.string(),
  location: CoordinatesSchema,
});

export const TripEndpointsSchema = z.object({
  startLocation: z.string(),
  endLocation: z.string(),
  startCoords: CoordinatesSchema,
  endCoords: CoordinatesSchema,
});

export const TripSchema = z.object({
  id: z.string(),
  contributorId: z.string(),
  name: z.string(),
  gpsVerified: z.number(),
  modVerified: z.number(),
  startLocation: z.string(),
  startCoords: CoordinatesSchema,
  endLocation: z.string(),
  endCoords: CoordinatesSchema,
  duration: z.number(),
  distance: z.number(),
  cost: z.number(),
  upvotes: z.number(),
  downvotes: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  comments: z.number(),
});

export const TripsSchema = z.array(TripSchema);

export const SegmentSchema = z.object({
  id: z.string(),
  contributorId: z.string(),
  segmentName: z.string(),
  segmentMode: TransportationModeSchema,
  landmark: z.string().nullable(),
  instruction: z.string().nullable(),
  gpsVerified: z.number(),
  modVerified: z.number(),
  duration: z.number(),
  distance: z.number(),
  cost: z.number(),
  waypoints: z.array(CoordinatesSchema),
  navigationSteps: z.array(NavigationStepsSchema),
  startLocation: z.string(),
  startCoords: CoordinatesSchema,
  endLocation: z.string(),
  endCoords: CoordinatesSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const SegmentsSchema = z.array(SegmentSchema);

export const FullTripSchema = z.object({
  ...TripSchema.shape,
  segments: SegmentsSchema,
});

export const TripSearchSchema = z.object({
  ...TripSchema.shape,
  segments: SegmentsSchema,
  preSegment: SegmentSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  }).nullable(),
  postSegment: SegmentSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  }).nullable(),
});

export const FullTripsSchema = z.array(FullTripSchema);

export const TripSegmentLinkSchema = z.object({
  id: z.string(),
  tripId: z.string(),
  segmentId: z.string(),
  segmentOrder: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const TripSegmentLinksSchema = z.array(TripSegmentLinkSchema);

export const TransitJournalSchema = z.object({
  id: z.string(),
  userId: z.string(),
  tripId: z.string(),
  preSegmentId: z.string().nullable(),
  postSegmentId: z.string().nullable(),
  startTime: z.string(),
  endTime: z.string().nullable(),
  status: TransitJournalStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const LiveUpdateSchema = z.object({
  id: z.string(),
  contributorId: z.string(),
  transitJournalId: z.string(),
  type: LiveUpdateTypeSchema,
  coordinate: CoordinatesSchema,
  expirationDate: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const LiveUpdatesSchema = z.array(LiveUpdateSchema);

export const ProfileSchema = z.object({
  id: z.string(),
  username: z.string(),
  fullName: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  role: z.string(),
  points: z.number(),
  isCommuter: z.boolean(),
  transitJournalId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ================== INPUT SCHEMA ==================

export const RouteInputSchema = z.object({
  segmentName: z.string().min(1, "Route name is required").min(3, "Route name is too short"),
  segmentMode: TransportationModeSchema,
  cost: z.number(),
  landmark: z.string().nullable(),
  instruction: z.string().nullable(),
  waypoints: z.array(CoordinatesSchema).min(2, "Please generate the route"),
  navigationSteps: z.array(NavigationStepsSchema),
});

// ================== LOGS SCHEMA ==================

export const SearchLogSchema = z.object({
  id: z.string(),
  userId: z.string(),
  startLocation: z.string(),
  startCoords: CoordinatesSchema,
  endLocation: z.string(),
  endCoords: CoordinatesSchema,
  resultCount: z.number(),
  didTransitJournal: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const SubmitLogSchema = z.object({
  id: z.string(),
  userId: z.string(),
  startLocation: z.string(),
  startCoords: CoordinatesSchema,
  endLocation: z.string(),
  endCoords: CoordinatesSchema,
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});