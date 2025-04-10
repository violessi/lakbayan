import * as turf from "@turf/turf";
import { ShapeSource, SymbolLayer } from "@rnmapbox/maps";
import React, { useRef, useImperativeHandle, forwardRef } from "react";

type Data = Coordinates[] | LiveUpdate[] | Segment[];
type Shape = GeoJSON.FeatureCollection<GeoJSON.Point>;
type Props = { id: string; data?: Data; iconImage?: string; iconSize?: number };

export type SymbolSourceRef = { update: (data: Data) => void };

// This component renders symbols/icons dynamically on the map
// Takes in a list of coordinates or live updates or segments
const SymbolSource = forwardRef<SymbolSourceRef, Props>(
  ({ id, data, iconImage = "pin", iconSize = 0.03 }, ref) => {
    const symbolRef = useRef<ShapeSource | null>(null);
    const initialShape = generateShape(data ?? [], iconImage);

    // Update function to modify symbols dynamically
    const update = (newData: Data) => {
      const newShape = generateShape(newData, iconImage);
      symbolRef.current?.setNativeProps({ id, shape: JSON.stringify(newShape) });
    };

    useImperativeHandle(ref, () => ({ update }));

    return (
      <ShapeSource id={id} ref={symbolRef} shape={initialShape}>
        <SymbolLayer
          id={`symbol-${id}`}
          style={{
            iconImage: ["get", "iconImage"],
            iconSize,
          }}
        />
      </ShapeSource>
    );
  },
);

// Generates a GeoJSON shape with different icon images
function generateShape(data: Data, icon: string): Shape {
  const features = data.map((item) => {
    // Logic to determine the type of data, find better solution
    const coordinates =
      "waypoints" in item ? item.endCoords : "coordinate" in item ? item.coordinate : item;
    const iconImage = "type" in item ? item.type : icon;
    return turf.point(coordinates, { iconImage });
  });
  return { type: "FeatureCollection", features };
}

SymbolSource.displayName = "SymbolSource";

export default SymbolSource;
