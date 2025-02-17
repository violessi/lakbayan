import React, { createContext, useState, ReactNode } from "react";


interface TripContextType {
  trip: Trip;
  segments: Segment[];
  addSegment: (segment: Segment) => void;
  setStartEndLocations: (
    start_location: string,
    start_coords: Coordinates,
    end_location: string,
    end_coords: Coordinates,
  ) => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

interface TripProviderProps {
  children: ReactNode;
}

export const TripProvider = ({ children }: TripProviderProps) => {
  // Initialize the Trip state with all required fields.
  const [trip, setTrip] = useState<Trip>({
    id: "",
    contributor_id: "",
    name: "",
    gps_verified: 0,
    mod_verified: 0,
    start_location: "",
    start_coords: [0, 0],
    end_location: "",
    end_coords: [0, 0],
    duration: 0,
    cost: 0,
  });

  const [segments, setSegments] = useState<Segment[]>([]);

  const addSegment = (segment: Segment) => {
    setSegments((prevSegments) => [...prevSegments, segment]);
  };

  const setStartEndLocations = (
    start_location: string,
    start_coords: Coordinates,
    end_location: string,
    end_coords: Coordinates,
  ) => {
    setTrip((prevTrip) => ({
      ...prevTrip,
      start_location,
      start_coords,
      end_location,
      end_coords,
    }));
  };

  return (
    <TripContext.Provider
      value={{ trip, segments, addSegment, setStartEndLocations }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = (): TripContextType => {
  const context = React.useContext(TripContext);
  if (!context) {
    throw new Error("useTrip must be used within a TripProvider");
  }
  return context;
};
