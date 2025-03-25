import React from "react";

import { point } from "@turf/helpers";
import { ShapeSource, CircleLayer, SymbolLayer } from "@rnmapbox/maps";

interface LocationMarkerProps {
  id: string;
  coordinates: Coordinates;
  label: string;
  color: string;
  radius: number;
}

export default function LocationMarker({ id, coordinates, label, color, radius }: LocationMarkerProps) {
  return (
    <ShapeSource id={id} shape={point(coordinates)}>
      <CircleLayer
        id={`${id}-circle`}
        style={{
          circleRadius: radius,
          circleColor: color,
        }}
      />
      <SymbolLayer
        id={`${id}-label`}
        style={{
          textField: label.split(",")[0],
          textSize: 11,
          textOffset: [0, 1.5],
        }}
      />
    </ShapeSource>
  );
}
