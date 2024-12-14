export interface Suggestion {
  id: string;
  place_name: string;
  geometry: {
    coordinates: [number, number];
  };
}

export interface Coordinates {
  lat: number;
  long: number;
}
