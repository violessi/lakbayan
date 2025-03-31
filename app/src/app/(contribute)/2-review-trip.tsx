import { router } from "expo-router";
import React, { useRef, useCallback } from "react";
import { SafeAreaView, View, Alert, BackHandler } from "react-native";
import Mapbox, { MapView, Camera, Images } from "@rnmapbox/maps";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { usePreventRemove, useFocusEffect } from "@react-navigation/native";

import Header from "@components/ui/Header";
import TripTitle from "@components/contribute/TripTitle";
import PrimaryButton from "@components/ui/PrimaryButton";
import TripSummary from "@components/contribute/TripSummary";
import DirectionsLine from "@components/ui/DirectionsLine";
import SymbolMarker from "@components/map/SymbolMarker";

import pin from "@assets/pin-purple.png";
import { MAPBOX_ACCESS_TOKEN } from "@utils/mapbox-config";
import { addTripToModeration } from "@services/moderation-service";
import { TRANSPORTATION_COLORS } from "@constants/transportation-color";
import { useTripCreator } from "@contexts/TripCreator/TripCreatorContext";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

// TODO: set initial camera to current location
const INITIAL_CENTER = [121.05, 14.63] as Coordinates;

export default function TripReview() {
  const cameraRef = useRef<Camera>(null);
  const navigation = useNavigation();
  const { trip, segments, submitTrip, getSegment, updateRoute, setInEditMode, emptyTrip } = useTripCreator();

  const hasAddedSegment = segments.length > 0;

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
      const { tripId } = await submitTrip();
      await addTripToModeration(tripId);
      Alert.alert("Trip Submitted");
      router.replace("/(tabs)");
    } catch (error) {
      console.log("Error submitting trip", error);
      Alert.alert("Error submitting trip");
    }
  };

  const handleEditSegment = (index: number) => {
    setInEditMode(true);
    const segment = getSegment(index);
    updateRoute(segment);
    // navigate to the edit transfer page
    router.push({
      pathname: "/(contribute)/4-edit-transfer",
      params: { index },
    });
    console.log("Editing segment:", segment);
  };

  // back navigation
  usePreventRemove(hasAddedSegment, ({ data }) => {
    if (hasAddedSegment) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. If you leave now, your progress will be lost. Do you want to continue?',
        [
          {
            text: 'Leave Anyway',
            style: 'destructive',
            onPress: () => {
              navigation.dispatch(data.action);

            },
          },
          {
            text: 'Stay',
            style: 'cancel',
            onPress: () => {},
          },
        ]
      );
    } else {
      navigation.dispatch(data.action);
    }
  });

  

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

      <View className="p-5 z-10">
        <PrimaryButton
          label={isSameEndLocation ? "Submit" : "Add Transfers"}
          onPress={isSameEndLocation ? handleSubmitTrip : handleNavigateToRouteInput}
        />
      </View>

      <TripSummary
        startLocation={trip.startLocation}
        endLocation={trip.endLocation}
        segments={segments}
        onSegmentPress={handleEditSegment}
      />
    </SafeAreaView>
  );
}
