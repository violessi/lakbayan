import { Stack, Redirect } from "expo-router";
import { TripProvider } from "@contexts/TripContext";
import { useSession } from "@contexts/SessionContext";

export default function ContributeLayout() {
  const { user } = useSession();
  if (!user) return <Redirect href="/(auth)/log-in" />;
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
