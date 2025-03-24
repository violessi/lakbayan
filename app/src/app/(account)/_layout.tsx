import { Stack, Redirect } from "expo-router";
import { useSession } from "@contexts/SessionContext";

export default function AccountLayout() {
  const { user } = useSession();
  if (!user) return <Redirect href="/(auth)/log-in" />;

  return (
    <Stack>
      <Stack.Screen name="account-settings" options={{ headerShown: false }} />
      <Stack.Screen name="bookmarked-trips" options={{ headerShown: false }} />
      <Stack.Screen name="submitted-trips" options={{ headerShown: false }} />
    </Stack>
  );
}
