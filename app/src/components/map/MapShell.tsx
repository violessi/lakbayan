import React from "react";
import { Platform } from "react-native";
import Mapbox, { Images, MapView, Camera, UserLocation, Location } from "@rnmapbox/maps";

import pinIcon from "@assets/pin-purple.png";
import lineIcon from "@assets/status-colored-lines.png";
import trafficIcon from "@assets/status-colored-traffic.png";
import disruptionIcon from "@assets/status-colored-disruption.png";

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
  handleCameraChange?: (state: MapBoxMapState) => void;
  cameraProps?: React.ComponentProps<typeof Camera>;
  userLocationProps?: React.ComponentProps<typeof UserLocation>;
}

export const MapShell = ({
  children,
  center,
  zoomLevel,
  cameraRef,
  fitBounds,
  handleMapPress,
  handleUserLocation,
  handleCameraChange,
  cameraProps,
  userLocationProps,
}: MapShellProps) => {
  const finalCenter = center ?? [121.05, 14.63]; // Fallback to QC

  const handleMapLoaded = () => {
    if (cameraRef?.current && fitBounds) {
      const padding = [150, 50, 300, 50];
      cameraRef.current.fitBounds(fitBounds[0], fitBounds[1], padding);
    }
  };

  const markers = {
    pin: pinIcon,
    Traffic: trafficIcon,
    Disruption: disruptionIcon,
    "Long Line": lineIcon,
  };

  return (
    <MapView
      style={{ flex: 1 }}
      projection="mercator"
      styleURL="mapbox://styles/mapbox/streets-v12"
      logoEnabled={false}
      scaleBarEnabled={false}
      onPress={handleMapPress}
      onCameraChanged={handleCameraChange}
      onDidFinishLoadingMap={handleMapLoaded}
    >
      <Camera
        ref={cameraRef}
        centerCoordinate={finalCenter}
        zoomLevel={zoomLevel ?? 12}
        animationMode={Platform.OS === "ios" ? "easeTo" : "none"}
        animationDuration={500}
        {...cameraProps}
      />
      <UserLocation
        visible={true}
        androidRenderMode="normal"
        showsUserHeadingIndicator={true}
        onUpdate={handleUserLocation}
        {...userLocationProps}
      />
      {children}
      <Images images={markers} />
    </MapView>
  );
};
