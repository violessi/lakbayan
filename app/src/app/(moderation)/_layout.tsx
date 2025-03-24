import { Stack } from "expo-router";

export default function ModerationLayout() {
  return (
    <Stack>
      <Stack.Screen name="moderate-trips-list" options={{ headerShown: false }} />
      <Stack.Screen name="moderate-trip-review" options={{ headerShown: false }} />
    </Stack>
  );
}
