import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Alert, SafeAreaView, View } from "react-native";

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
import { useTransitJournal } from "@contexts/TransitJournal";
import { updateTransitJournal, updateProfile } from "@services/trip-service";

export default function TransitJournal() {
  const router = useRouter();
  const { user } = useSession();
  const { userLocation } = useUserLocation();
  const { liveUpdates, setUpdateCoords } = useLiveUpdates("line", 30);
  const {
    cameraRef,
    lineRef,
    circleRef,
    segments,
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
    setUpdateCoords(segments.flatMap(({ waypoints }) => waypoints));
  }, [segments]);

  if (!segments) return <NotFound />;

  return (
    <SafeAreaView className="flex-1">
      <Header title="Transit Journal" />
      <JournalInstructions currentStep={currentStep} currentSegment={activeSegments[0]} />
      <MapShell
        cameraRef={cameraRef}
        handleUserLocation={handleUserLocationUpdate}
        handleCameraChange={handleCameraChange}
        userLocationProps={{ animated: false }}
      >
        <CircleSource id={"transfer-points"} data={segments} ref={circleRef} />
        <LineSource id={"direction-line"} data={segments} ref={lineRef} />
        <SymbolSource id={"live-update"} data={liveUpdates} />
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
