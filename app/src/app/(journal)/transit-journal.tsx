import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { SafeAreaView, View, ActivityIndicator, Text, ScrollView, Modal, Button } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Mapbox, { MapView, Camera, UserLocation } from "@rnmapbox/maps";
import * as Location from "expo-location";

import Header from "@components/ui/Header";
import DirectionsLine from "@components/ui/DirectionsLine";
import LocationMarker from "@components/ui/LocationMarker";

import { getDirections, paraphraseStep } from "@services/mapbox-service";
import { getDistance, getGreatCircleBearing } from "geolib";
import { MAPBOX_ACCESS_TOKEN } from "@utils/mapbox-config";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function TransitJournal() {
  const cameraRef = useRef<Camera>(null);
  const { segments } = useLocalSearchParams();
  const router = useRouter();

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
  const [segmentRoutes, setSegmentRoutes] = useState<Coordinates[][]>([]);

  const [loading, setLoading] = useState(true);

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  const [steps, setSteps] = useState<{ instruction: string; location: [number, number] }[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);

  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [showNextSegmentModal, setShowNextSegmentModal] = useState(false);
  const [showTripFinishedModal, setShowTripFinishedModal] = useState(false);

  function isNearLocation(userLoc: [number, number], stepLoc: [number, number], threshold = 20): boolean {
    return (
      getDistance({ latitude: userLoc[1], longitude: userLoc[0] }, { latitude: stepLoc[1], longitude: stepLoc[0] }) <=
      threshold
    );
  }

  const computeHeading = ([lon1, lat1]: [number, number], [lon2, lat2]: [number, number]): number => {
    return getGreatCircleBearing({ latitude: lat1, longitude: lon1 }, { latitude: lat2, longitude: lon2 });
  };

  // Request location permission and get initial location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Permission to access location was denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const newCoords: [number, number] = [location.coords.longitude, location.coords.latitude];
      setUserLocation(newCoords);
    })();
  }, []);

  // Camera
  useEffect(() => {
    if (!userLocation || !steps.length) return;

    const nextLocation =
      currentStepIndex < steps.length ? steps[currentStepIndex].location : segmentData[currentSegmentIndex].end_coords;
    const computedHeading = computeHeading(userLocation, nextLocation);

    cameraRef.current?.setCamera({
      centerCoordinate: userLocation,
      zoomLevel: 17,
      pitch: 45,
      heading: computedHeading,
      animationDuration: 500,
    });
  }, [userLocation, currentStepIndex, steps, segmentData, currentSegmentIndex]);

  // Fetch directions and steps when segment changes
  useEffect(() => {
    async function fetchDirections() {
      if (!segmentData.length || currentSegmentIndex >= segmentData.length) return;

      setLoading(true);
      try {
        const segment = segmentData[currentSegmentIndex];
        const { start_coords, end_coords, segment_mode, waypoints = [] } = segment;

        console.log(`Fetching route for segment ${currentSegmentIndex + 1}:`, { start_coords, waypoints, end_coords });

        const res = await getDirections(start_coords, waypoints, end_coords, segment_mode, true);
        const routeCoordinates = res?.routes?.[0]?.geometry?.coordinates || [];
        console.log(routeCoordinates);
        setSegmentRoutes([routeCoordinates]);

        const extractedSteps =
          res?.routes?.[0]?.legs.flatMap((leg) =>
            leg.steps.map((step) => ({
              instruction: paraphraseStep(step.maneuver.instruction),
              location: step.maneuver.location,
            })),
          ) || [];

        setSteps(extractedSteps);
        setCurrentStepIndex(0);
        setShowNextSegmentModal(false);
      } catch (error) {
        console.error("Error fetching segment directions:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDirections();
  }, [currentSegmentIndex]);

  const handleUserLocationUpdate = useCallback(
    (location: Location.LocationObject) => {
      const newCoords: [number, number] = [location.coords.longitude, location.coords.latitude];
      setUserLocation(newCoords);

      if (!steps.length) return;

      setCurrentStepIndex((prevStepIndex) => {
        let newStepIndex = prevStepIndex;

        // if the user is near the current step location, move to the next step
        for (let i = prevStepIndex; i < steps.length; i++) {
          if (isNearLocation(newCoords, steps[i].location)) {
            newStepIndex = i + 1;
            break;
          }
        }
        // If all steps are completed, show the modal for confirmation
        if (newStepIndex >= steps.length && steps.length > 0) {
          if (currentSegmentIndex < segmentData.length - 1) {
            setShowNextSegmentModal(true); // User confirms before proceeding
          } else {
            setShowTripFinishedModal(true);
            console.log("Trip finished!");
          }
        }

        return newStepIndex;
      });
    },
    [steps, segmentData.length, currentSegmentIndex],
  );

  function goToNextSegment() {
    console.log("setting to next");
    setCurrentSegmentIndex((prev) => prev + 1);
    setShowNextSegmentModal(false);
  }

  function handleNavigateToReview() {
    setShowTripFinishedModal(false);
    console.log("Navigating to review");
    router.push("/(journal)/journal-review");
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
            <Text style={{ position: "absolute", top: "50%", left: "50%" }}>No route available</Text>
          )}
        </MapView>

        <View className="absolute bottom-0 w-full bg-white p-4">
          <Text className="font-bold text-lg mb-2">Current Step</Text>
          {steps.length > 0 && currentStepIndex >= 0 && currentStepIndex < steps.length ? (
            <Text className="text-gray-700">{steps[currentStepIndex].instruction}</Text>
          ) : (
            <Text className="text-gray-500">No steps available.</Text>
          )}
          <Text>Landmark: {segmentData[currentSegmentIndex]?.landmark || ""}</Text>
          <Text>Instruction: {segmentData[currentSegmentIndex]?.instruction || ""}</Text>
        </View>
      </View>

      <Modal transparent={true} visible={showNextSegmentModal} animationType="slide">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-lg shadow-lg">
            <Text className="text-lg font-bold mb-4">Segment Completed!</Text>
            <Text className="mb-4">You're done with this segment. Ready for the next one?</Text>
            <Button title="Next Segment" onPress={goToNextSegment} />
          </View>
        </View>
      </Modal>

      <Modal transparent={true} visible={showTripFinishedModal} animationType="slide">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-lg shadow-lg">
            <Text className="text-lg font-bold mb-4">Trip done!</Text>
            <Text className="mb-4">Done with the trip</Text>
            <Button title="Review trip" onPress={handleNavigateToReview} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
