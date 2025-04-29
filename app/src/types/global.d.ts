export {};

declare global {
  type APIError = {
    message: string;
    details: string;
  };

  type FilterState = {
    timeToLeave: Date;
    sortBy: string;
    transportModes: string[];
  };
}
