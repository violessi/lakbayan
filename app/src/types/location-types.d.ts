import type { Feature, Point, Geometry, GeoJsonProperties } from "geojson";

declare global {
  export interface Suggestion {
    id: string;
    place_name: string;
    address: string;
    geometry: {
      coordinates: [number, number];
    };
  }

  export interface MapboxDirectionsResponse {
    routes: MapboxRoute[];
    waypoints: MapboxWaypoint[];
  }

  export interface MapboxRoute {
    geometry: MapboxRouteGeometry;
    legs: MapboxLeg[];
    distance: number; // Meters
    duration: number; // Seconds
    weight: number;
    weight_name: string;
  }

  export interface MapboxRouteGeometry {
    coordinates: Coordinates[];
    type: string;
  }

  export interface MapboxLeg {
    summary: string;
    steps: MapboxStep[];
    distance: number; // Meters
    duration: number; // Seconds
  }

  export interface MapboxStep {
    maneuver: MapboxManeuver;
    geometry: any;
    distance: number; // Meters
    duration: number; // Seconds
  }

  export interface MapboxManeuver {
    type: string;
    instruction: string;
    location: Coordinates;
  }

  export interface MapboxWaypoint {
    location: Coordinates;
    distance: number; // Meters
    name: string;
  }

  export type MapPressFeature = Feature<Geometry, GeoJsonProperties>;

  export type NearestPointProperties = {
    dist: number;
    index: number;
    multiFeatureIndex: number;
    location: number;
    [key: string]: any;
  };

  export type NearestPoint = Feature<Point, NearestPointProperties>;
}

export {};
