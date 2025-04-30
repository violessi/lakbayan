import * as ExpoLocation from "expo-location";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AppState } from "react-native";
import { Alert } from "react-native";

interface LocationContextType {
  userLocation: Coordinates | null;
  permissionGranted: boolean;
  requestLocationPermission: () => Promise<string>;
}

export const LocationContext = createContext<LocationContextType>({
  userLocation: null,
  permissionGranted: false,
  requestLocationPermission: async () => "",
});

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const checkPermission = async () => {
    const { status } = await ExpoLocation.getForegroundPermissionsAsync();
    setPermissionGranted(status === "granted");
    return status;
  };

  const requestLocationPermission = async () => {
    const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
    await checkPermission();
    return status;
  };

  // On mount
  useEffect(() => {
    (async () => {
      await requestLocationPermission();
    })();
  }, []);

  // Refresh permission when app returns from background
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        checkPermission();
      }
    });
    return () => subscription.remove();
  }, []);

  // Update location if permission is granted
  useEffect(() => {
    const getLocation = async () => {
      if (permissionGranted) {
        const location = await ExpoLocation.getCurrentPositionAsync({});
        const coords: Coordinates = [location.coords.longitude, location.coords.latitude];
        setUserLocation(coords);
      }
    };
    getLocation();
  }, [permissionGranted]);

  useEffect(() => {
    const watchLocation = async () => {
      if (permissionGranted) {
        const subscription = await ExpoLocation.watchPositionAsync(
          { accuracy: ExpoLocation.Accuracy.High, distanceInterval: 1 },
          (location) => {
            const newCoords: Coordinates = [location.coords.longitude, location.coords.latitude];
            setUserLocation(newCoords);
          },
        );
        return () => subscription.remove();
      }
    };
    watchLocation();
  }, [permissionGranted]);

  return (
    <LocationContext.Provider value={{ userLocation, permissionGranted, requestLocationPermission }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useUserLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  if (!context.permissionGranted){
    Alert.alert(
      "Location Permission Required",
      "Lakbayan needs access to your location to function properly. Please go to your device's settings to enable it.",
      [
        {
          text: "OK",
        },
      ],
    );
  }
  return context;
};
