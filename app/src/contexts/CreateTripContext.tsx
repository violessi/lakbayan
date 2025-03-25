import React, { createContext, useState, ReactNode } from "react";

import { useSession } from "@contexts/SessionContext";
import { insertTrip, insertSegments, insertTripSegmentLinks } from "@services/trip-service-v2";
import { TRIP_INITIAL_STATE, ROUTE_INITIAL_STATE } from "@contexts/CreateTripInitialValues";

interface CreateTripContextType {
  trip: CreateTripV2;
  route: CreateRouteV2;
  segments: CreateSegmentV2[];
  addSegment: (segment: CreateSegmentV2) => void;
  updateRoute: (updates: Partial<CreateRouteV2>) => void;
  updateTrip: (updates: Partial<CreateTripV2>) => void;
  submitTrip: () => Promise<{ tripData: TripV2[]; segmentData: SegmentV2[] }>;
}

interface CreateTripProviderProps {
  children: ReactNode;
}

const TripContext = createContext<CreateTripContextType | undefined>(undefined);

export function CreateTripProvider({ children }: CreateTripProviderProps) {
  const { user } = useSession();
  if (!user) throw new Error("User must be logged in to create a trip");

  // Global state for the trip creation process
  // Routes are temporary and will be used for segment creation
  const [trip, setTrip] = useState<CreateTripV2>(TRIP_INITIAL_STATE);
  const [route, setRoute] = useState<CreateRouteV2>(ROUTE_INITIAL_STATE);
  const [segments, setSegments] = useState<CreateSegmentV2[]>([]);

  const addSegment = (segment: CreateSegmentV2) => {
    setSegments((prevSegments) => [...prevSegments, segment]);
  };

  const updateRoute = (updates: Partial<CreateRouteV2>) => {
    setRoute((prevRoute) => ({ ...prevRoute, ...updates }));
  };

  const updateTrip = (updates: Partial<CreateTripV2>) => {
    setTrip((prevTrip) => ({ ...prevTrip, ...updates }));
  };

  // Handles the submission of the trip, segments, and junction table
  const submitTrip = async () => {
    const newTrip: CreateTripV2 = {
      ...trip,
      contributorId: user.id,
      name: `${trip.startLocation} to ${trip.endLocation}`,
      duration: segments.reduce((acc, segment) => acc + segment.duration, 0),
      cost: segments.reduce((acc, segment) => acc + segment.cost, 0),
    };

    try {
      const tripData = await insertTrip(newTrip);
      console.log("\n[SUCCESS] Trip added to the table:", tripData);
      const segmentData = await insertSegments(segments);
      console.log("\n[SUCCESS] Segment added to the table:", segmentData);
      const tripSegmentLinks = await insertTripSegmentLinks(tripData, segmentData);
      console.log("\n[SUCCESS] Trip segment links added to the table:", tripSegmentLinks);
      return { tripData, segmentData, tripSegmentLinks };
    } catch (error) {
      throw new Error(`[ERROR] Failed to submit trip: ${error}`);
    }
  };

  const value = { trip, route, segments, addSegment, updateRoute, updateTrip, submitTrip };
  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export const useCreateTrip = (): CreateTripContextType => {
  const context = React.useContext(TripContext);
  if (!context) {
    throw new Error("useCreateTrip must be used within a CreateTripProvider");
  }
  return context;
};
