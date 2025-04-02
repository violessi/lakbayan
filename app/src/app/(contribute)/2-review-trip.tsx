import React from "react";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView, View, Alert, BackHandler } from "react-native";

import Header from "@components/ui/Header";
import { MapShell } from "@components/map/MapShell";
import SymbolMarker from "@components/map/SymbolMarker";
import TripTitle from "@components/contribute/TripTitle";
import PrimaryButton from "@components/ui/PrimaryButton";
import DirectionLines from "@components/map/DirectionLines";
import TripSummary from "@components/contribute/TripSummary";
import UnsavedChangesAlert from "@components/contribute/UnsavedChangesAlert";

import { useMapView } from "@hooks/use-map-view";
import { useTripCreator } from "@contexts/TripCreator/TripCreatorContext";

export default function TripReview() {
  const { cameraRef } = useMapView();
  const { updateRoute, setInEditMode, deleteSegment } = useTripCreator();
  const { clearTripData, clearRouteData, submitTrip } = useTripCreator();
  const { trip, segments, isSegmentEmpty, isSegmentComplete } = useTripCreator();

  const segmentCoordinates = segments.map(({ waypoints }) => waypoints);

  const handleCreateSegment = () => {
    clearRouteData();
    router.replace("/(contribute)/3-add-transfer");
  };

  const handleEditSegment = (index: number) => {
    setInEditMode(true);
    updateRoute(segments[index]);
    router.replace({
      pathname: "/(contribute)/4-edit-transfer",
      params: { index },
    });
  };

  const handleDeleteSegment = () => {
    Alert.alert("Undo", "Do you want to remove the last transfer you added?", [
      { text: "Yes", style: "destructive", onPress: () => deleteSegment() },
      { text: "No", style: "cancel" },
    ]);
  };

  const handleSubmitTrip = async () => {
    try {
      await submitTrip();
      Alert.alert("Trip Submitted");
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Error submitting trip");
    }
  };

  // Clear data when navigating back to the first screen
  const handleBackNavigation = () => {
    clearTripData();
    router.replace("/(contribute)/1-create-trip");
  };

  // Handle back navigation from the header
  const prevCallback = () => {
    if (isSegmentEmpty) handleBackNavigation();
    else UnsavedChangesAlert(handleBackNavigation);
  };

  // Handle android native back button
  useFocusEffect(() => {
    const backAction = () => {
      if (isSegmentEmpty) handleBackNavigation();
      else UnsavedChangesAlert(handleBackNavigation);
      return true;
    };
    const action = "hardwareBackPress";
    const backHandler = BackHandler.addEventListener(action, backAction);
    return () => backHandler.remove();
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Trip Review" prevCallback={prevCallback} />

      <View className="flex justify-center items-center">
        <TripTitle startLocation={trip.startLocation} endLocation={trip.endLocation} />
      </View>

      <MapShell cameraRef={cameraRef} fitBounds={[trip.startCoords, trip.endCoords]}>
        <DirectionLines coordinates={segmentCoordinates} />
        <SymbolMarker id="start-loc" label={trip.startLocation} coordinates={trip.startCoords} />
        <SymbolMarker id="end-loc" label={trip.endLocation} coordinates={trip.endCoords} />
      </MapShell>

      <TripSummary
        segments={segments}
        editSegment={handleEditSegment}
        deleteSegment={handleDeleteSegment}
      />

      <View className="absolute bottom-0 z-50 p-5 w-full justify-center">
        <PrimaryButton
          label={isSegmentComplete ? "Submit" : "Add Transfers"}
          onPress={isSegmentComplete ? handleSubmitTrip : handleCreateSegment}
        />
      </View>
    </SafeAreaView>
  );
}
