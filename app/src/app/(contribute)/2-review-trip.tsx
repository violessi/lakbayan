import React, { useEffect } from "react";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView, View, Alert, BackHandler } from "react-native";

import Header from "@components/ui/Header";
import LineSource from "@components/map/LineSource";
import { MapShell } from "@components/map/MapShell";
import SymbolMarker from "@components/map/SymbolMarker";
import TripTitle from "@components/contribute/TripTitle";
import PrimaryButton from "@components/ui/PrimaryButton";
import { SourceDestinationTitle } from "@components/ui/SourceDestinationTitle";
import TripSummary from "@components/contribute/TripSummary";
import UnsavedChangesAlert from "@components/contribute/UnsavedChangesAlert";

import { useMapView } from "@hooks/use-map-view";
import { useTripCreator } from "@contexts/TripCreator";
import { useSession } from "@contexts/SessionContext";
import {
  insertSubmitLog,
  updateSubmitLog,
  fetchSubmitLogId,
  deleteSubmitLog,
} from "@services/logs-service";

export default function TripReview() {
  const { user } = useSession();
  const { cameraRef } = useMapView();
  const {
    trip,
    segments,
    isSegmentEmpty,
    isSegmentComplete,
    updateRoute,
    setEditingIndex,
    deleteSegment,
    clearTripData,
    clearRouteData,
    submitTrip,
  } = useTripCreator();
  if (!user) throw new Error("User must be logged in to create a trip!");

  const handleCreateSegment = async () => {
    clearRouteData();
    router.replace("/(contribute)/3-add-transfer");
  };

  const handleEditSegment = (index: number) => {
    setEditingIndex(index);
    updateRoute(segments[index]);
    router.replace("/(contribute)/4-edit-transfer");
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
      Alert.alert("Trip Submitted", "Your trip has been submitted successfully!");
      const id = await fetchSubmitLogId({ userId: user.id });
      if (!id) {
        console.error("No submit log ID found.");
        return;
      }

      await updateSubmitLog({ id, status: "completed" });
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Error", "Failed to submit your trip. Please try again.");
    }
  };

  // Clear data when navigating back to the first screen
  const handleBackNavigation = async () => {
    const id = await fetchSubmitLogId({ userId: user.id });

    if (!id) {
      console.error("No submit log ID found.");
      return;
    }

    if (!isSegmentEmpty) {
      await updateSubmitLog({ id, status: "cancelled" });
    } else {
      await deleteSubmitLog({ id });
    }

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
      <Header prevCallback={prevCallback} title="Trip Review" />

      <View className="flex justify-center items-center">
        <TripTitle startLocation={trip.startLocation} endLocation={trip.endLocation} />
      </View>

      <MapShell cameraRef={cameraRef} fitBounds={[trip.startCoords, trip.endCoords]}>
        <LineSource id="segments" data={segments} lineWidth={3} />
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
