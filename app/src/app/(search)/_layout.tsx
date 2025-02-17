import { Stack } from "expo-router";

export default function ContributeLayout() {
  return (
    <Stack>
      <Stack.Screen name="location-input" options={{ headerShown: false }} />
      <Stack.Screen name="suggested-trips" options={{ headerShown: false }} />
      <Stack.Screen name="trip-overview" options={{ headerShown: false }} />
    </Stack>
  );
}
