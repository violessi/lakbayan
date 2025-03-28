import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { useTheme } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import "@utils/global.css";
import { SessionProvider } from "../contexts/SessionContext";

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
            <Stack.Screen name="(contribute)" options={{ headerShown: false }} />
            <Stack.Screen name="(search)" options={{ headerShown: false }} />
            <Stack.Screen name="(journal)" options={{ headerShown: false }} />
            <Stack.Screen name="(account)" options={{ headerShown: false }} />
            <Stack.Screen name="(moderation)" options={{ headerShown: false }} />
            <Stack.Screen name="(social)" options={{ headerShown: false }} />
          </Stack>
        </PaperProvider>
      </GestureHandlerRootView>
    </SessionProvider>
  );
}
