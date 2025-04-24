import { useEffect, useRef } from "react";
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

  useEffect(() => {
    if (!hasSetDefault.current && userLocation && !startLocation) {
      hasSetDefault.current = true;

      (async () => {
        try {
          const location = (await reverseGeocode(userLocation)) as string;
          onSetStart(location, userLocation);

          cameraRef.current?.setCamera({
            centerCoordinate: userLocation,
            zoomLevel,
            animationDuration: 1000,
          });
        } catch (err) {
          console.warn("Failed to reverse geocode or set default location", err);
        }
      })();
    }
  }, [userLocation, startLocation]);
}
