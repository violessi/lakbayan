import lo from "lodash";
import { getDistance, getGreatCircleBearing } from "geolib";

// Change threshold to increase/decrease the radius of the circle
export function isNearLocation(userLoc: [number, number], stepLoc: [number, number], threshold = 5): boolean {
  return (
    getDistance({ latitude: userLoc[1], longitude: userLoc[0] }, { latitude: stepLoc[1], longitude: stepLoc[0] }) <=
    threshold
  );
}

// For camera POV
export function computeHeading([lon1, lat1]: [number, number], [lon2, lat2]: [number, number]): number {
  return getGreatCircleBearing({ latitude: lat1, longitude: lon1 }, { latitude: lat2, longitude: lon2 });
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
