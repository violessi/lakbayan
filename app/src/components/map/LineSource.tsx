import * as turf from "@turf/turf";
import { ShapeSource, LineLayer } from "@rnmapbox/maps";
import React, { useRef, useImperativeHandle, forwardRef } from "react";

import { TRANSPORTATION_COLORS as COLORS } from "@constants/transportation-color";

type Colors = Map<string, string>;
type Props = { segments: Segment[] };
type Shape = GeoJSON.FeatureCollection<GeoJSON.LineString>;

export type LineSourceRef = {
  update: (segments: Segment[]) => void;
};

// Generates a GeoJSON shape from given segments.
const generateShape = (segments: Segment[], lineColors: Colors): Shape => ({
  type: "FeatureCollection",
  features: segments.map((segment) =>
    turf.lineString(segment.waypoints, {
      color: lineColors.get(segment.id),
    }),
  ),
});

// LineSource component to render a line on the map.
const LineSource = forwardRef<LineSourceRef, Props>(({ segments }, ref) => {
  const lineRef = useRef<ShapeSource | null>(null);
  const id = `shape-${segments.map(({ id }) => id).join("-")}`;
  const lineColors = new Map(segments.map(({ id }, i) => [id, COLORS[i]]));
  const initialShape = generateShape(segments, lineColors);

  // Updates the shape dynamically without re-rendering.
  const updateShape = (activeSegments: Segment[]) => {
    const newShape = generateShape(activeSegments, lineColors);
    lineRef.current?.setNativeProps({ id, shape: JSON.stringify(newShape) });
  };

  // Expose update method via ref
  useImperativeHandle(ref, () => ({
    update: updateShape,
  }));

  return (
    <ShapeSource id={id} ref={lineRef} shape={initialShape}>
      <LineLayer id={`line-${id}`} style={{ lineColor: ["get", "color"], lineWidth: 5 }} />
    </ShapeSource>
  );
});

export default LineSource;
