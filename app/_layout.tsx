import { Stack } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { SessionProvider } from "../context/SessionContext";

import { PaperProvider } from "react-native-paper";
import "../utils/global.css";

export default function RootLayout() {
  const { colors } = useTheme();
  colors.background = "transparent";

  return (
    <SessionProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PaperProvider>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="(contribute)"
              options={{ headerShown: false }}
            />
          </Stack>
        </PaperProvider>
      </GestureHandlerRootView>
    </SessionProvider>
  );
}
