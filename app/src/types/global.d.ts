export {};

declare global {
  type APIError = {
    message: string;
    details: string;
  };

  type FilterState = {
    sortBy: string;
    transportModes: string[];
  };
}
