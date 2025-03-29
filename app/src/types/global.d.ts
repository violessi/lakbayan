export {};

declare global {
  type APIError = {
    message: string;
    details: string;
  };
}
