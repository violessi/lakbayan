import { Stack } from "expo-router";

export default function JournalLayout() {
  return (
    <Stack>
      <Stack.Screen name="transit-journal" options={{ headerShown: false }} />
      <Stack.Screen name="journal-review" options={{ headerShown: false }} />
    </Stack>
  );
}
