import React, { createContext, useState, ReactNode } from "react";

import { useSession } from "@contexts/SessionContext";
import { addToPendingModeratorReview } from "@services/moderation-service";
import { insertTrip, insertSegments, insertTripSegmentLinks } from "@services/trip-service";
import { TRIP_INITIAL_STATE, SEGMENT_INITIAL_STATE } from "@contexts/TripCreator/initialValues";

interface TripCreatorContextType {
  trip: CreateTrip;
  route: CreateSegment;
  segments: CreateSegment[];
  inEditMode: boolean;
  isSegmentEmpty: boolean;
  isSegmentComplete: boolean;
  setInEditMode: (editMode: boolean) => void;
  addSegment: (index?: number) => void;
  updateRoute: (updates: Partial<CreateSegment>) => void;
  updateTrip: (updates: Partial<CreateTrip>) => void;
  submitTrip: () => Promise<void>;
  clearTripData: () => void;
  clearRouteData: () => void;
  deleteSegment: () => void;
}

interface TripCreatorProviderProps {
  children: ReactNode;
}

// =================== Trip Creator Context ===================

const TripCreatorContext = createContext<TripCreatorContextType | null>(null);

export function TripCreatorProvider({ children }: TripCreatorProviderProps) {
  const { user } = useSession();
  if (!user) throw new Error("User must be logged in to create a trip");

  const [trip, setTrip] = useState<CreateTrip>(TRIP_INITIAL_STATE);
  const [route, setRoute] = useState<CreateSegment>(SEGMENT_INITIAL_STATE);
  const [segments, setSegments] = useState<CreateSegment[]>([]);
  const [inEditMode, setInEditMode] = useState(false);

  const isSegmentEmpty = !segments.length;
  const isSegmentComplete = segments.some((segment) => segment.endLocation === trip.endLocation);

  // =================== Update Functions ===================

  const updateRoute = (updates: Partial<CreateSegment>) => {
    setRoute((prevRoute) => ({ ...prevRoute, ...updates }));
  };

  const updateTrip = (updates: Partial<CreateTrip>) => {
    setTrip((prevTrip) => ({ ...prevTrip, ...updates }));
  };

  const addSegment = (index?: number) => {
    const segment = { ...route, contributorId: user.id };

    if (inEditMode && index !== undefined) {
      setSegments((prev) => prev.map((s, i) => (i === index ? segment : s)));
      setInEditMode(false);
    } else {
      setSegments((prevSegments) => [...prevSegments, segment]);
    }
  };

  const deleteSegment = () => {
    setSegments((prevSegments) => prevSegments.slice(0, -1));
  };

  // =================== Reset Functions ===================

  const clearTripData = () => {
    setTrip((prevTrip) => ({
      ...TRIP_INITIAL_STATE,
      startLocation: prevTrip.startLocation,
      startCoords: prevTrip.startCoords,
      endCoords: prevTrip.endCoords,
      endLocation: prevTrip.endLocation,
    }));
    setRoute(SEGMENT_INITIAL_STATE);
    setSegments([]);
  };

  const clearRouteData = () => {
    const lastSegment = segments.length > 0 ? segments[segments.length - 1] : null;
    updateRoute({
      ...SEGMENT_INITIAL_STATE,
      startLocation: lastSegment ? lastSegment.endLocation : trip.startLocation,
      startCoords: lastSegment ? lastSegment.endCoords : trip.startCoords,
    });
  };

  // =================== Submission Handler ===================
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
      const tripId = await insertTrip(newTrip);
      const segmentIds = await insertSegments(segments);
      await insertTripSegmentLinks(tripId, segmentIds);
      await addToPendingModeratorReview(tripId, "trip");
    } catch (error) {
      throw new Error(`[ERROR] Failed to create trip:\n${error}`);
    }
  };

  return (
    <TripCreatorContext.Provider
      value={{
        trip,
        route,
        segments,
        inEditMode,
        isSegmentEmpty,
        isSegmentComplete,
        setInEditMode,
        addSegment,
        updateRoute,
        updateTrip,
        submitTrip,
        clearTripData,
        clearRouteData,
        deleteSegment,
      }}
    >
      {children}
    </TripCreatorContext.Provider>
  );
}

export const useTripCreator = (): TripCreatorContextType => {
  const context = React.useContext(TripCreatorContext);
  if (!context) {
    throw new Error("useTripCreator must be used within a TripCreatorProvider");
  }
  return context;
};
