import React, { createContext, useState, ReactNode } from "react";

interface TripContextType {
  trip: Trip;
  addRoute: (route: Route) => void;
  setStartEndLocations: (
    startLocation: string,
    startCoordinates: Coordinates,
    endLocation: string,
    endCoordinates: Coordinates,
  ) => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

interface TripProviderProps {
  children: ReactNode;
}

export const TripProvider = ({ children }: TripProviderProps) => {
  const [trip, setTrip] = useState<Trip>({
    routes: [],
    startLocation: "",
    startCoordinates: [0, 0],
    endLocation: "",
    endCoordinates: [0, 0],
  });

  const addRoute = (route: Route) => {
    setTrip((prevTrip) => ({
      ...prevTrip,
      routes: [...prevTrip.routes, route],
    }));
  };

  const setStartEndLocations = (
    startLocation: string,
    startCoordinates: Coordinates,
    endLocation: string,
    endCoordinates: Coordinates,
  ) => {
    setTrip((prevTrip) => ({
      ...prevTrip,
      startLocation,
      startCoordinates,
      endLocation,
      endCoordinates,
    }));
  };

  return <TripContext.Provider value={{ trip, addRoute, setStartEndLocations }}>{children}</TripContext.Provider>;
};

export const useTrip = (): TripContextType => {
  const context = React.useContext(TripContext);
  if (!context) {
    throw new Error("useTrip must be used within a TripProvider");
  }
  return context;
};
