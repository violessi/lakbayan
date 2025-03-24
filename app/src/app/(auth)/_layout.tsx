import { Stack, Redirect } from "expo-router";
import { useSession } from "@contexts/SessionContext";

export default function AuthLayout() {
  const { user } = useSession();
  if (user) return <Redirect href="/(tabs)" />;

  return (
    <Stack>
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="log-in" options={{ headerShown: false }} />
    </Stack>
  );
}
