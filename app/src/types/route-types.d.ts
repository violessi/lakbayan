import { z } from "zod";
import type { FeatureCollection, LineString } from "geojson";
import { Timestamp } from "react-native-reanimated/lib/typescript/commonTypes";

import type {
  TransportationModeSchema,
  TransitJournalStatusSchema,
  CoordinatesSchema,
  LiveStatusSchema,
  NavigationStepsSchema,
  TripDetailsSchema,
  TripSchema,
  SegmentSchema,
  TripSegmentLinkSchema,
  TransitJournalSchema,
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

  // ==================== V2 ====================
  // types are inferred from the zod schema to reduce redundancy

  export type TransportationMode = z.infer<typeof TransportationModeSchema>;
  export type TransitJournalStatus = z.infer<typeof TransitJournalStatusSchema>;

  export type Coordinates = z.infer<typeof CoordinatesSchema>;
  export type LiveStatus = z.infer<typeof LiveStatusSchema>;
  export type NavigationSteps = z.infer<typeof NavigationStepsSchema>;

  export type TripDetails = z.infer<typeof TripDetailsSchema>;

  export type Trip = z.infer<typeof TripSchema>;
  export type CreateTrip = Omit<Trip, "id" | "createdAt" | "updatedAt">;

  export type Segment = z.infer<typeof SegmentSchema>;
  export type CreateSegment = Omit<Segment, "id" | "createdAt" | "updatedAt">;

  export type FullTrip = Trip & { segments: Segment[] };

  export type TripSegmentLink = z.infer<typeof TripSegmentLinkSchema>;
  export type CreateTripSegmentLink = Omit<TripSegmentLink, "id" | "createdAt" | "updatedAt">;

  export type TransitJournal = z.infer<typeof TransitJournalSchema>;
}
