import type { FeatureCollection, LineString } from "geojson";
import { TRANSPORTATION_MODES } from "@constants/transportation-modes";

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
