import Mapbox, { MapView, Camera, ShapeSource, LineLayer } from "@rnmapbox/maps";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native";

import { MAPBOX_ACCESS_TOKEN } from "@utils/mapbox-config";
import { getDotcRoutes } from "@services/dotc-routes";

import Header from "@components/ui/Header";
import JeepInformation from "@components/contribute/JeepInformation";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function TodaStops() {
  const [dotcRoutes, setDotcRoutes] = useState<DotcRoute | null>(null);
  const [activeRoute, setActiveRoute] = useState<DotcRoute | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(11);

  const calculateLineWidth = (zoom: number) => {
    return Math.min(10, Math.max(1, zoom * 0.4));
  };

  useEffect(() => {
    getDotcRoutes().then((data) => {
      setDotcRoutes(data);
    });
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="DOTC Routes" />

      <MapView
        style={{ flex: 1 }}
        styleURL="mapbox://styles/mapbox/streets-v12"
        projection="mercator"
        onRegionDidChange={({ properties }) => {
          setZoomLevel(properties.zoomLevel);
        }}
      >
        <Camera centerCoordinate={[121.05, 14.63]} zoomLevel={11} animationMode="easeTo" />
        {activeRoute && (
          <ShapeSource id="routeSource" shape={activeRoute}>
            <LineLayer
              id="exampleLineLayer"
              style={{
                lineColor: "#42A2D9",
                lineCap: "round",
                lineJoin: "round",
                lineWidth: calculateLineWidth(zoomLevel),
              }}
            />
          </ShapeSource>
        )}
      </MapView>
      <JeepInformation dotcRoutes={dotcRoutes} setActiveRoute={setActiveRoute} />
    </SafeAreaView>
  );
}
