import React from "react";
import { ShapeSource, LineLayer } from "@rnmapbox/maps";
import { TRANSPORTATION_COLORS } from "@constants/transportation-color";
import DirectionLine from "@components/map/DirectionLine";

interface DirectionLinesProps {
  coordinates: Coordinates[][];
}

export default function DirectionLines({ coordinates }: DirectionLinesProps) {
  return (
    <>
      {coordinates.map((coords, index) => (
        <DirectionLine
          key={index}
          id={`line-${index}`}
          coordinates={coords}
          color={TRANSPORTATION_COLORS[index]}
        />
      ))}
    </>
  );
}
