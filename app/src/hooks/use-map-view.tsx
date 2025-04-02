import { useRef, useState } from "react";
import { Camera, Location } from "@rnmapbox/maps";
import { useUserLocation } from "@contexts/LocationContext";

export function useMapView(defaultZoom: number = 12) {
  const { userLocation } = useUserLocation();

  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [userCoords, setUserCoords] = useState<Coordinates | null>(null);

  const [center, setCenter] = useState<Coordinates | null>(userLocation);
  const [zoomLevel, setZoomLevel] = useState(defaultZoom);
  const cameraRef = useRef<Camera>(null);

  const hasCenteredOnUser = useRef(false);

  // Center and zoom the map on pressed location
  const handleMapPress = (feature: MapPressFeature, callback?: (coords: Coordinates) => void) => {
    if (!feature.geometry || feature.geometry.type !== "Point") return;
    const coordinates = feature.geometry.coordinates as Coordinates;
    setCoordinates(coordinates);
    setCenter(coordinates);
    setZoomLevel(14);

    // Invoke callback if provided
    if (callback) {
      callback(coordinates);
    }
  };

  // Get & center the map on the user's location
  const handleUserLocation = (location: Location) => {
    const coords: Coordinates = [location.coords.longitude, location.coords.latitude];
    setUserCoords(coords);
    if (!hasCenteredOnUser.current) {
      setCenter(coords);
      hasCenteredOnUser.current = true;
    }
  };

  // Center the map on the selected suggestion
  const handleSuggestionSelect = (long: number, lat: number) => {
    setCoordinates([long, lat]);
    setCenter([long, lat]);
    setZoomLevel(14);
  };

  // Clear the map center and zoom level
  const handleClear = () => {
    setCenter(userCoords);
    setZoomLevel(defaultZoom);
  };

  return {
    userLocation,
    coordinates,
    cameraRef,
    zoomLevel,
    center,
    handleMapPress,
    handleSuggestionSelect,
    handleClear,
    handleUserLocation,
  };
}
