import * as turf from "@turf/turf";
import { ShapeSource, CircleLayer } from "@rnmapbox/maps";
import React, { useRef, useImperativeHandle, forwardRef } from "react";
import { TRANSPORTATION_COLORS as COLORS } from "@constants/transportation-color";

type Data = Coordinates[] | Segment[];
type Shape = GeoJSON.FeatureCollection<GeoJSON.Point>;
type Props = { id: string; data: Data; colors?: string[]; radius?: number };
export type CircleSourceRef = { update: (data: Data) => void };

// This component takes in a list of circle or a segment data and renders them on the map.
// It uses refs to allow parent components to update the data dynamically without re-rendering.
const CircleSource = forwardRef<CircleSourceRef, Props>(({ id, data, colors, radius = 8 }, ref) => {
  const circleRef = useRef<ShapeSource | null>(null);
  const circleColors = colors ?? data.map((_, i) => COLORS[i]);
  const initialShape = generateShape(data, circleColors);

  // Update function to be called from parent components
  const update = (newData: Data) => {
    const newShape = generateShape(newData, circleColors);
    circleRef.current?.setNativeProps({ id, shape: JSON.stringify(newShape) });
  };

  // Expose the update method to parent components via ref
  useImperativeHandle(ref, () => ({ update }));

  return (
    <ShapeSource id={id} ref={circleRef} shape={initialShape}>
      <CircleLayer
        id={`circle-${id}`}
        style={{
          circleRadius: radius,
          circleColor: ["get", "color"],
        }}
      />
    </ShapeSource>
  );
});

// Generates a GeoJSON shape from given data
function generateShape(data: Data, colors: string[]): Shape {
  const relativeIndex = colors.length - data.length;

  const features = data.map((item, index) => {
    const coordinates = "waypoints" in item ? item.endCoords : item;
    return turf.point(coordinates, { color: colors[relativeIndex + index] });
  });

  return { type: "FeatureCollection", features };
}

CircleSource.displayName = "CircleSource";

export default CircleSource;
