import { useFocusEffect, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Alert, BackHandler, SafeAreaView, Text, View } from "react-native";

import Header from "@components/ui/Header";
import NotFound from "@components/journal/NotFound";
import AbortModal from "@components/journal/AbortModal";
import PrimaryButton from "@components/ui/PrimaryButton";
import TransferModal from "@components/journal/TransferModal";
import CompleteModal from "@components/journal/CompleteModal";
import ReportLiveUpdates from "@components/journal/ReportLiveUpdates";
import JournalInstructions from "@components/journal/JournalInstructions";

import { MapShell } from "@components/map/MapShell";
import LineSource from "@components/map/LineSource";
import SymbolSource from "@components/map/SymbolSource";
import CircleSource from "@components/map/CircleSource";

import { isNearLocation } from "@utils/map-utils";
import { useSession } from "@contexts/SessionContext";
import { useLiveUpdates } from "@hooks/use-live-updates";
import { useUserLocation } from "@contexts/LocationContext";
import { useTransitJournal } from "@contexts/TransitJournalContext";
import { updateTransitJournal, updateProfile } from "@services/trip-service";

export default function TransitJournal() {
  const router = useRouter();
  const { user } = useSession();
  const { userLocation } = useUserLocation();
  const { symbolRef, updateLiveStatus } = useLiveUpdates("line", 5);
  const {
    cameraRef,
    lineRef,
    circleRef,
    segments,
    loadingSegments,
    currentStep,
    transitJournal,
    activeSegments,
    showTripAbortModal,
    showNextSegmentModal,
    showTripFinishedModal,
    setShowTripAbortModal,
    setShowNextSegmentModal,
    setShowTripFinishedModal,
    handleUserLocationUpdate,
    followUser,
    setFollowUser,
  } = useTransitJournal();

  // complete transit and redirect to review page
  const handleNavigateToReview = () => {
    setShowTripFinishedModal(false);
    router.push("/(journal)/journal-review");
  };

  const handleCameraChange = (state: MapBoxMapState) => {
    if (state.gestures.isGestureActive) {
      setFollowUser(false);
    }
  };

  // abort transit and redirect to home page
  const handleAbortTrip = async () => {
    setShowTripAbortModal(true);
    try {
      const journalPayload: Partial<TransitJournal> = {
        id: transitJournal.id,
        status: "cancelled",
      };
      await updateTransitJournal(journalPayload);
      await updateProfile({ id: user!.id, transitJournalId: null });
      setShowTripAbortModal(false);
      router.replace("/(tabs)");
      Alert.alert("Transit Ended", "Your transit journal has been Cancelled!", [{ text: "OK" }]);
    } catch (error) {
      Alert.alert("Error", "Failed to abort your transit journal. Please try again.");
    }
  };

  // Allow early completion if the user is within 500m of the destination
  const handleCompleteTrip = () => {
    if (!segments || !userLocation) return;
    const destination = segments[segments.length - 1].endCoords;
    const isCompleted = isNearLocation(userLocation, destination, 500);
    if (isCompleted) setShowTripFinishedModal(true);
    else setShowTripAbortModal(true);
  };

  // Fetch live updates on segments
  useEffect(() => {
    if (!segments) return;
    updateLiveStatus(segments.flatMap(({ waypoints }) => waypoints));
  }, [segments]);

  // navigation

  const prevCallback = () => {
    Alert.alert("Do you wish to go back to the homepage?", "Your progress will be saved.", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        onPress: () => {
          router.replace("/(tabs)");
        },
      },
    ]);
  };

  useFocusEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      prevCallback();
      return true;
    });
    return () => backHandler.remove();
  });

  if (loadingSegments)
    return (
      <View className="flex-1 justify-center items-center bg-black/50 z-50">
        <ActivityIndicator size="large" color="#fff" />
        <Text className="text-white">Loading trip...</Text>
      </View>
    );

  // if still no segments after loading segments, show not found
  if (!segments || segments.length === 0) return <NotFound />;

  return (
    <SafeAreaView className="flex-1">
      <Header title="Transit Journal" prevCallback={prevCallback} />
      <JournalInstructions currentStep={currentStep} currentSegment={activeSegments[0]} />
      <MapShell
        cameraRef={cameraRef}
        handleUserLocation={handleUserLocationUpdate}
        handleCameraChange={handleCameraChange}
        userLocationProps={{ animated: false }}
      >
        <CircleSource id={"transfer-points"} data={segments} ref={circleRef} />
        <LineSource id={"direction-line"} data={segments} ref={lineRef} />
        <SymbolSource id={"live-update"} ref={symbolRef} />
      </MapShell>

      {!followUser && (
        <PrimaryButton
          className="absolute bottom-64 right-6"
          label="Follow User"
          onPress={() => setFollowUser(true)}
        />
      )}

      <PrimaryButton
        className="absolute bottom-48 right-6"
        label="Done"
        onPress={handleCompleteTrip}
      />

      <ReportLiveUpdates />

      <View>
        <TransferModal
          isVisible={showNextSegmentModal}
          currentSegment={activeSegments[0]}
          callback={() => setShowNextSegmentModal(false)}
        />
        <CompleteModal
          isVisible={showTripFinishedModal}
          nextCallback={handleNavigateToReview}
          cancelCallback={() => setShowTripFinishedModal(false)}
        />
        <AbortModal
          isVisible={showTripAbortModal}
          nextCallback={handleAbortTrip}
          cancelCallback={() => setShowTripAbortModal(false)}
        />
      </View>
    </SafeAreaView>
  );
}
