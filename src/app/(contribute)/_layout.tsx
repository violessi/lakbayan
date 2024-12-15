import { Stack } from "expo-router";
import { TripProvider } from "@contexts/TripContext";

export default function ContributeLayout() {
  return (
    <TripProvider>
      <Stack>
        <Stack.Screen name="custom-trip" options={{ headerShown: false }} />
        <Stack.Screen name="toda-stops" options={{ headerShown: false }} />
        <Stack.Screen name="trip-review" options={{ headerShown: false }} />
        <Stack.Screen name="route-select-info" options={{ headerShown: false }} />
        <Stack.Screen name="route-input" options={{ headerShown: false }} />
        {/* FIXME: temporary location */}
        <Stack.Screen name="jeepney-routes" options={{ headerShown: false }} />
      </Stack>
    </TripProvider>
  );
}
