import { FeatureCollection, LineString } from "geojson";
import { TRANSPORTATION_MODES } from "@/constants/transportation-modes";
import { MapboxDirectionsResponse, Coordinates } from "@/types/location-types";

export type TransportationMode = (typeof TRANSPORTATION_MODES)[number];

export type JeepneyRoute = FeatureCollection<
  LineString,
  { shape_id: string; shape_pt_sequence: number; shape_dist_traveled: number | null }
>;

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
