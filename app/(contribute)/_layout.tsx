import { Stack } from "expo-router";

export default function ContributeLayout() {
  return (
    <Stack>
      <Stack.Screen name="custom-trip" options={{ headerShown: false }} />
      <Stack.Screen name="toda-stops" options={{ headerShown: false }} />
      <Stack.Screen name="trip-review" options={{ headerShown: false }} />
      <Stack.Screen name="route-select-info" options={{ headerShown: false }} />
      <Stack.Screen name="route-input" options={{ headerShown: false }} />
    </Stack>
  );
}
