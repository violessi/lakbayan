import { z } from "zod";

export const GtfsShape = z.object({
  shape_id: z.string(),
  shape_pt_sequence: z.string().transform((val) => parseFloat(val)),
  shape_dist_traveled: z
    .string()
    .transform((val) => (val ? parseFloat(val) : null))
    .nullable(),
  shape_pt_lat: z.string().transform((val) => parseFloat(val)),
  shape_pt_lon: z.string().transform((val) => parseFloat(val)),
});

export type GtfsShape = z.infer<typeof GtfsShape>;
