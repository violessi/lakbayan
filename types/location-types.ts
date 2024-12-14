export interface Suggestion {
  id: string;
  place_name: string;
  geometry: {
    coordinates: [number, number];
  };
}

export type Coordinates = [number, number];
