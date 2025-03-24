import { Stack, Redirect } from "expo-router";
import { useSession } from "@contexts/SessionContext";

export default function JournalLayout() {
  const { user } = useSession();
  if (!user) return <Redirect href="/(auth)/log-in" />;

  return (
    <Stack>
      <Stack.Screen name="transit-journal" options={{ headerShown: false }} />
      <Stack.Screen name="journal-review" options={{ headerShown: false }} />
    </Stack>
  );
}
