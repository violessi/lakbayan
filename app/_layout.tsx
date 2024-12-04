import { Stack } from "expo-router";

import { SessionProvider } from "../context/SessionContext";

import { PaperProvider } from "react-native-paper";
import "../utils/global.css";

export default function RootLayout() {
  return (
    <SessionProvider>
      <PaperProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(contribute)" options={{ headerShown: false }} />
        </Stack>
      </PaperProvider>
    </SessionProvider>
  );
}
