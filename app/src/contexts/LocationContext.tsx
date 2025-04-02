import React, { createContext, useState, useEffect, ReactNode } from "react";
import * as ExpoLocation from "expo-location";

// Define the context type
interface LocationContextType {
  userLocation: [number, number] | null;
  permissionGranted: boolean;
}

// Create context with default values
export const LocationContext = createContext<LocationContextType>({
  userLocation: null,
  permissionGranted: false,
});

// Provider component
export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    (async () => {
      console.log("getting permission");
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status === "granted") {
        setPermissionGranted(true);
        const location = await ExpoLocation.getCurrentPositionAsync({});
        const newCoords: [number, number] = [location.coords.longitude, location.coords.latitude];
        setUserLocation(newCoords);
      } else {
        console.warn("Permission to access location was denied");
      }
    })();
  }, []);

  return (
    <LocationContext.Provider value={{ userLocation, permissionGranted }}>
      {children}
    </LocationContext.Provider>
  );
};
