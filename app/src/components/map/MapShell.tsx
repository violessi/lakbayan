import React from "react";
import { Platform } from "react-native";
import Mapbox, { Images, MapView, Camera, UserLocation, Location } from "@rnmapbox/maps";
import type { Feature, Point } from "geojson";
import pinIcon from "@assets/pin-purple.png";
import trafficIcon from "@assets/report-traffic.png";
import lineIcon from "@assets/report-lines.png";
import disruptionIcon from "@assets/report-disruption.png";

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
  handleRegionChange?: (region: Feature<Point, MapBoxRegionPayload>) => void;
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
  handleRegionChange,
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
      styleURL="mapbox://styles/mapbox/streets-v12"
      onPress={handleMapPress}
      projection="mercator"
      onDidFinishLoadingMap={handleMapLoaded}
      onRegionDidChange={handleRegionChange}
    >
      <Camera
        ref={cameraRef}
        centerCoordinate={finalCenter}
        zoomLevel={zoomLevel ?? 12}
        animationMode={"easeTo"}
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
