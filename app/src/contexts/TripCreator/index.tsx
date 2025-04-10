import React, { createContext, useState, ReactNode } from "react";

import { useSession } from "@contexts/SessionContext";
import { getDirections, paraphraseStep } from "@services/mapbox-service";
import { addToPendingModeratorReview } from "@services/moderation-service";
import { insertTrip, insertSegments, insertTripSegmentLinks } from "@services/trip-service";
import { TRIP_INITIAL_STATE, SEGMENT_INITIAL_STATE } from "@contexts/TripCreator/initialValues";

interface TripCreatorContextType {
  trip: CreateTrip;
  route: CreateSegment;
  segments: CreateSegment[];
  editingIndex: number;
  isSegmentEmpty: boolean;
  isSegmentComplete: boolean;
  customWaypoints: Coordinates[];
  setCustomWaypoint: React.Dispatch<React.SetStateAction<Coordinates[]>>;
  setEditingIndex: React.Dispatch<React.SetStateAction<number>>;
  addSegment: (index?: number) => void;
  updateRoute: (updates: Partial<CreateSegment>) => void;
  updateTrip: (updates: Partial<CreateTrip>) => void;
  createRoute: (customWaypoints: Coordinates[]) => Promise<void>;
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

  const [editingIndex, setEditingIndex] = useState(-1);
  const [trip, setTrip] = useState<CreateTrip>(TRIP_INITIAL_STATE);
  const [route, setRoute] = useState<CreateSegment>(SEGMENT_INITIAL_STATE);
  const [segments, setSegments] = useState<CreateSegment[]>([]);
  const [customWaypoints, setCustomWaypoint] = useState<Coordinates[]>([]);

  const isSegmentEmpty = !segments.length;
  const isSegmentComplete = segments.some((segment) => segment.endLocation === trip.endLocation);

  // =================== Update Functions ===================

  const updateRoute = (updates: Partial<CreateSegment>) => {
    setRoute((prevRoute) => ({ ...prevRoute, ...updates }));
  };

  const updateTrip = (updates: Partial<CreateTrip>) => {
    setTrip((prevTrip) => ({ ...prevTrip, ...updates }));
  };

  const addSegment = () => {
    const segment = { ...route, contributorId: user.id };

    if (editingIndex === -1) {
      setSegments((prevSegments) => [...prevSegments, segment]);
    } else {
      setSegments((prev) => prev.map((s, i) => (i === editingIndex ? segment : s)));
      setEditingIndex(-1);
    }
  };

  const deleteSegment = () => {
    setSegments((prevSegments) => prevSegments.slice(0, -1));
  };

  const createRoute = async () => {
    const data = await getDirections(
      route.startCoords,
      customWaypoints,
      route.endCoords,
      route.segmentMode,
      true,
    );

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
    updateRoute({ waypoints, duration, distance, navigationSteps });
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
        editingIndex,
        isSegmentEmpty,
        isSegmentComplete,
        customWaypoints,
        setCustomWaypoint,
        setEditingIndex,
        addSegment,
        updateRoute,
        updateTrip,
        createRoute,
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
