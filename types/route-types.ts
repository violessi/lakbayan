import { FeatureCollection, LineString } from "geojson";
import { TRANSPORTATION_MODES } from "@/constants/transportation-modes";

export type TransportationMode = (typeof TRANSPORTATION_MODES)[number];

export type JeepneyRoute = FeatureCollection<
  LineString,
  { shape_id: string; shape_pt_sequence: number; shape_dist_traveled: number | null }
>;
