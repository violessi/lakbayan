import React from "react";
import { Platform } from "react-native";
import Mapbox, { Images, MapView, Camera, UserLocation, Location } from "@rnmapbox/maps";

import pin from "@assets/pin-purple.png";
import { MAPBOX_ACCESS_TOKEN } from "@utils/mapbox-config";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

interface MapShellProps {
  children?: React.ReactNode;
  center?: Coordinates | null;
  zoomLevel?: number;
  cameraRef?: React.RefObject<Camera>;
  fitBounds?: Coordinates[];
  handleMapPress?: (feature: MapPressFeature) => void;
  handleUserLocation?: (location: Location) => void;
}

export const MapShell = ({
  children,
  center,
  zoomLevel,
  cameraRef,
  fitBounds,
  handleMapPress,
  handleUserLocation,
}: MapShellProps) => {
  const finalCenter = center ?? [121.05, 14.63]; // Fallback to QC

  const handleMapLoaded = () => {
    if (cameraRef?.current && fitBounds) {
      const padding = [150, 50, 300, 50];
      cameraRef.current.fitBounds(fitBounds[0], fitBounds[1], padding);
    }
  };

  return (
    <MapView
      style={{ flex: 1 }}
      styleURL="mapbox://styles/mapbox/streets-v12"
      onPress={handleMapPress}
      projection="mercator"
      onDidFinishLoadingMap={handleMapLoaded}
    >
      <Camera
        ref={cameraRef}
        centerCoordinate={finalCenter}
        zoomLevel={zoomLevel}
        animationMode={Platform.OS === "android" ? "none" : "easeTo"}
      />
      <UserLocation
        visible={true}
        androidRenderMode="normal"
        showsUserHeadingIndicator={true}
        onUpdate={handleUserLocation}
      />
      {children}
      <Images images={{ pin }} />
    </MapView>
  );
};
