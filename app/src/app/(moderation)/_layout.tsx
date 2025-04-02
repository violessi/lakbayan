import { Stack, Redirect } from "expo-router";
import { useSession } from "@contexts/SessionContext";

export default function ModerationLayout() {
  const { user } = useSession();
  if (!user) return <Redirect href="/(auth)/log-in" />;

  return (
    <Stack>
      <Stack.Screen name="moderate-trips-list" options={{ headerShown: false }} />
      <Stack.Screen name="moderate-trip-review" options={{ headerShown: false }} />
      <Stack.Screen name="moderate-todas-list-review" options={{ headerShown: false }} />
    </Stack>
  );
}
