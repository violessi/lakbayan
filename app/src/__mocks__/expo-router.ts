export const useRouter = jest.fn();

export const useLocalSearchParams = jest.fn(() => ({
  tripId: "123",
  is_gps_verified: "true",
}));
