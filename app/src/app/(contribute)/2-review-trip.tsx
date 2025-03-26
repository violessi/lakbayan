import { router } from "expo-router";
import React, { useRef } from "react";
import { SafeAreaView, View, Alert } from "react-native";
import Mapbox, { MapView, Camera, Images } from "@rnmapbox/maps";

import pin from "@assets/pin-purple.png";
import Header from "@components/ui/Header";
import TripTitle from "@components/contribute/TripTitle";
import PrimaryButton from "@components/ui/PrimaryButton";
import TripSummary from "@components/contribute/TripSummary";
import DirectionsLine from "@components/ui/DirectionsLine";
import SymbolMarker from "@components/map/SymbolMarker";

import { useTripCreator } from "@contexts/TripCreator/TripCreatorContext";
import { TRANSPORTATION_COLORS } from "@constants/transportation-color";
import { addTripToModeration } from "@services/moderation-service";
import { MAPBOX_ACCESS_TOKEN } from "@utils/mapbox-config";
import { assert } from "@utils/utils";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

// TODO: set initial camera to current location
const INITIAL_CENTER = [121.05, 14.63] as Coordinates;

export default function TripReview() {
  const cameraRef = useRef<Camera>(null);
  const { trip, segments, submitTrip } = useTripCreator();

  // transformation/calculations we need
  const segmentCoordinates = segments.map(({ waypoints }) => waypoints);
  const isSameEndLocation =
    segments.length > 0 && trip.endLocation === segments[segments.length - 1].endLocation;

  // When the map is loaded, fit the camera to the pins
  const handleMapLoaded = () => {
    if (cameraRef.current)
      cameraRef.current.fitBounds(trip.startCoords, trip.endCoords, [150, 150, 150, 150]);
  };

  const handleNavigateToRouteInput = () => {
    router.push("/(contribute)/3-add-transfer");
  };

  const handleSubmitTrip = async () => {
    try {
      const { tripData } = await submitTrip();
      await addTripToModeration(tripData[0].id);
      Alert.alert("Trip Submitted");
      router.replace("/(tabs)");
    } catch (error) {
      console.log("Error submitting trip", error);
      Alert.alert("Error submitting trip");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Trip Review" />

      <View className="flex justify-center items-center">
        <TripTitle startLocation={trip.startLocation} endLocation={trip.endLocation} />
      </View>

      <MapView
        style={{ flex: 1 }}
        styleURL="mapbox://styles/mapbox/streets-v12"
        projection="mercator"
        onDidFinishLoadingMap={handleMapLoaded}
      >
        {/* FIXME: initial camera center */}
        {/* TODO: add markers on transfer locations */}
        <Camera ref={cameraRef} centerCoordinate={INITIAL_CENTER} animationMode="easeTo" />
        <SymbolMarker
          id="start-location-c2"
          label={trip.startLocation}
          coordinates={trip.startCoords}
        />
        <SymbolMarker id="end-location-c2" label={trip.endLocation} coordinates={trip.endCoords} />
        <Images images={{ pin }} />

        {segmentCoordinates.map((coordinates, index) => (
          <DirectionsLine
            key={index}
            coordinates={coordinates}
            color={TRANSPORTATION_COLORS[index % TRANSPORTATION_COLORS.length]}
          />
        ))}
      </MapView>

      <View className="px-10 py-20 z-10">
        <PrimaryButton
          label={isSameEndLocation ? "Submit" : "Add Transfers"}
          onPress={isSameEndLocation ? handleSubmitTrip : handleNavigateToRouteInput}
        />
      </View>

      <TripSummary
        startLocation={trip.startLocation}
        endLocation={trip.endLocation}
        segments={segments}
      />
    </SafeAreaView>
  );
}
