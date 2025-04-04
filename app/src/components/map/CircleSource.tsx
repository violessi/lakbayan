import * as turf from "@turf/turf";
import { ShapeSource, CircleLayer, SymbolLayer } from "@rnmapbox/maps";
import React, { useRef, useImperativeHandle, forwardRef } from "react";

import { TRANSPORTATION_COLORS as COLORS } from "@constants/transportation-color";

type Colors = Map<string, string>;
type Props = { id: string; segments: Segment[]; radius?: number };
type Shape = GeoJSON.FeatureCollection<GeoJSON.Point>;

export type CircleSourceRef = {
  update: (segments: Segment[]) => void;
};

// Generates a GeoJSON shape from given segments for circles.
const generateShape = (segments: Segment[], circleColors: Colors): Shape => ({
  type: "FeatureCollection",
  features: segments.map((segment) =>
    turf.point(segment.waypoints[segment.waypoints.length - 1], {
      color: circleColors.get(segment.id),
    }),
  ),
});

// CircleSource component to render circles on the map.
const CircleSource = forwardRef<CircleSourceRef, Props>(({ id, segments, radius = 8 }, ref) => {
  const circleRef = useRef<ShapeSource | null>(null);
  const circleColors = new Map(segments.map(({ id }, i) => [id, COLORS[i]]));
  const initialShape = generateShape(segments, circleColors);

  // Updates the shape dynamically without re-rendering.
  const updateShape = (activeSegments: Segment[]) => {
    const newShape = generateShape(activeSegments, circleColors);
    circleRef.current?.setNativeProps({ id, shape: JSON.stringify(newShape) });
  };

  // Expose update method via ref
  useImperativeHandle(ref, () => ({
    update: updateShape,
  }));

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

export default CircleSource;
