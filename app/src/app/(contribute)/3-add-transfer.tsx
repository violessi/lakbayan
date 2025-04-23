import { router } from "expo-router";
import { SafeAreaView, View, Alert, BackHandler } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import Header from "@components/ui/Header";
import { MapShell } from "@components/map/MapShell";
import LineSource from "@components/map/LineSource";
import SymbolMarker from "@components/map/SymbolMarker";
import PrimaryButton from "@components/ui/PrimaryButton";
import StartEndSearchBar from "@components/StartEndSearchBar";

import { useMapView } from "@hooks/use-map-view";
import { reverseGeocode } from "@services/mapbox-service";
import { useTripCreator } from "@contexts/TripCreator";
import PrimaryButtonOutline from "@components/ui/PrimaryButtonOutline";

export default function RouteSelectInfo() {
  const { cameraRef, handleMapPress } = useMapView();
  const { trip, segments, route, updateRoute, clearRouteData } = useTripCreator();

  // when user updates the end location
  const handleEndChange = async (endCoords: Coordinates, endLocation?: string) => {
    endLocation = endLocation ?? ((await reverseGeocode(endCoords)) as string);
    updateRoute({ endLocation, endCoords });
    cameraRef.current?.moveTo(endCoords, 1000);
  };

  // Once we have all necessary information, navigate to the next screen.
  const handleAddTransfer = () => {
    if (!route.endLocation || !route.endCoords) {
      Alert.alert("Missing Information", "Please fill in all fields to proceed.");
    } else {
      router.replace("/(contribute)/4-edit-transfer");
    }
  };

  // Prefill the final segment with the trip's end location
  const handleFinalTransfer = () => {
    updateRoute({ endLocation: trip.endLocation, endCoords: trip.endCoords });
    router.replace("/(contribute)/4-edit-transfer");
  };

  // Navigate back to the previous screen.
  const prevCallback = () => {
    clearRouteData();
    router.replace("/(contribute)/2-review-trip");
  };

  useFocusEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      prevCallback();
      return true;
    });
    return () => backHandler.remove();
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header prevCallback={prevCallback} title="Route Information" />
      <StartEndSearchBar
        isStartActive={false}
        start={[route.startLocation, route.endCoords]}
        end={[route.endLocation, route.endCoords]}
        onEndChange={(l, c) => handleEndChange(c, l)}
      />
      <MapShell
        cameraRef={cameraRef}
        fitBounds={[route.startCoords, trip.endCoords]}
        handleMapPress={(feature) => handleMapPress(feature, handleEndChange)}
      >
        <LineSource id="segments" data={segments} lineWidth={3} />
        <SymbolMarker id="start-loc" coordinates={trip.startCoords} label="Start" />
        <SymbolMarker id="end-loc" coordinates={trip.endCoords} label="Destination" />
        <SymbolMarker id="next-loc" coordinates={route.endCoords} label="Next Transfer" />
      </MapShell>

      <View className="absolute bottom-0 z-50 flex flex-row gap-2 p-5 w-full justify-center">
        <PrimaryButtonOutline onPress={handleFinalTransfer}>Final Location</PrimaryButtonOutline>
        <PrimaryButton label="Add Transfer" onPress={handleAddTransfer} />
      </View>
    </SafeAreaView>
  );
}
