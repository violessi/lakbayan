import { TRANSPORTATION_MODES } from "@/constants/transportation-modes";
import { MapboxDirectionsResponse, Coordinates } from "@/types/location-types";

export type TransportationMode = (typeof TRANSPORTATION_MODES)[number];

export interface Route {
  routeName: string;
  landmark: string;
  startLocation: string;
  startCoordinates: Coordinates;
  endLocation: string;
  endCoordinates: Coordinates;
  directions: MapboxDirectionsResponse;
}
