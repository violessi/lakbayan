import React from "react";

import { Coordinates } from "@/types/location-types";

import { point } from "@turf/helpers";
import { ShapeSource, CircleLayer, SymbolLayer } from "@rnmapbox/maps";

interface LocationMarkerProps {
  coordinates: Coordinates;
  label: string;
  color: string;
  radius: number;
}

export default function LocationMarker({ coordinates, label, color, radius }: LocationMarkerProps) {
  return (
    <ShapeSource id={label} shape={point(coordinates)}>
      <CircleLayer
        id={`${label}-circle`}
        style={{
          circleRadius: radius,
          circleColor: color,
        }}
      />
      <SymbolLayer
        id={`${label}-label`}
        style={{
          textField: label.split(",")[0],
          textSize: 11,
          textOffset: [0, 1.5],
        }}
      />
    </ShapeSource>
  );
}
