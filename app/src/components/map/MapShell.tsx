import React from "react";
import { Platform } from "react-native";
import Mapbox, { MapView, Camera, UserLocation, Location } from "@rnmapbox/maps";

import { MAPBOX_ACCESS_TOKEN } from "@utils/mapbox-config";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

interface MapShellProps {
  center: Coordinates | null;
  zoomLevel: number;
  cameraRef: React.RefObject<Camera>;
  handleMapPress: (feature: MapPressFeature) => void;
  children?: React.ReactNode;
  handleUserLocation: (location: Location) => void;
}

export const MapShell = ({
  center,
  zoomLevel,
  cameraRef,
  handleMapPress,
  children,
  handleUserLocation,
}: MapShellProps) => {
  const finalCenter = center ?? [121.05, 14.63]; // Fallback to QC

  return (
    <MapView
      style={{ flex: 1 }}
      styleURL="mapbox://styles/mapbox/streets-v12"
      onPress={handleMapPress}
      projection="mercator"
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
    </MapView>
  );
};
