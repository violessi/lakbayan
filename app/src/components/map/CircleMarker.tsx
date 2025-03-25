import React from "react";
import { point } from "@turf/helpers";
import { ShapeSource, SymbolLayer, CircleLayer } from "@rnmapbox/maps";

interface CircleMarkerProps {
  id: string;
  label?: string | null;
  coordinates: Coordinates | null;
  color?: string;
  radius?: number;
}

// FIXME: duplicate source layers
function CircleMarker({ id, label, coordinates, color = "red", radius = 8 }: CircleMarkerProps) {
  if (!coordinates) return null;

  return (
    <ShapeSource id={id} shape={point(coordinates)}>
      <CircleLayer
        id={`${id}-circle`}
        style={{
          circleRadius: radius,
          circleColor: color,
        }}
      />
      {label ? (
        <SymbolLayer
          id={`${id}-label`}
          style={{
            textField: label,
            textSize: 10,
            textOffset: [0, 4],
          }}
        />
      ) : (
        <></>
      )}
    </ShapeSource>
  );
}

export default CircleMarker;
