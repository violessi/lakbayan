import type { FeatureCollection, LineString } from "geojson";
import { TRANSPORTATION_MODES } from "@constants/transportation-modes";
import { Timestamp } from "react-native-reanimated/lib/typescript/commonTypes";

declare global {
  export type TransportationMode = ["Train", "Bus", "Jeep", "UV", "Tricycle", "Walk"][number];

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

  export interface LiveStatus {
    type: string;
    coordinates: Coordinates;
  }

  export interface NavigationSteps {
    instruction: string;
    location: Coordinates;
  }

  export interface Trip {
    id: string;
    contributor_id: string;
    name: string;
    gps_verified: number;
    mod_verified: number;
    start_location: string;
    start_coords: Coordinates;
    end_location: string;
    end_coords: Coordinates;
    duration: number;
    cost: number;
    upvotes: number;
    downvotes: number;
  }

  export interface Segment {
    id: string;
    contributor_id: string;
    segment_name: string;
    segment_mode: TransportationMode;
    directions: MapboxDirectionsResponse;
    waypoints: Coordinates[];
    landmark: string;
    instruction: string;
    last_updated: Date;
    gps_verified: number;
    mod_verified: number;
    start_location: string;
    start_coords: Coordinates;
    end_location: string;
    end_coords: Coordinates;
    duration: number;
    cost: number;
  }

  export interface SegmentsToTrips {
    trip_id: string;
    segment_id: string;
    segment_order: number;
  }

  // ==================== V2 ====================

  export interface TripV2 {
    id: string;
    contributorId: string;
    name: string;
    gpsVerified: number;
    modVerified: number;
    startLocation: string;
    startCoords: Coordinates;
    endLocation: string;
    endCoords: Coordinates;
    duration: number;
    distance: number;
    cost: number;
    upvotes: number;
    downvotes: number;
    createdAt: Timestamp;
    updatedAt: Timestamp;
  }
  export type CreateTripV2 = Omit<TripV2, "id" | "createdAt" | "updatedAt">;
  export type FullTripV2 = TripV2 & { segments: SegmentV2[] };

  export interface SegmentV2 {
    id: string;
    contributorId: string;
    segmentName: string;
    segmentMode: TransportationMode;
    landmark: string;
    instruction: string;
    gpsVerified: number;
    modVerified: number;
    duration: number;
    distance: number;
    cost: number;
    liveStatus: LiveStatus[];
    waypoints: Coordinates[];
    navigationSteps: NavigationSteps[];
    startLocation: string;
    startCoords: Coordinates;
    endLocation: string;
    endCoords: Coordinates;
    createdAt: Timestamp;
    updatedAt: Timestamp;
  }
  export type CreateSegmentV2 = Omit<SegmentV2, "id" | "createdAt" | "updatedAt">;

  export type WalkingSegment = Pick<
    SegmentV2,
    | "id"
    | "segmentMode"
    | "startLocation"
    | "startCoords"
    | "endLocation"
    | "endCoords"
    | "duration"
  >;

  export interface CreateRouteV2 {
    startLocation: string;
    startCoords: Coordinates;
    endLocation: string;
    endCoords: Coordinates;
    segmentMode: TransportationMode;
  }

  export interface TripSegmentLinkV2 {
    id: string;
    tripId: string;
    segmentId: string;
    segmentOrder: number;
    createdAt: Timestamp;
    updatedAt: Timestamp;
  }

  export type CreateTripSegmentLinkV2 = Omit<TripSegmentLink, "id" | "createdAt" | "updatedAt">;

  export interface TripDetails {
    startLocation: string;
    endLocation: string;
    startCoords: Coordinates;
    endCoords: Coordinates;
  }
}
