import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { useTheme } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

import "@utils/global.css";
import { SessionProvider } from "../contexts/SessionContext";
import { TransitJournalProvider } from "@contexts/TransitJournalContext";
import { LocationProvider } from "@contexts/LocationContext";

export default function RootLayout() {
  const { colors } = useTheme();
  colors.background = "transparent";

  return (
    <SessionProvider>
      <LocationProvider>
        <TransitJournalProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <BottomSheetModalProvider>
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
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </TransitJournalProvider>
      </LocationProvider>
    </SessionProvider>
  );
}
