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
}
