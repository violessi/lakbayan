export const TRIP_INITIAL_STATE: CreateTripV2 = {
  contributorId: "",
  name: "",
  duration: 0,
  cost: 0,
  gpsVerified: 0,
  modVerified: 0,
  upvotes: 0,
  downvotes: 0,
  startLocation: "",
  startCoords: [0, 0],
  endLocation: "",
  endCoords: [0, 0],
};

export const ROUTE_INITIAL_STATE: CreateRouteV2 = {
  startLocation: "",
  startCoords: [0, 0],
  endLocation: "",
  endCoords: [0, 0],
  segmentMode: "Walk",
};
