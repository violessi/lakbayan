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
