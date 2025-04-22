import { z } from "zod";
import type { FeatureCollection, LineString } from "geojson";
import { Timestamp } from "react-native-reanimated/lib/typescript/commonTypes";

import type { RouteInputSchema } from "./route-input-schema";

import type {
  TransportationModeSchema,
  TransitJournalStatusSchema,
  LiveUpdateTypeSchema,
  CoordinatesSchema,
  NavigationStepsSchema,
  TripEndpointsSchema,
  TripSchema,
  SegmentSchema,
  FullTripSchema,
  TripSearchSchema,
  TripSegmentLinkSchema,
  TransitJournalSchema,
  LiveUpdateSchema,
  ProfileSchema,
  SearchLogSchema,
  SubmitLogSchema,
} from "./schema";

declare global {
  export interface DotcRoute
    extends FeatureCollection<
      LineString,
      {
        shape_id: string;
        route_id: string;
        agency_id: string;
        route_short_name: string | null;
        route_long_name: string;
        route_desc: string | null;
      }
    > {}

  export interface StopData {
    id: string;
    name: string;
    color: string;
    landmark: string;
    latitude: number;
    longitude: number;
    transpo_mode: string;
    contributor_id: string;
  }

  // ==================== DATABSE ====================

  export type TransportationMode = z.infer<typeof TransportationModeSchema>;
  export type TransitJournalStatus = z.infer<typeof TransitJournalStatusSchema>;
  export type LiveUpdateType = z.infer<typeof LiveUpdateTypeSchema>;

  export type Coordinates = z.infer<typeof CoordinatesSchema>;
  export type NavigationSteps = z.infer<typeof NavigationStepsSchema>;

  export type TripEndpoints = z.infer<typeof TripEndpointsSchema>;
  export type Trip = z.infer<typeof TripSchema>;
  export type CreateTrip = Omit<Trip, "id" | "createdAt" | "updatedAt">;

  export type Segment = z.infer<typeof SegmentSchema>;
  export type CreateSegment = Omit<Segment, "id" | "createdAt" | "updatedAt">;

  export type FullTrip = z.infer<typeof FullTripSchema>;

  export type TripSearch = z.infer<typeof TripSearchSchema>;

  export type TripSegmentLink = z.infer<typeof TripSegmentLinkSchema>;
  export type CreateTripSegmentLink = Omit<TripSegmentLink, "id" | "createdAt" | "updatedAt">;

  export type TransitJournal = z.infer<typeof TransitJournalSchema>;
  export type CreateTransitJournal = Omit<
    TransitJournal,
    "id" | "createdAt" | "updatedAt" | "startTime" | "endTime" | "status"
  >;

  export type LiveUpdate = z.infer<typeof LiveUpdateSchema>;
  export type CreateLiveUpdate = Omit<
    LiveUpdate,
    "id" | "createdAt" | "updatedAt" | "expirationDate"
  >;

  export type Profile = z.infer<typeof ProfileSchema>;

  // ==================== INPUT ====================

  export type RouteInput = z.infer<typeof RouteInputSchema>;
  
  // ==================== LOGS ====================

  export type SearchLog = z.infer<typeof SearchLogSchema>;
  export type CreateSearchLog = Omit<SearchLog, "id" | "createdAt" | "updatedAt">;
  
  export type SubmitLog = z.infer<typeof SubmitLogSchema>;
  export type CreateSubmitLog = Omit<SubmitLog, "id" | "createdAt" | "updatedAt">;
}