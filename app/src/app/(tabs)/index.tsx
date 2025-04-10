import lodash from "lodash";
import { useRef } from "react";
import { useRouter } from "expo-router";
import { Text, Image, View, SafeAreaView, Pressable } from "react-native";

import Header from "@components/ui/Header";
import { MapShell } from "@components/map/MapShell";
import SymbolSource, { type SymbolSourceRef } from "@components/map/SymbolSource";
import RecentTrips from "@components/search/RecentTrips";

import { useMapView } from "@hooks/use-map-view";
import { useLiveUpdates } from "@hooks/use-live-updates";

export default function Index() {
  const router = useRouter();
  const { userLocation } = useMapView();
  const { symbolRef, updateLiveStatus } = useLiveUpdates("box", 10);

  console.log("[RENDER] Rendering Page...");
  const handleTextInputFocus = () => {
    router.push("/(search)/1-search-trip");
  };

  const handleCameraChange = (state: MapBoxMapState) => {
    const newCoordinates = [
      state.properties.bounds.ne,
      state.properties.bounds.sw,
    ] as Coordinates[];
    updateLiveStatus(newCoordinates);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Hi, user!" hasBack={false} />
      <View>
        <Pressable
          onPress={handleTextInputFocus}
          className="absolute z-50 m-5 w-[90%] h-12 flex-row items-center bg-white rounded-lg px-4"
        >
          <Image
            source={require("../../assets/search.png")}
            style={{ width: 15, height: 15, marginRight: 10 }}
            resizeMode="contain"
          />
          <Text style={{ fontSize: 12, color: "#888" }}>Where are we off to today?</Text>
        </Pressable>
      </View>
      <MapShell center={userLocation} handleCameraChange={handleCameraChange}>
        <SymbolSource ref={symbolRef} id={"live-update"} />
      </MapShell>
      <RecentTrips />
    </SafeAreaView>
  );
}
