import React from "react";
import { ShapeSource, LineLayer } from "@rnmapbox/maps";

interface DirectionsLineProps {
  coordinates: Coordinates[];
  color?: string;
}

export default function DirectionsLine({ coordinates, color = "red" }: DirectionsLineProps) {
  const lineId = `directions-line-${JSON.stringify(coordinates)}`;

  return (
    <ShapeSource
      id={lineId}
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
          lineWidth: 3,
        }}
      />
    </ShapeSource>
  );
}
