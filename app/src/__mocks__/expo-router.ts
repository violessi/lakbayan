export const useRouter = jest.fn(() => ({
  push: jest.fn(),
  replace: jest.fn(),
}));

export const useLocalSearchParams = jest.fn();
export const useFocusEffect = jest.fn();
