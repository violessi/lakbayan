import React, { useEffect, useRef, useState, useMemo } from "react";
import { SafeAreaView, View, ActivityIndicator, Text, ScrollView, Modal, Button } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Mapbox, { MapView, Camera, UserLocation } from "@rnmapbox/maps";
import * as Location from "expo-location";

import Header from "@components/ui/Header";
import DirectionsLine from "@components/ui/DirectionsLine";
import LocationMarker from "@components/ui/LocationMarker";

import { getDirections, paraphraseStep } from "@services/mapbox-service";
import { MAPBOX_ACCESS_TOKEN } from "@utils/mapbox-config";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function TransitJournal() {
  const cameraRef = useRef<Camera>(null);
  const { segments } = useLocalSearchParams();
  
  const segmentData = useMemo(() => (segments ? JSON.parse(segments) : []), [segments]);
  const [segmentRoutes, setSegmentRoutes] = useState<Coordinates[][]>([]);
  const [steps, setSteps] = useState<{ instruction: string; location: [number, number] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [showNextSegmentModal, setShowNextSegmentModal] = useState(false);

  function isNearLocation(userLoc: [number, number], stepLoc: [number, number], threshold = 20): boolean {
    return getDistance(userLoc, stepLoc) <= threshold;
  }

  function getDistance([lon1, lat1]: [number, number], [lon2, lat2]: [number, number]) {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371e3;
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Permission to access location was denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation([location.coords.longitude, location.coords.latitude]);

      if (cameraRef.current) {
        cameraRef.current.setCamera({
          centerCoordinate: [location.coords.longitude, location.coords.latitude],
          zoomLevel: 16,
          pitch: 45,
          bearing: 0,
          animationDuration: 1000,
        });
      }
    })();
  }, []);

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
        setSegmentRoutes([routeCoordinates]);
    
        console.log("Route Coordinates:", JSON.stringify(routeCoordinates, null, 2));
    
        const extractedSteps = res?.routes?.[0]?.legs.flatMap((leg) =>
          leg.steps.map((step) => ({
            instruction: paraphraseStep(step.maneuver.instruction),
            location: step.maneuver.location,
          }))
        ) || [];
    
        setSteps(extractedSteps);
        setCurrentStepIndex(0);
        setShowNextSegmentModal(false);
        console.log("Step-by-Step Directions:", JSON.stringify(extractedSteps, null, 2));
      } catch (error) {
        console.error("Error fetching segment directions:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDirections();
  }, [currentSegmentIndex]);

  useEffect(() => {
    if (!userLocation || steps.length === 0) return;

    for (let i = currentStepIndex; i < steps.length; i++) {
      if (isNearLocation(userLocation, steps[i].location)) {
        setCurrentStepIndex(i + 1);
        break;
      }
    }
  }, [userLocation, steps, currentStepIndex]);

  useEffect(() => {
    if (currentStepIndex >= steps.length && steps.length > 0) {
      setShowNextSegmentModal(true);
    }
  }, [currentStepIndex, steps]);

  function goToNextSegment() {
    if (currentSegmentIndex < segmentData.length - 1) {
      setCurrentSegmentIndex(currentSegmentIndex + 1);
    }
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
            onUpdate={(location) => {
              setUserLocation([location.coords.longitude, location.coords.latitude]);

              if (cameraRef.current) {
                cameraRef.current.setCamera({
                  centerCoordinate: [location.coords.longitude, location.coords.latitude],
                  zoomLevel: 16,
                  pitch: 45,
                  bearing: location.coords.heading || 0,
                  animationDuration: 500,
                });
              }
            }}
          />

          {segmentData.length > 0 && (
            <>
              <LocationMarker coordinates={segmentData[currentSegmentIndex].start_coords} label={segmentData[currentSegmentIndex].start_location} color="blue" radius={6} />
              <LocationMarker coordinates={segmentData[currentSegmentIndex].end_coords} label={segmentData[currentSegmentIndex].end_location} color="blue" radius={6} />
            </>
          )}

          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" style={{ position: "absolute", top: "50%", left: "50%" }} />
          ) : segmentRoutes.length > 0 ? (
            segmentRoutes.map((coordinates, index) => <DirectionsLine key={index} coordinates={coordinates} color="blue" />)
          ) : (
            <Text style={{ position: "absolute", top: "50%", left: "50%" }}>No route available</Text>
          )}
        </MapView>

        <ScrollView className="p-4 bg-white">
          <Text className="font-bold text-lg mb-2">Step-by-Step Directions</Text>
          {steps.length > 0 ? (
            steps.slice(0, currentStepIndex).map((step, index) => (
              <Text key={index} className="text-gray-700 mb-1">
                {index + 1}. {step.instruction}
              </Text>
            ))
          ) : (
            <Text className="text-gray-500">No steps available.</Text>
          )}
        </ScrollView>
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
    </SafeAreaView>
  );
}