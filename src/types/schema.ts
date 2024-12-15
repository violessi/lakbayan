import { z } from "zod";

const numberStringNullable = z.string().transform((val) => (val ? parseFloat(val) : null));
const numberString = z.string().transform((val) => parseFloat(val));

export const GtfsShape = z.object({
  shape_id: z.string(),
  shape_pt_sequence: z.string(),
  shape_dist_traveled: numberStringNullable,
  shape_pt_lat: numberString,
  shape_pt_lon: numberString,
});

export const GtfsTrip = z.object({
  route_id: z.string(),
  service_id: z.string().nullable(),
  trip_short_name: z.string().nullable(),
  trip_headsign: z.string().nullable(),
  direction_id: z.string().nullable(),
  block_id: z.string().nullable(),
  shape_id: z.string().nullable(),
  trip_id: z.string().nullable(),
});

export const GtfsRoute = z.object({
  agency_id: z.string(),
  route_short_name: z.string().nullable(),
  route_long_name: z.string(),
  route_desc: z.string().nullable(),
  route_type: z.string().nullable(),
  route_url: z.string().nullable(),
  route_color: z.string().nullable(),
  route_text_color: z.string().nullable(),
  route_id: z.string(),
});

export type GtfsShape = z.infer<typeof GtfsShape>;
export type GtfsTrip = z.infer<typeof GtfsTrip>;
export type GtfsRoute = z.infer<typeof GtfsRoute>;
