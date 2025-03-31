export function mockFullTrip({
  id,
  mode,
  duration,
  cost,
}: {
  id: string;
  mode: TransportationMode;
  duration: number;
  cost: number;
}): FullTrip {
  return {
    id,
    contributorId: "user123",
    name: "Mock Trip",
    gpsVerified: 0,
    modVerified: 0,
    startLocation: "Start",
    startCoords: [0, 0],
    endLocation: "End",
    endCoords: [1, 1],
    duration,
    distance: 0,
    cost,
    upvotes: 0,
    downvotes: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    segments: [
      {
        id: `seg-${id}`,
        contributorId: "user123",
        segmentName: "Mock Segment",
        segmentMode: mode,
        landmark: null,
        instruction: null,
        gpsVerified: 0,
        modVerified: 0,
        duration,
        distance: 0,
        cost,
        waypoints: [],
        navigationSteps: [],
        startLocation: "Start",
        startCoords: [0, 0],
        endLocation: "End",
        endCoords: [1, 1],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  };
}
