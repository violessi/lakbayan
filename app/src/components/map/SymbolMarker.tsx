import React from "react";
import { point } from "@turf/helpers";
import { ShapeSource, SymbolLayer } from "@rnmapbox/maps";

interface SymbolMarkerProps {
  id: string;
  coordinates: Coordinates | null | undefined;
  label?: string | null | undefined;
  iconImage?: string;
  iconSize?: number;
}

// Renders a single symbol marker on the map using ShapeSource and SymbolLayer.
// Ideal for static or individually controlled markers.
// For dynamic or data-driven markers, consider using the SymbolSource component instead.
function SymbolMarker({
  id,
  coordinates,
  label,
  iconImage = "pin",
  iconSize = 0.1,
}: SymbolMarkerProps) {
  if (!coordinates) return null;

  // FIXME: add offset to the icon
  return (
    <ShapeSource id={id} shape={point(coordinates)}>
      <SymbolLayer
        id={`${id}-icon`}
        style={{
          iconImage: iconImage,
          iconSize: iconSize,
          iconAllowOverlap: true,
        }}
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

export default SymbolMarker;
