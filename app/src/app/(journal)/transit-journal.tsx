import { useRouter } from "expo-router";
import * as ExpoLocation from "expo-location";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Mapbox, { MapView, Camera, UserLocation, Location } from "@rnmapbox/maps";
import { SafeAreaView, View, Text, Modal, Button } from "react-native";

import Header from "@components/ui/Header";
import ReportTab from "@components/journal/ReportTab";
import DirectionsLine from "@components/ui/DirectionsLine";
import LocationMarker from "@components/ui/LocationMarker";

import { MAPBOX_ACCESS_TOKEN } from "@utils/mapbox-config";
import { isNearLocation, computeHeading } from "@utils/map-utils";
import { TRANSPORTATION_COLORS } from "@constants/transportation-color";

import { useTransitJournal } from "@contexts/TransitJournal";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function TransitJournal() {
  const router = useRouter();
  const cameraRef = useRef<Camera>(null);

  const { trip, segments } = useTransitJournal();
  if (!segments) throw new Error("Segments must be defined");
  if (!trip) throw new Error("Trip must be defined");
  const steps = segments.flatMap((segment) => segment.navigationSteps);
  const segmentRoutes = segments.map((segment) => segment.waypoints);
  const segmentData = segments;

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const [showNextSegmentModal, setShowNextSegmentModal] = useState(false);
  const [showTripFinishedModal, setShowTripFinishedModal] = useState(false);

  // Request location permission and get initial location
  useEffect(() => {
    (async () => {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Permission to access location was denied");
        return;
      }

      const location = await ExpoLocation.getCurrentPositionAsync({});
      const newCoords: [number, number] = [location.coords.longitude, location.coords.latitude];
      setUserLocation(newCoords);
    })();
  }, []);

  // Camera
  useEffect(() => {
    if (!userLocation || !steps.length) return;

    const nextLocation =
      currentStepIndex < steps.length
        ? steps[currentStepIndex].location
        : segmentData[currentSegmentIndex].endCoords;
    const computedHeading = computeHeading(nextLocation, userLocation);

    cameraRef.current?.setCamera({
      centerCoordinate: userLocation,
      zoomLevel: 17,
      pitch: 45,
      heading: computedHeading,
      animationDuration: 500,
    });
  }, [userLocation, currentStepIndex, steps, segmentData, currentSegmentIndex]);

  const handleUserLocationUpdate = useCallback(
    (location: Location) => {
      const newCoords: [number, number] = [location.coords.longitude, location.coords.latitude];
      setUserLocation(newCoords);

      if (!steps.length || currentStepIndex >= steps.length) return;

      setCurrentStepIndex((prevStepIndex) => {
        let newStepIndex = prevStepIndex;

        for (let i = prevStepIndex; i < steps.length; i++) {
          if (isNearLocation(newCoords, steps[i].location)) {
            newStepIndex = i;
            break;
          }
        }

        if (newStepIndex >= steps.length - 1) {
          if (currentSegmentIndex < segmentData.length - 1) {
            setShowNextSegmentModal(true);
          } else {
            setShowTripFinishedModal(true);
          }

          return steps.length - 1;
        }

        if (steps[newStepIndex].instruction === "You have arrived at your destination.") {
          setShowTripFinishedModal(true);
        }

        return newStepIndex;
      });
    },
    [steps, segmentData.length, currentSegmentIndex, currentStepIndex],
  );

  function goToNextSegment() {
    setCurrentSegmentIndex((prev) => prev + 1);
    setShowNextSegmentModal(false);
  }

  function handleNavigateToReview() {
    setShowTripFinishedModal(false);
    router.push("/(journal)/journal-review");
  }

  return (
    <SafeAreaView className="flex-1">
      <Header title="Transit Journal" />
      <View className="flex-1">
        <MapView style={{ flex: 1 }} styleURL="mapbox://styles/mapbox/streets-v12">
          <Camera ref={cameraRef} />

          <UserLocation
            visible={true}
            showsUserHeadingIndicator={true}
            onUpdate={handleUserLocationUpdate}
          />

          <LocationMarker
            id="start"
            coordinates={segmentData[currentSegmentIndex].startCoords}
            label={segmentData[currentSegmentIndex].startLocation}
            color={TRANSPORTATION_COLORS[currentSegmentIndex % TRANSPORTATION_COLORS.length]}
            radius={6}
          />
          <LocationMarker
            id="end"
            coordinates={segmentData[currentSegmentIndex].endCoords}
            label={segmentData[currentSegmentIndex].endLocation}
            color={TRANSPORTATION_COLORS[currentSegmentIndex % TRANSPORTATION_COLORS.length]}
            radius={6}
          />

          {segmentRoutes.length > 0 ? (
            segmentRoutes.map((coordinates, index) => (
              <DirectionsLine
                key={index}
                coordinates={coordinates}
                color={TRANSPORTATION_COLORS[currentSegmentIndex % TRANSPORTATION_COLORS.length]}
                width={5}
              />
            ))
          ) : (
            <Text style={{ position: "absolute", top: "50%", left: "50%" }}>
              No route available!
            </Text>
          )}
        </MapView>

        <View className="absolute top-0 w-full bg-white p-4">
          {steps.length > 0 && currentStepIndex >= 0 && currentStepIndex < steps.length ? (
            <Text className="font-bold text-lg mb-2">{steps[currentStepIndex].instruction}</Text>
          ) : (
            <Text className="font-bold text-lg mb-2">Follow the instructions on the map.</Text>
          )}
          {segmentData[currentSegmentIndex].landmark && (
            <Text className="text-sm mb-2">
              Landmark: {segmentData[currentSegmentIndex].landmark}
            </Text>
          )}
          {segmentData[currentSegmentIndex].instruction && (
            <Text className="text-sm mb-2">
              Instruction: {segmentData[currentSegmentIndex].instruction}
            </Text>
          )}
        </View>
      </View>

      <ReportTab />

      <Modal transparent={true} visible={showNextSegmentModal} animationType="slide">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-lg shadow-lg">
            <Text className="text-lg font-bold mb-4">Segment completed!</Text>
            <Text className="mb-4">Transfer to the next ride.</Text>
            <Button title="Next" onPress={goToNextSegment} />
          </View>
        </View>
      </Modal>

      <Modal transparent={true} visible={showTripFinishedModal} animationType="slide">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-lg shadow-lg">
            <Text className="text-lg font-bold mb-4">Trip done!</Text>
            <Text className="mb-4">Great job! You've arrived at your destination.</Text>
            <Button title="Review trip" onPress={handleNavigateToReview} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
