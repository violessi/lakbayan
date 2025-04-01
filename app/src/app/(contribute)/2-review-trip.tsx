import { router } from "expo-router";
import React, { useRef } from "react";
import { SafeAreaView, View, Alert } from "react-native";
import Mapbox, { MapView, Camera, Images } from "@rnmapbox/maps";

import Header from "@components/ui/Header";
import SymbolMarker from "@components/map/SymbolMarker";
import TripTitle from "@components/contribute/TripTitle";
import PrimaryButton from "@components/ui/PrimaryButton";
import DirectionsLine from "@components/ui/DirectionsLine";
import TripSummary from "@components/contribute/TripSummary";

import pin from "@assets/pin-purple.png";
import { MAPBOX_ACCESS_TOKEN } from "@utils/mapbox-config";
import { addToPendingModeratorReview } from "@services/moderation-service";
import { TRANSPORTATION_COLORS } from "@constants/transportation-color";
import { useTripCreator } from "@contexts/TripCreator/TripCreatorContext";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

// TODO: set initial camera to current location
const INITIAL_CENTER = [121.05, 14.63] as Coordinates;

export default function TripReview() {
  const cameraRef = useRef<Camera>(null);
  const { trip, segments, submitTrip, updateRoute, setInEditMode, clearTripData } =
  const { trip, segments, clearRouteData, submitTrip, updateRoute, setInEditMode, clearTripData } =
    useTripCreator();

  // transformation/calculations we need
  const len = segments.length;
  const segmentCoordinates = segments.map(({ waypoints }) => waypoints);
  const isSameEndLocation = len > 0 && trip.endLocation === segments[len - 1].endLocation;

  // When the map is loaded, fit the camera to the pins
  const handleMapLoaded = () => {
    if (cameraRef.current) {
      const frame = [150, 150, 150, 150];
      cameraRef.current.fitBounds(trip.startCoords, trip.endCoords, frame);
    }
  };

  const handleSubmitTrip = async () => {
    try {
      const { tripId } = await submitTrip();
      await addToPendingModeratorReview(tripId, "trip");
      Alert.alert("Trip Submitted");
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error submitting trip", error);
      Alert.alert("Error submitting trip");
    }
  };

  const handleCreateSegment = () => {
    clearRouteData()
    return router.replace("/(contribute)/3-add-transfer");
  };

  const handleEditSegment = (index: number) => {
    setInEditMode(true);
    updateRoute(segments[index]);
    router.replace({
      pathname: "/(contribute)/4-edit-transfer",
      params: { index },
    });
  };

  const prevCallback = () => {
    const hasEmptySegments = segments.length === 0;

    if (hasEmptySegments) {
      clearTripData();
      router.replace("/(contribute)/1-create-trip");
    } else {
      Alert.alert(
        "Unsaved Changes",
        "You have unsaved changes. If you leave now, your progress will be lost. Do you want to continue?",
        [
          {
            text: "Leave Anyway",
            style: "destructive",
            onPress: () => {
              clearTripData();
              router.replace("/(contribute)/1-create-trip");
            },
          },
          { text: "Stay", style: "cancel" },
        ],
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Trip Review" prevCallback={prevCallback} />

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
          onPress={isSameEndLocation ? handleSubmitTrip : handleCreateSegment}
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

// back navigation for android
// usePreventRemove(hasAddedSegment, ({ data }) => {
//   if (hasAddedSegment) {
//     Alert.alert(
//       "Unsaved Changes",
//       "You have unsaved changes. If you leave now, your progress will be lost. Do you want to continue?",
//       [
//         {
//           text: "Leave Anyway",
//           style: "destructive",
//           onPress: () => {
//             clearTripData();
//             navigation.dispatch(data.action);
//           },
//         },
//         {
//           text: "Stay",
//           style: "cancel",
//           onPress: () => {},
//         },
//       ],
//     );
//   } else {
//     navigation.dispatch(data.action);
//   }
// });
