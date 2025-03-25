import { Stack, Redirect } from "expo-router";
import { CreateTripProvider } from "@contexts/CreateTripContext";
import { useSession } from "@contexts/SessionContext";

export default function ContributeLayout() {
  const { user } = useSession();
  if (!user) return <Redirect href="/(auth)/log-in" />;

  return (
    <CreateTripProvider>
      <Stack>
        <Stack.Screen name="custom-trip" options={{ headerShown: false }} />
        <Stack.Screen name="toda-stops" options={{ headerShown: false }} />
        <Stack.Screen name="trip-review" options={{ headerShown: false }} />
        <Stack.Screen name="route-select-info" options={{ headerShown: false }} />
        <Stack.Screen name="route-input" options={{ headerShown: false }} />
        {/* FIXME: temporary location */}
        <Stack.Screen name="jeepney-routes" options={{ headerShown: false }} />
      </Stack>
    </CreateTripProvider>
  );
}
