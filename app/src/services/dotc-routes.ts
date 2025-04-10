import { groupBy } from "@utils/utils";
import Papa from "papaparse";

import { GtfsShape, GtfsTrip, GtfsRoute } from "types/schema";

type GtfsData = Array<GtfsShape & GtfsTrip & GtfsRoute>;

const DOTC_SHAPES_URL =
  "https://raw.githubusercontent.com/sakayph/gtfs/refs/heads/master/shapes.txt";
const DOTC_TRIPS_URL = "https://raw.githubusercontent.com/sakayph/gtfs/refs/heads/master/trips.txt";
const DOTC_ROUTES_URL =
  "https://raw.githubusercontent.com/sakayph/gtfs/refs/heads/master/routes.txt";

async function fetchDotcData(url: string) {
  const response = await fetch(url);
  const text = await response.text();
  const { data } = Papa.parse(text, { header: true, skipEmptyLines: true });
  return data;
}

function parseDotcData<T>(data: any[], schema: any): T[] {
  const parsedData: T[] = [];
  for (const row of data) {
    const result = schema.safeParse(row);
    if (!result.success) console.error("Failed to parse dotc data");
    else parsedData.push(result.data);
  }
  return parsedData;
}

// Create GeoJSON from grouped data
function createGeoJson(groupedData: Record<string, GtfsData>) {
  return {
    type: "FeatureCollection",
    features: Object.values(groupedData).map((rows) => ({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: rows.map(({ shape_pt_lon, shape_pt_lat }) => [shape_pt_lon, shape_pt_lat]),
      },
      properties: {
        shape_id: rows[0].shape_id,
        route_id: rows[0].route_id,
        agency_id: rows[0].agency_id,
        route_short_name: rows[0].route_short_name,
        route_long_name: rows[0].route_long_name,
        route_desc: rows[0].route_desc,
      },
    })),
  } as DotcRoute;
}

export async function getShapes() {
  const data = await fetchDotcData(DOTC_SHAPES_URL);
  return parseDotcData<GtfsShape>(data, GtfsShape);
}

export async function getTrips() {
  const data = await fetchDotcData(DOTC_TRIPS_URL);
  return parseDotcData<GtfsTrip>(data, GtfsTrip);
}

export async function getRoutes() {
  const data = await fetchDotcData(DOTC_ROUTES_URL);
  return parseDotcData<GtfsRoute>(data, GtfsRoute);
}

export async function getDotcRoutes() {
  const shapes = await getShapes();
  const routes = await getRoutes();
  const trips = await getTrips();

  const shapeTrip = shapes.map((shape) => {
    const trip = trips.find((trip) => trip.shape_id === shape.shape_id);
    if (!trip) throw new Error(`Trip for shape_id ${shape.shape_id} not found`);
    return { ...trip, ...shape };
  });

  const combinedData: GtfsData = shapeTrip.map((shape) => {
    const route = routes.find((route) => route.route_id === shape.route_id);
    if (!route) throw new Error(`Route for route_id ${shape.route_id} not found`);
    return { ...route, ...shape };
  });

  const groupedData = groupBy(combinedData, "shape_id");
  return createGeoJson(groupedData);
}
