import React from "react";
import { point } from "@turf/helpers";
import { ShapeSource, SymbolLayer, CircleLayer } from "@rnmapbox/maps";

interface CircleMarkerProps {
  id: string;
  label?: string | null;
  coordinates: Coordinates | null | undefined;
  color?: string;
  radius?: number;
  testID?: string;
}

// FIXME: duplicate source layers
function CircleMarker({
  id,
  label,
  coordinates,
  color = "purple",
  radius = 8,
  testID = "circle-marker",
}: CircleMarkerProps) {
  if (!coordinates) return null;

  return (
    <ShapeSource id={id} shape={point(coordinates)}>
      <CircleLayer
        id={`${id}-circle`}
        style={{
          circleRadius: radius,
          circleColor: color,
        }}
        testID={testID}
      />
      {label ? (
        <SymbolLayer
          id={`${id}-label`}
          style={{
            textField: label,
            textSize: 10,
            textOffset: [0, 2],
            textAllowOverlap: true,
          }}
        />
      ) : (
        <></>
      )}
    </ShapeSource>
  );
}

export default CircleMarker;
