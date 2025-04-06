import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { SafeAreaView, View } from "react-native";

import Header from "@components/ui/Header";
import NotFound from "@components/journal/NotFound";
import PrimaryButton from "@components/ui/PrimaryButton";
import TransferModal from "@components/journal/TransferModal";
import CompleteModal from "@components/journal/CompleteModal";
import ReportLiveUpdates from "@components/journal/ReportLiveUpdates";
import JournalInstructions from "@components/journal/JournalInstructions";

import { MapShell } from "@components/map/MapShell";
import LineSource from "@components/map/LineSource";
import SymbolSource from "@components/map/SymbolSource";
import CircleSource from "@components/map/CircleSource";

import { useTransitJournal } from "@contexts/TransitJournal";
import { useLiveUpdates } from "@hooks/use-live-updates";

export default function TransitJournal() {
  const router = useRouter();
  const {
    cameraRef,
    lineRef,
    circleRef,
    segments,
    currentStep,
    activeSegments,
    showNextSegmentModal,
    showTripFinishedModal,
    setShowNextSegmentModal,
    setShowTripFinishedModal,
    handleUserLocationUpdate,
  } = useTransitJournal();

  const { liveUpdates, setUpdateCoords } = useLiveUpdates("line", 300);

  const handleNavigateToReview = () => {
    setShowTripFinishedModal(false);
    router.push("/(journal)/journal-review");
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
      <View className="flex-1">
        <MapShell
          cameraRef={cameraRef}
          handleUserLocation={handleUserLocationUpdate}
          userLocationProps={{ animated: false }}
        >
          {/* Render the map with the direction, transfer points, and live status*/}
          <CircleSource id={"transfer-points"} data={segments} ref={circleRef} />
          <LineSource id={"direction-line"} data={segments} ref={lineRef} />
          <SymbolSource id={"live-update"} data={liveUpdates} />
        </MapShell>

        <JournalInstructions currentStep={currentStep} currentSegment={activeSegments[0]} />

        {/* TODO: update this to abort transit */}
        <PrimaryButton
          className="absolute bottom-44 right-6"
          label="Done"
          onPress={() => setShowTripFinishedModal(true)}
        />
      </View>

      <ReportLiveUpdates />

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
    </SafeAreaView>
  );
}
