import React, { createContext, useState, ReactNode } from "react";
import { getDirections, paraphraseStep } from "@services/mapbox-service";

import { isNearLocation } from "@utils/map-utils";
import { TripEndpointsSchema } from "types/schema";
import { useSession } from "@contexts/SessionContext";
import { fetchTripData } from "@services/trip-service";

const FILTER_INITIAL_STATE = {
  timeToLeave: new Date(),
  sortBy: "Verified by moderators",
  transportModes: ["Train", "Bus", "Jeep", "UV", "Tricycle"],
};

interface TripSearchContextType {
  trip: TripSearch | null;
  setTrip: (trip: TripSearch) => void;
  tripEndpoints: Partial<TripEndpoints> | null;
  updateTripEndpoints: (details: Partial<TripEndpoints>) => void;
  filteredTrips: TripSearch[];
  fetchSuggestedTrips: () => Promise<void>;
  filters: FilterState;
  applyFilters: (filters: FilterState) => void;
}

// =================== Trip Search Context ===================

const TripContext = createContext<TripSearchContextType | null>(null);

export function TripSearchProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();
  if (!user) throw new Error("User must be logged in to create a trip");

  const [trip, setTrip] = useState<TripSearch | null>(null);
  const [filters, setFilters] = useState(FILTER_INITIAL_STATE);
  const [filteredTrips, setFilteredTrips] = useState<TripSearch[]>([]);
  const [suggestedTrips, setSuggestedTrips] = useState<TripSearch[]>([]);
  const [tripEndpoints, setTripEndpoints] = useState<Partial<TripEndpoints>>({});

  const updateTripEndpoints = (details: Partial<TripEndpoints>) => {
    setTripEndpoints((prev) => ({ ...prev, ...details }));
  };

  const fetchSuggestedTrips = async () => {
    try {
      const trip = TripEndpointsSchema.parse(tripEndpoints);
      const existingTrips = await fetchTripData(trip, 1500);
      const fullTrips = await appendWalkingSegments(user.id, existingTrips, trip);
      setSuggestedTrips(fullTrips);
      applyFilters(filters, fullTrips);
    } catch (error) {
      console.error("[ERROR] Fetching suggester trips: ", error);
      throw new Error("Failed to fetch trips");
    }
  };

  const applyFilters = (
    { timeToLeave, sortBy, transportModes }: FilterState,
    fullTrips?: TripSearch[],
  ) => {
    console.debug("[TripSearch] applyFilters ⇢", sortBy);
    const currTrip = fullTrips ?? suggestedTrips;

    const filtered = currTrip
      .filter((trip) =>
        trip.segments.every(
          ({ segmentMode }) => segmentMode === "Walk" || transportModes.includes(segmentMode),
        ),
      )
      .sort(getSortFunction(sortBy));

    // Only update global filters state if array is changed
    if (
      timeToLeave !== filters.timeToLeave ||
      sortBy !== filters.sortBy ||
      !arrayEqual(transportModes, filters.transportModes)
    ) {
      setFilters({ timeToLeave, sortBy, transportModes });
    }
    setFilteredTrips(filtered);
  };

  const value = {
    tripEndpoints,
    updateTripEndpoints,
    filteredTrips,
    fetchSuggestedTrips,
    filters,
    applyFilters,
    trip,
    setTrip,
  };
  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export const useTripSearch = (): TripSearchContextType => {
  const context = React.useContext(TripContext);
  if (!context) {
    throw new Error("useTripSearch must be used within a TripSearchProvider");
  }
  return context;
};

// Helper

const arrayEqual = (a: any[], b: any[]) =>
  a.length === b.length && a.every((item, idx) => item === b[idx]);

// Sorting function
const getSortFunction = (sortBy: string) => {
  switch (sortBy) {
    case "Verified by moderators":
      return (a: TripSearch, b: TripSearch) => b.modVerified - a.modVerified;
    case "Verified by GPS":
      return (a: TripSearch, b: TripSearch) => b.gpsVerified - a.gpsVerified;
    case "Votes":
      return (a: TripSearch, b: TripSearch) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes);
    case "Duration":
      return (a: TripSearch, b: TripSearch) => a.duration - b.duration;
    default:
      return () => 0;
  }
};

// Appends walking segments to the start and end of each trip
async function appendWalkingSegments(
  userId: string,
  trips: FullTrip[],
  endpoints: TripEndpoints,
): Promise<TripSearch[]> {
  return Promise.all(
    trips.map(async (trip) => {
      const start = await generateWalkingSegment(
        userId,
        endpoints.startLocation,
        endpoints.startCoords,
        trip.startLocation,
        trip.startCoords,
      );
      const end = await generateWalkingSegment(
        userId,
        trip.endLocation,
        trip.endCoords,
        endpoints.endLocation,
        endpoints.endCoords,
      );

      const newTrip: TripSearch = { ...trip, preSegment: null, postSegment: null };

      if (start) {
        const { id, createdAt, updatedAt, ...cleanStart } = start;
        newTrip.startLocation = endpoints.startLocation;
        newTrip.startCoords = endpoints.startCoords;
        newTrip.segments.unshift(start);
        newTrip.preSegment = cleanStart;
      }
      if (end) {
        const { id, createdAt, updatedAt, ...cleanEnd } = end;
        newTrip.endLocation = endpoints.endLocation;
        newTrip.endCoords = endpoints.endCoords;
        newTrip.segments.push(end);
        newTrip.postSegment = cleanEnd;
      }

      return newTrip;
    }),
  );
}

// Generates a walking segment if the start and end coordinates are different
async function generateWalkingSegment(
  userId: string,
  startLocation: string,
  startCoords: Coordinates,
  endLocation: string,
  endCoords: Coordinates,
): Promise<Segment | null> {
  if (isNearLocation(startCoords, endCoords, 100)) return null;

  const data = await getDirections(startCoords, [], endCoords, "Walk", true);
  const directions = data.routes[0];
  const waypoints = directions.geometry.coordinates ?? [];
  const duration = directions.duration;
  const distance = directions.distance;
  const navigationSteps = directions.legs.flatMap(({ steps }) =>
    steps.map(({ maneuver }) => ({
      instruction: paraphraseStep(maneuver.instruction),
      location: maneuver.location,
    })),
  );

  return {
    id: `walk-${startLocation}-${endLocation}`,
    contributorId: userId,
    segmentName: `Walk from ${startLocation} to ${endLocation}`,
    segmentMode: "Walk",
    landmark: "",
    instruction: `Walk from ${startLocation} to ${endLocation}`,
    gpsVerified: 0,
    modVerified: 0,
    duration,
    distance,
    cost: 0,
    waypoints,
    navigationSteps,
    startLocation,
    startCoords,
    endLocation,
    endCoords,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
