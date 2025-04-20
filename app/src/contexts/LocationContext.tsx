import * as ExpoLocation from "expo-location";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define the context type
interface LocationContextType {
  userLocation: Coordinates | null;
  permissionGranted: boolean;
}

// Create context with default values
export const LocationContext = createContext<LocationContextType>({
  userLocation: null,
  permissionGranted: false,
});

// Provider component
export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status === "granted") {
        setPermissionGranted(true);
        const location = await ExpoLocation.getCurrentPositionAsync({});
        const newCoords: Coordinates = [location.coords.longitude, location.coords.latitude];
        setUserLocation(newCoords);
      } else {
        console.warn("Permission to access location was denied");
      try {
        const { status: foregroundStatus } = await ExpoLocation.requestForegroundPermissionsAsync();

        console.log("Foreground permission:", foregroundStatus);

        if (foregroundStatus === "granted") {
          setPermissionGranted(true);
          const location = await ExpoLocation.getCurrentPositionAsync({});
          const newCoords: Coordinates = [location.coords.longitude, location.coords.latitude];
          setUserLocation(newCoords);
          console.log("User location set:", newCoords);
        } else {
          console.warn("Permission denied");
        }
      } catch (error) {
        console.error("Error getting location:", error);
      }
    })();
  }, []);

  return (
    <LocationContext.Provider value={{ userLocation, permissionGranted }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useUserLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
