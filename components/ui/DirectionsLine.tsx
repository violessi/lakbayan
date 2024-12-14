import React from "react";

import { ShapeSource, LineLayer } from "@rnmapbox/maps";

import { Coordinates } from "@/types/location-types";

interface DirectionsLineProps {
  coordinates: Coordinates[];
}

export default function DirectionsLine({ coordinates }: DirectionsLineProps) {
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
              coordinates: coordinates,
            },
            properties: {},
          },
        ],
      }}
    >
      <LineLayer id={`directions-layer-${lineId}`} style={{ lineColor: "red", lineWidth: 3 }} />
    </ShapeSource>
  );
}
