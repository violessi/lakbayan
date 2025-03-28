import React, { createContext, useState, ReactNode, useEffect } from "react";

import { useSession } from "@contexts/SessionContext";
import { insertTrip, insertSegments, insertTripSegmentLinks } from "@services/trip-service-v2";
import { TRIP_INITIAL_STATE, SEGMENT_INITIAL_STATE } from "@contexts/TripCreator/initialValues";

interface TripCreatorContextType {
  trip: CreateTrip;
  route: CreateSegment;
  segments: CreateSegment[];
  addSegment: () => void;
  updateRoute: (updates: Partial<CreateSegment>) => void;
  updateTrip: (updates: Partial<CreateTrip>) => void;
  submitTrip: () => Promise<{ tripData: Trip[]; segmentData: Segment[] }>;
}

interface TripCreatorProviderProps {
  children: ReactNode;
}

// =================== Trip Creator Context ===================

const TripContext = createContext<TripCreatorContextType | null>(null);

export function TripCreatorProvider({ children }: TripCreatorProviderProps) {
  const { user } = useSession();
  if (!user) throw new Error("User must be logged in to create a trip");

  // Routes are temporary and are used for segment creation
  const [trip, setTrip] = useState<CreateTrip>(TRIP_INITIAL_STATE);
  const [route, setRoute] = useState<CreateSegment>(SEGMENT_INITIAL_STATE);
  const [segments, setSegments] = useState<CreateSegment[]>([]);

  const updateRoute = (updates: Partial<CreateSegment>) => {
    setRoute((prevRoute) => ({ ...prevRoute, ...updates }));
  };

  const updateTrip = (updates: Partial<CreateTrip>) => {
    setTrip((prevTrip) => ({ ...prevTrip, ...updates }));
  };

  const addSegment = () => {
    const segment = { ...route, contributorId: user.id };
    setRoute(SEGMENT_INITIAL_STATE);
    setSegments((prevSegments) => [...prevSegments, segment]);
  };

  // Handles the submission of the trip, segments, and junction table
  const submitTrip = async () => {
    const newTrip: CreateTrip = {
      ...trip,
      contributorId: user.id,
      name: `${trip.startLocation} to ${trip.endLocation}`,
      duration: segments.reduce((acc, segment) => acc + segment.duration, 0),
      distance: segments.reduce((acc, segment) => acc + segment.distance, 0),
      cost: segments.reduce((acc, segment) => acc + segment.cost, 0),
    };

    try {
      const tripData = await insertTrip(newTrip);
      const segmentData = await insertSegments(segments);
      const tripSegmentLinks = await insertTripSegmentLinks(tripData, segmentData);
      return { tripData, segmentData, tripSegmentLinks };
    } catch (error) {
      throw new Error(`[ERROR] Failed to submit trip: ${error}`);
    }
  };

  // Update the start location and coordinates of the route every time a segment is added
  useEffect(() => {
    const lastSegment = segments.length > 0 ? segments[segments.length - 1] : null;
    updateRoute({
      ...route,
      startLocation: lastSegment ? lastSegment.endLocation : trip.startLocation,
      startCoords: lastSegment ? lastSegment.endCoords : trip.startCoords,
    });
  }, [segments, trip]);

  const value = { trip, route, segments, addSegment, updateRoute, updateTrip, submitTrip };
  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export const useTripCreator = (): TripCreatorContextType => {
  const context = React.useContext(TripContext);
  if (!context) {
    throw new Error("useCreateTrip must be used within a TripCreatorProvider");
  }
  return context;
};
