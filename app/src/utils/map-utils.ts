import lo from "lodash";
import * as turf from "@turf/turf";
import { getGreatCircleBearing } from "geolib";

export function isNearLocation(start: Coordinates, end: Coordinates, threshold = 20): boolean {
  const dist = turf.distance(turf.point(start), turf.point(end), { units: "meters" });
  return dist < threshold;
}

// For camera POV
export function computeHeading(
  [lon1, lat1]: [number, number],
  [lon2, lat2]: [number, number],
): number {
  return getGreatCircleBearing(
    { latitude: lat1, longitude: lon1 },
    { latitude: lat2, longitude: lon2 },
  );
}

// Utility function to convert object keys from camelCase to snake_case
export function convertKeysToSnakeCase<T extends Record<string, any>>(obj: T): Record<string, any> {
  return lo.mapKeys(obj, (_, key) => lo.snakeCase(key));
}

// Utility function to convert object keys from snake_case to camelCase
export function convertKeysToCamelCase<T extends Record<string, any>>(obj: T): Record<string, any> {
  return lo.mapKeys(obj, (_, key) => lo.camelCase(key));
}

// Utility function to convert coordinates to Well-Known Text (WKT) Point format
export function convertToPointWKT([longitude, latitude]: Coordinates): string {
  return `SRID=4326;POINT(${longitude} ${latitude})`;
}

// Utility function to convert an array of coordinates to WKT MultiPoint format
export function convertToMultiPointWKT(points: Coordinates[]): string | null {
  if (points.length === 0) {
    return null;
  }
  const pointStrings = points.map(([lng, lat]) => `(${lng} ${lat})`).join(", ");
  return `SRID=4326;MULTIPOINT(${pointStrings})`;
}

export function convertToLineStringWKT(points: Coordinates[]): string | null {
  if (points.length === 0) {
    return null;
  }
  const pointStrings = points.map(([lng, lat]) => `${lng} ${lat}`).join(", ");
  return `SRID=4326;LINESTRING(${pointStrings})`;
}

export function getNearestSegment(
  userLocation: Coordinates,
  segments: Segment[],
): { segmentIndex: number; nearestPoint: NearestPoint } {
  let nearestPoint: NearestPoint | null = null;
  let segmentIndex = 0;

  const geoPoint = turf.point(userLocation);
  segments.forEach((segment, index) => {
    const geoLine = turf.lineString(segment.waypoints);
    const closestLine = turf.nearestPointOnLine(geoLine, geoPoint);
    if (!nearestPoint || closestLine.properties.dist < nearestPoint.properties.dist) {
      nearestPoint = closestLine;
      segmentIndex = index;
    }
  });

  if (!nearestPoint) throw new Error("No nearest point found");
  return { segmentIndex, nearestPoint };
}

export function getNearestStep(
  userLocation: Coordinates,
  steps: NavigationSteps[],
): { stepIndex: number } {
  let stepIndex = 0;
  let minDistance = Infinity;

  const geoPoint = turf.point(userLocation);
  steps.forEach((step, index) => {
    const geoStepPoint = turf.point(step.location);
    const distance = turf.distance(geoPoint, geoStepPoint);

    if (distance < minDistance) {
      minDistance = distance;
      stepIndex = index;
    }
  });
  return { stepIndex };
}

export function expandBoundingBox(box: Coordinates[], size: number): Coordinates[] {
  const [min, max] = box;
  const width = (max[0] - min[0]) * size;
  const height = (max[1] - min[1]) * size;

  return [
    [min[0] - width, min[1] - height],
    [max[0] + width, max[1] + height],
  ];
}
