import * as turf from "@turf/turf";
import { ShapeSource, LineLayer } from "@rnmapbox/maps";
import React, { useRef, useImperativeHandle, forwardRef } from "react";
import { TRANSPORTATION_COLORS as COLORS } from "@constants/transportation-color";

type Data = Coordinates[][] | Segment[] | CreateSegment[];
type Shape = GeoJSON.FeatureCollection<GeoJSON.LineString>;
type Props = { id: string; data: Data; lineWidth?: number; colors?: string[] };
export type LineSourceRef = { update: (data: Data) => void };

// This component takes in a list of line or a segment data and renders them on the map.
// It uses refs to allow parent components to update the data dynamically without re-rendering.
const LineSource = forwardRef<LineSourceRef, Props>(({ id, data, lineWidth, colors }, ref) => {
  const lineRef = useRef<ShapeSource | null>(null);
  const lineColors = colors ?? data.map((_, i) => COLORS[i]);
  const initialShape = generateShape(data, lineColors);

  // Update function to be called from parent components
  const update = (newData: Data) => {
    const newShape = generateShape(newData, lineColors);
    lineRef.current?.setNativeProps({ id, shape: JSON.stringify(newShape) });
  };

  // Expose the update method to parent components via ref
  useImperativeHandle(ref, () => ({ update }));

  return (
    <ShapeSource id={id} ref={lineRef} shape={initialShape}>
      <LineLayer
        id={`line-${id}`}
        style={{ lineColor: ["get", "color"], lineWidth: lineWidth ?? 5 }}
      />
    </ShapeSource>
  );
});

// Generates a GeoJSON shape from given data.
function generateShape(data: Data, colors: string[]): Shape {
  const relativeIndex = colors.length - data.length;
  const features = data
    .map((item, index) => {
      const coordinates = "waypoints" in item ? item.waypoints : item;
      if (coordinates.length < 2) return null;
      return turf.lineString(coordinates, { color: colors[relativeIndex + index] });
    })
    .filter(Boolean);

  return { type: "FeatureCollection", features } as Shape;
}

LineSource.displayName = "LineSource";

export default LineSource;
