import React from "react";
import { ShapeSource, LineLayer } from "@rnmapbox/maps";

interface DirectionsLineProps {
  coordinates: Coordinates[];
  color?: string;
  width?: number;
}

export default function DirectionsLine({
  coordinates,
  color = "red",
  width = 3,
}: DirectionsLineProps) {
  const lineId = `directions-line-${JSON.stringify(coordinates)}`;

  return (
    <ShapeSource
      id={lineId}
      testID="directions-line-source"
      shape={{
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates,
            },
            properties: {},
          },
        ],
      }}
    >
      <LineLayer
        id={`directions-layer-${lineId}`}
        style={{
          lineColor: color,
          lineWidth: width,
        }}
      />
    </ShapeSource>
  );
}
