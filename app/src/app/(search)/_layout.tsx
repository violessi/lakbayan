import { Stack, Redirect } from "expo-router";
import { useSession } from "@contexts/SessionContext";

export default function ContributeLayout() {
  const { user } = useSession();
  if (!user) return <Redirect href="/(auth)/log-in" />;

  return (
    <Stack>
      <Stack.Screen name="location-input" options={{ headerShown: false }} />
      <Stack.Screen name="suggested-trips" options={{ headerShown: false }} />
      <Stack.Screen name="trip-overview" options={{ headerShown: false }} />
      <Stack.Screen name="comments-list" options={{ headerShown: false }} />
    </Stack>
  );
}
