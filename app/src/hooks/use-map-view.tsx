import { useRef, useState } from "react";
import { Camera } from "@rnmapbox/maps";
import type { Location } from "@rnmapbox/maps";

export function useMapView(defaultZoom: number = 12) {
  console.log("✅ useMapView hook is running");

  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [userCoords, setUserCoords] = useState<Coordinates | null>(null);

  const cameraRef = useRef<Camera>(null);
  const [center, setCenter] = useState<Coordinates | null>(null);
  const [zoomLevel, setZoomLevel] = useState(defaultZoom);

  // Center the map on the given coordinates
  const centerMap = (coords: Coordinates | null, zoomOverride?: number) => {
    setCoordinates(coords);
    setCenter(coords);
    if (zoomOverride !== undefined) setZoomLevel(zoomOverride);
  };

  // Center the map on the user's location
  const handleUserLocation = (location: Location) => {
    setCenter([location.coords.longitude, location.coords.latitude]);
    setZoomLevel(13);
  };

  // Center and zoom the map on pressed location
  const handleMapPress = (feature: MapPressFeature) => {
    if (!feature.geometry || feature.geometry.type !== "Point") return;
    const coordinates = feature.geometry.coordinates as Coordinates;
    centerMap(coordinates, 15);
  };

  return {
    coordinates,
    setCoordinates,
    handleMapPress,
    cameraRef,
    center,
    zoomLevel,
    setZoomLevel,
    centerMap,
    userCoords,
    setUserCoords,
    handleUserLocation,
  };
}
