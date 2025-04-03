import React from "react";
import { ShapeSource, LineLayer } from "@rnmapbox/maps";

interface DirectionLineProps {
  id?: string;
  coordinates: Coordinates[];
  color?: string;
  width?: number;
}

export default function DirectionLine({
  id,
  coordinates,
  color = "red",
  width = 3,
}: DirectionLineProps) {
  if (!id) id = "direction-line";

  return (
    <ShapeSource
      id={id}
      testID="direction-line-source"
      shape={{
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: { type: "LineString", coordinates },
            properties: {},
          },
        ],
      }}
    >
      <LineLayer id={`layer-${id}`} style={{ lineColor: color, lineWidth: width }} />
    </ShapeSource>
  );
}
