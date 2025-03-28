import { Stack, Redirect } from "expo-router";
import { useSession } from "@contexts/SessionContext";

export default function SocialLayout() {
  const { user } = useSession();
  if (!user) return <Redirect href="/(auth)/log-in" />;

  return (
    <Stack>
      <Stack.Screen name="comments-list" options={{ headerShown: false }} />
      <Stack.Screen name="contributor-account" options={{ headerShown: false }} />
    </Stack>
  );
}
