import { JeepneyRoute } from "@type/route-types";
import { GtfsShape } from "@type/schema";
import { groupBy } from "@utils/utils";
import Papa from "papaparse";

const URL = "https://raw.githubusercontent.com/sakayph/gtfs/refs/heads/master/shapes.txt";

// NOTE: invalid data will be ignored
const fetchAndParseData = async (url: string): Promise<GtfsShape[]> => {
  const response = await fetch(url);
  const text = await response.text();
  const { data } = Papa.parse(text, { header: true, skipEmptyLines: true });

  const parsedData: GtfsShape[] = [];
  for (const row of data) {
    const result = GtfsShape.safeParse(row);
    if (!result.success) continue;
    parsedData.push(result.data);
  }
  return parsedData;
};

// Create GeoJSON from grouped data
const createGeoJson = (groupedData: Record<string, GtfsShape[]>): JeepneyRoute => ({
  type: "FeatureCollection",
  features: Object.values(groupedData).map((rows) => ({
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: rows.map(({ shape_pt_lon, shape_pt_lat }) => [shape_pt_lon, shape_pt_lat]),
    },
    properties: {
      shape_id: rows[0].shape_id,
      shape_pt_sequence: rows[0].shape_pt_sequence,
      shape_dist_traveled: rows[0].shape_dist_traveled,
    },
  })),
});

// Fetch and process ggtfs jeepney routes data
export const getJeepRoutes = async (): Promise<JeepneyRoute> => {
  const data = await fetchAndParseData(URL);
  const groupedData = groupBy(data, "shape_id");
  return createGeoJson(groupedData);
};
