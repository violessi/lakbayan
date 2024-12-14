import React from "react";

import { Coordinates } from "@/types/location-types";

import { point } from "@turf/helpers";
import { ShapeSource, CircleLayer, SymbolLayer } from "@rnmapbox/maps";

interface LocationMarkerProps {
  coordinates: Coordinates;
  label: string;
}

export default function LocationMarker({ coordinates, label }: LocationMarkerProps) {
  return (
    <ShapeSource id={label} shape={point(coordinates)}>
      <CircleLayer
        id={`${label}-circle`}
        style={{
          circleRadius: 8,
          circleColor: "red",
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
