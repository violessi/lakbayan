import type { FeatureCollection, LineString } from "geojson";
import { TRANSPORTATION_MODES } from "@constants/transportation-modes";

declare global {
  export type TransportationMode = (typeof TRANSPORTATION_MODES)[number];

  export interface JeepneyRoute
    extends FeatureCollection<
      LineString,
      {
        shape_id: string;
        shape_pt_sequence: number;
        shape_dist_traveled: number | null;
      }
    > {}

  export interface Trip {
    routes: Route[];
    startLocation: string;
    startCoordinates: Coordinates;
    endLocation: string;
    endCoordinates: Coordinates;
  }

  export interface Route {
    id: string;
    routeName: string;
    landmark: string;
    startLocation: string;
    startCoordinates: Coordinates;
    endLocation: string;
    endCoordinates: Coordinates;
    directions: MapboxDirectionsResponse;
    transportationMode: TransportationMode;
  }
}
