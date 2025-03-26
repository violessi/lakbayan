import React from "react";
import { point } from "@turf/helpers";
import { ShapeSource, SymbolLayer, Images } from "@rnmapbox/maps";

interface SymbolMarkerProps {
  id: string;
  label?: string | null | undefined;
  coordinates: Coordinates | null | undefined;
  iconImage?: string;
  iconSize?: number;
}

// FIXME: duplicate source layers
function SymbolMarker({ id, label, coordinates, iconImage = "pin", iconSize = 0.1 }: SymbolMarkerProps) {
  if (!coordinates) return null;

  return (
    <ShapeSource id={id} shape={point(coordinates)}>
      <SymbolLayer
        id={`${id}-icon`}
        style={{
          iconImage: iconImage,
          iconSize: iconSize,
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

export default SymbolMarker;
