import React from "react";
import { point } from "@turf/helpers";
import { ShapeSource, SymbolLayer, Images } from "@rnmapbox/maps";

interface LiveUpdateMarkerProps {
  id: string;
  type: string;
  coordinates: Coordinates | null | undefined;
  iconSize?: number;
}
function LiveUpdateMarker({ id, type, coordinates, iconSize = 0.03 }: LiveUpdateMarkerProps) {
  if (!coordinates) return null;

  return (
    <ShapeSource id={id} shape={point(coordinates)}>
      <SymbolLayer
        id={`${id}-icon`}
        style={{
          iconImage: type,
          iconSize: iconSize,
        }}
      />
    </ShapeSource>
  );
}
export default LiveUpdateMarker;
