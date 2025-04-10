import { useRef } from "react";
import { reverseGeocode } from "@services/mapbox-service";

// This hook sets the default start location to the user's current location if not already set.
export function useDefaultStartLocation({
  userLocation,
  startLocation,
  onSetStart,
  cameraRef,
  zoomLevel,
}: {
  userLocation?: Coordinates;
  startLocation?: string;
  onSetStart: (location: string, coords: Coordinates) => void;
  cameraRef: React.RefObject<any>;
  zoomLevel: number;
}) {
  const hasSetDefault = useRef(false);

  if (userLocation && !startLocation && !hasSetDefault.current) {
    hasSetDefault.current = true;

    reverseGeocode(userLocation).then((location) => {
      onSetStart(location as string, userLocation);
      cameraRef.current?.setCamera({
        centerCoordinate: userLocation,
        zoomLevel,
        animationDuration: 1000,
      });
    });
  }
}
