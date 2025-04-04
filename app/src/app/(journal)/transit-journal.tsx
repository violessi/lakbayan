import { useRouter } from "expo-router";
import type { Location } from "@rnmapbox/maps";
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView, View, Text, Button, Pressable } from "react-native";

import Header from "@components/ui/Header";
import { MapShell } from "@components/map/MapShell";
import ReportTab from "@components/journal/ReportTab";
import CircleMarker from "@components/map/CircleMarker";
import TransferModal from "@components/journal/TransferModal";
import CompleteModal from "@components/journal/CompleteModal";
import LiveUpdateMarker from "@components/map/LiveUpdateMarker";
import JournalInstructions from "@components/journal/JournalInstructions";
import LineSource, { type LineSourceRef } from "@components/map/LineSource";
import CircleSource, { type CircleSourceRef } from "@components/map/CircleSource";

import {
  computeHeading,
  isNearLocation,
  getNearestSegment,
  getNearestStep,
} from "@utils/map-utils";
import { useMapView } from "@hooks/use-map-view";
import { useTransitJournal } from "@contexts/TransitJournal";
import { TRANSPORTATION_COLORS } from "@constants/transportation-color";
import { useLiveUpdates } from "@hooks/use-live-updates";

// TODO: cleanup this file
// TODO: cleanup this file
// TODO: cleanup this file
export default function TransitJournal() {
  const { userLocation, cameraRef } = useMapView();
  const router = useRouter();
  const LineRef = useRef<LineSourceRef>(null);
  const CircleRef = useRef<CircleSourceRef>(null);

  const { segments, hasActiveTransitJournal } = useTransitJournal();
  const { liveUpdates, setUpdateCoords } = useLiveUpdates("line", 30);

  const [currentSegment, setCurrentSegment] = useState<Segment | null>(null);
  const [currentStep, setCurrentStep] = useState<NavigationSteps | null>(null);
  const [showNextSegmentModal, setShowNextSegmentModal] = useState(false);
  const [showTripFinishedModal, setShowTripFinishedModal] = useState(false);
  const [showCompleteButton, setShowCompleteButton] = useState(false);

  function handleNavigateToReview() {
    setShowTripFinishedModal(false);
    router.push("/(journal)/journal-review");
  }

  // TODO: move this!!!!
  const handleUserLocationUpdate = async ({ coords }: Location) => {
    if (!segments || !LineRef.current || !CircleRef.current) return;

    const tripSegments = JSON.parse(JSON.stringify(segments)) as Segment[];
    const newLocation = [coords.longitude, coords.latitude] as Coordinates;

    // get the current segment and step
    const { segmentIndex, nearestPoint } = getNearestSegment(newLocation, tripSegments);
    const nextStep = getNearestStep(newLocation, tripSegments[segmentIndex].navigationSteps);

    // set the user location as the first point of the route
    const nearestIndex = nearestPoint.properties.index;
    const activeSegments = tripSegments.slice(segmentIndex);
    activeSegments[0].waypoints = [
      nearestPoint.geometry.coordinates as Coordinates,
      ...activeSegments[0].waypoints.slice(nearestIndex + 1),
    ];

    // update the map with the new segments
    LineRef.current.update(activeSegments);
    CircleRef.current.update(activeSegments);

    // update the camera to follow the user and face the next point
    const nextPoint = activeSegments[0].waypoints[1] ?? newLocation;
    const computedHeading = computeHeading(newLocation, nextPoint);
    cameraRef.current?.setCamera({
      pitch: 60,
      zoomLevel: 16,
      animationDuration: 1000,
      heading: computedHeading,
      centerCoordinate: newLocation,
    });

    // Show transfer modal everytime segment changes
    if (currentSegment?.id !== tripSegments[segmentIndex].id) {
      setShowTripFinishedModal(false);
      setShowNextSegmentModal(true);
    }

    // check if currentLocation is near destination
    const destination = segments[segments.length - 1].endCoords;
    if (isNearLocation(newLocation, destination, 20)) {
      setShowNextSegmentModal(false);
      setShowTripFinishedModal(true);
      setShowCompleteButton(true);
    } else {
      setShowCompleteButton(false);
    }

    // update the current segment and step information
    setCurrentSegment(segments[segmentIndex]);

    // prevent unnecessary re-renders
    if (
      currentStep?.location[0] !== nextStep.location[0] ||
      currentStep?.location[1] !== nextStep.location[1]
    ) {
      setCurrentStep(nextStep);
    }
  };

  // Get initial app state
  useEffect(() => {
    if (!userLocation) return;
    const coords = { latitude: userLocation[1], longitude: userLocation[0] };
    handleUserLocationUpdate({ coords });
  }, []);

  // Fetch live updates on segments
  useEffect(() => {
    if (!segments) return;
    setUpdateCoords(segments.flatMap(({ waypoints }) => waypoints));
  }, [segments]);

  console.log("rendering journal!");
  if (!hasActiveTransitJournal || !segments) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text>No active trip found.</Text>
        <Button title="Go back" onPress={() => router.push("/(tabs)")} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <Header title="Transit Journal" />
      <View className="flex-1">
        <MapShell
          cameraRef={cameraRef}
          handleUserLocation={handleUserLocationUpdate}
          userLocationProps={{ animated: false }}
        >
          {/* Render direction line and transfer points */}
          <CircleSource id={"transfer-points"} segments={segments} ref={CircleRef} />
          <LineSource id={"direction-line"} segments={segments} ref={LineRef} />

          {/* Render live updates */}
          {liveUpdates.map((update) => (
            <LiveUpdateMarker
              key={update.id}
              id={update.id}
              type={update.type}
              coordinates={update.coordinate}
            />
          ))}
        </MapShell>

        {/* Render Information section on top of screen */}
        <JournalInstructions currentStep={currentStep} currentSegment={currentSegment} />

        {/* Render Complete Button if near destination */}
        {showCompleteButton && (
          <Pressable
            className="absolute bottom-44 right-6 bg-primary px-4 py-2 rounded-full shadow-lg active:bg-primary/50"
            onPress={() => setShowTripFinishedModal(true)}
          >
            <Text className="text-white font-bold text-lg">Done</Text>
          </Pressable>
        )}
      </View>

      {/* Render Report Tab */}
      <ReportTab />

      <TransferModal
        isVisible={showNextSegmentModal}
        currentSegment={currentSegment}
        callback={() => setShowNextSegmentModal(false)}
      />
      <CompleteModal
        isVisible={showTripFinishedModal}
        nextCallback={() => handleNavigateToReview()}
        cancelCallback={() => setShowTripFinishedModal(false)}
      />
    </SafeAreaView>
  );
}
