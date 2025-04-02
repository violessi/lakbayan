import { router } from "expo-router";
import { SafeAreaView, View, Alert } from "react-native";

import Header from "@components/ui/Header";
import { MapShell } from "@components/map/MapShell";
import CircleMarker from "@components/map/CircleMarker";
import SymbolMarker from "@components/map/SymbolMarker";
import PrimaryButton from "@components/ui/PrimaryButton";
import DirectionLines from "@components/map/DirectionLines";
import StartEndSearchBar from "@components/StartEndSearchBar";

import { useMapView } from "@hooks/use-map-view";
import { reverseGeocode } from "@services/mapbox-service";
import { useTripCreator } from "@contexts/TripCreator/TripCreatorContext";

export default function RouteSelectInfo() {
  const { cameraRef, handleMapPress } = useMapView();
  const { trip, segments, route, updateRoute, clearRouteData } = useTripCreator();
  const segmentCoordinates = segments.map(({ waypoints }) => waypoints);

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

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Route Information" prevCallback={prevCallback} />

      <View>
        <StartEndSearchBar
          isStartActive={false}
          defaultStart={route.startLocation}
          defaultEnd={route.endLocation}
          onEndChange={(l, c) => handleEndChange(c, l)}
        />
      </View>

      <MapShell
        cameraRef={cameraRef}
        fitBounds={[route.startCoords, trip.endCoords]}
        handleMapPress={(feature) => handleMapPress(feature, handleEndChange)}
      >
        <DirectionLines coordinates={segmentCoordinates} />
        <SymbolMarker
          id="trip-start-location"
          coordinates={trip.startCoords}
          label={trip.startLocation}
        />
        <SymbolMarker
          id="trip-end-location"
          coordinates={trip.endCoords}
          label={trip.endLocation}
        />
        <CircleMarker
          id="route-end-location"
          coordinates={route.endCoords}
          label={route.endLocation}
        />
      </MapShell>

      <View className="absolute bottom-0 z-50 flex flex-row gap-2 p-5 w-full justify-center">
        <PrimaryButton label="Final Location" onPress={handleFinalTransfer} />
        <PrimaryButton label="Add Transfer" onPress={handleAddTransfer} />
      </View>
    </SafeAreaView>
  );
}
