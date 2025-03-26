import { Stack, Redirect } from "expo-router";
import { TripCreatorProvider } from "@contexts/TripCreator/TripCreatorContext";
import { useSession } from "@contexts/SessionContext";

export default function ContributeLayout() {
  const { user } = useSession();
  if (!user) return <Redirect href="/(auth)/log-in" />;

  return (
    <TripCreatorProvider>
      <Stack>
        <Stack.Screen name="1-create-trip" options={{ headerShown: false }} />
        <Stack.Screen name="2-review-trip" options={{ headerShown: false }} />
        <Stack.Screen name="3-add-transfer" options={{ headerShown: false }} />
        <Stack.Screen name="4-edit-transfer" options={{ headerShown: false }} />
        {/* FIXME: temporary location */}
        <Stack.Screen name="jeepney-routes" options={{ headerShown: false }} />
        <Stack.Screen name="toda-stop" options={{ headerShown: false }} />
      </Stack>
    </TripCreatorProvider>
  );
}
