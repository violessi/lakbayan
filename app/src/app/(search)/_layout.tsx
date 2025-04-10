import { Stack, Redirect } from "expo-router";
import { useSession } from "@contexts/SessionContext";
import { TripSearchProvider } from "@contexts/TripSearchContext";

export default function ContributeLayout() {
  const { user } = useSession();
  if (!user) return <Redirect href="/(auth)/log-in" />;

  return (
    <TripSearchProvider>
      <Stack>
        <Stack.Screen name="1-search-trip" options={{ headerShown: false }} />
        <Stack.Screen name="2-trip-suggestions" options={{ headerShown: false }} />
        <Stack.Screen name="3-trip-overview" options={{ headerShown: false }} />
      </Stack>
    </TripSearchProvider>
  );
}
