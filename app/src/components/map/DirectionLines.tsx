import React from "react";
import { ShapeSource, LineLayer } from "@rnmapbox/maps";
import { TRANSPORTATION_COLORS } from "@constants/transportation-color";

interface DirectionLineProps {
  coordinates: Coordinates[];
  color: string;
}

interface DirectionLinesProps {
  coordinates: Coordinates[][];
}

export default function DirectionLines({ coordinates }: DirectionLinesProps) {
  return (
    <>
      {coordinates.map((coords, index) => (
        <DirectionLine key={index} coordinates={coords} color={TRANSPORTATION_COLORS[index]} />
      ))}
    </>
  );
}

function DirectionLine({ coordinates, color }: DirectionLineProps) {
  const lineId = `directions-line-${JSON.stringify(coordinates)}`;

  return (
    <ShapeSource
      id={lineId}
      testID="directions-line-source"
      shape={{
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates,
            },
            properties: {},
          },
        ],
      }}
    >
      <LineLayer
        id={`directions-layer-${lineId}`}
        style={{
          lineColor: color,
          lineWidth: 3,
        }}
      />
    </ShapeSource>
  );
}
