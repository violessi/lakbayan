import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { SafeAreaView, View, ActivityIndicator, Text, Modal, Button } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Mapbox, { MapView, Camera, UserLocation, Location } from "@rnmapbox/maps";
import * as ExpoLocation from "expo-location";

import Header from "@components/ui/Header";
import DirectionsLine from "@components/ui/DirectionsLine";
import LocationMarker from "@components/ui/LocationMarker";
import ReportTab from "@components/journal/ReportTab";

import { MAPBOX_ACCESS_TOKEN } from "@utils/mapbox-config";
import { isNearLocation, computeHeading } from "@utils/map-utils";
import { useSegmentDirections } from "@hooks/use-segment-directions";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function TransitJournal() {
  const cameraRef = useRef<Camera>(null);
  const router = useRouter();

  const { trip, segments } = useLocalSearchParams();
  const segmentData = useMemo(() => {
    if (!segments) return [];
    const segmentString = Array.isArray(segments) ? segments[0] : segments;
    try {
      return JSON.parse(segmentString);
    } catch (error) {
      console.error("Error parsing segments:", error);
      return [];
    }
  }, [segments]);

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const [showNextSegmentModal, setShowNextSegmentModal] = useState(false);
  const [showTripFinishedModal, setShowTripFinishedModal] = useState(false);

  const { segmentRoutes, steps, loading } = useSegmentDirections(segmentData, currentSegmentIndex);

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
      currentStepIndex < steps.length ? steps[currentStepIndex].location : segmentData[currentSegmentIndex].end_coords;
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
          console.log("Last step reached!");

          if (currentSegmentIndex < segmentData.length - 1) {
            console.log("Showing next segment modal");
            setShowNextSegmentModal(true);
          } else {
            console.log("Trip finished! Showing trip finished modal");
            setShowTripFinishedModal(true);
          }

          return steps.length - 1;
        }

        if (steps[newStepIndex].instruction === "You have arrived at your destination.") {
          console.log("Trip finished! Showing trip finished modal");
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
    router.push({
      pathname: "/(journal)/journal-review",
      params: { trip: trip, segments: JSON.stringify(segmentData) },
    });
  }

  return (
    <SafeAreaView className="flex-1">
      <Header title="Transit Journal" />
      <View className="flex-1">
        <MapView style={{ flex: 1 }} styleURL="mapbox://styles/mapbox/streets-v12">
          <Camera ref={cameraRef} />

          <UserLocation visible={true} showsUserHeadingIndicator={true} onUpdate={handleUserLocationUpdate} />

          {segmentData.length > 0 && (
            <>
              <LocationMarker
                coordinates={segmentData[currentSegmentIndex].start_coords}
                label="Start"
                color="blue"
                radius={6}
              />
              <LocationMarker
                coordinates={segmentData[currentSegmentIndex].end_coords}
                label="End"
                color="blue"
                radius={6}
              />
            </>
          )}

          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" style={{ position: "absolute", top: "50%", left: "50%" }} />
          ) : segmentRoutes.length > 0 ? (
            segmentRoutes.map((coordinates, index) => (
              <DirectionsLine key={index} coordinates={coordinates} color="blue" />
            ))
          ) : (
            <Text style={{ position: "absolute", top: "50%", left: "50%" }}>No route available!</Text>
          )}
        </MapView>

        <View className="absolute top-0 w-full bg-white p-4">
          {steps.length > 0 && currentStepIndex >= 0 && currentStepIndex < steps.length ? (
            <Text className="font-bold text-lg mb-2">{steps[currentStepIndex].instruction}</Text>
          ) : (
            <Text className="font-bold text-lg mb-2">Follow the map.</Text>
          )}
          {segmentData[currentSegmentIndex].landmark && (
            <Text className="text-sm mb-2">Landmark: {segmentData[currentSegmentIndex].landmark}</Text>
          )}
          {segmentData[currentSegmentIndex].instruction && (
            <Text className="text-sm mb-2">Instruction: {segmentData[currentSegmentIndex].instruction}</Text>
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
