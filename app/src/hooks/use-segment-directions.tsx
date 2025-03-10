import { useState, useEffect } from "react";
import { getDirections, paraphraseStep } from "@services/mapbox-service";

interface Step {
  instruction: string;
  location: [number, number];
}

interface Segment {
  start_coords: [number, number];
  end_coords: [number, number];
  segment_mode: string;
  waypoints?: [number, number][];
}

export function useSegmentDirections(segmentData: Segment[], currentSegmentIndex: number) {
  const [segmentRoutes, setSegmentRoutes] = useState<Coordinates[][]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDirections() {
      if (!segmentData.length || currentSegmentIndex >= segmentData.length) return;

      setLoading(true);
      try {
        const segment = segmentData[currentSegmentIndex];
        const { start_coords, end_coords, segment_mode, waypoints = [] } = segment;

        const res = await getDirections(start_coords, waypoints, end_coords, segment_mode, true);
        const routeCoordinates = res?.routes?.[0]?.geometry?.coordinates || [];
        console.log(routeCoordinates);
        setSegmentRoutes([routeCoordinates]);

        const extractedSteps =
          res?.routes?.[0]?.legs.flatMap((leg) =>
            leg.steps.map((step) => ({
              instruction: paraphraseStep(step.maneuver.instruction),
              location: step.maneuver.location,
            })),
          ) || [];

        setSteps(extractedSteps);
      } catch (error) {
        console.error("Error fetching segment directions:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDirections();
  }, [currentSegmentIndex, segmentData]);

  return { segmentRoutes, steps, loading };
}
