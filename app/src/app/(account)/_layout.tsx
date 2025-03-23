import { Stack } from "expo-router";

export default function AccountLayout() {
  return (
    <Stack>
      <Stack.Screen name="account-settings" options={{ headerShown: false }} />
      <Stack.Screen name="bookmarked-trips" options={{ headerShown: false }} />
      <Stack.Screen name="submitted-trips" options={{ headerShown: false }} />
    </Stack>
  );
}
