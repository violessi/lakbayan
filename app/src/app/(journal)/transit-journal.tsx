import { useRouter } from "expo-router";
import * as ExpoLocation from "expo-location";
import { ShapeSource, LineLayer } from "@rnmapbox/maps";
import React, { useEffect, useRef, useState } from "react";
import { Alert, SafeAreaView, View, Text, Modal, Button } from "react-native";
import Mapbox, { MapView, Camera, UserLocation, Location } from "@rnmapbox/maps";

import Header from "@components/ui/Header";
import ReportTab from "@components/journal/ReportTab";
import CircleMarker from "@components/map/CircleMarker";

import { useTransitJournal } from "@contexts/TransitJournal";
import {
  computeHeading,
  isNearLocation,
  getNearestSegment,
  getNearestStep,
} from "@utils/map-utils";

import { TRANSPORTATION_COLORS } from "@constants/transportation-color";
import { MAPBOX_ACCESS_TOKEN } from "@utils/mapbox-config";
Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function TransitJournal() {
  const router = useRouter();
  const cameraRef = useRef<Camera>(null);
  const routeSource = useRef<ShapeSource>(null);

  const { hasActiveTransitJournal, segments } = useTransitJournal();
  const [currentSegment, setCurrentSegment] = useState<Segment | null>(null);
  const [currentStep, setCurrentStep] = useState<NavigationSteps | null>(null);
  const [showNextSegmentModal, setShowNextSegmentModal] = useState(false);
  const [showTripFinishedModal, setShowTripFinishedModal] = useState(false);

  const destination: Coordinates = segments ? segments[segments.length - 1].endCoords : [0, 0];

  function handleNavigateToReview() {
    setShowTripFinishedModal(false);
    router.push("/(journal)/journal-review");
  }

  const handleUserLocationUpdate = ({ coords }: Location) => {
    if (!segments) return;
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

    // update the map to show active route
    const activeRoutes = activeSegments.flatMap(({ waypoints }) => waypoints);
    routeSource.current?.setNativeProps({
      id: "routeSource",
      shape: JSON.stringify({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: activeRoutes,
        },
      }),
    });

    // update the camera to follow the user and face the next point
    // TODO: make the heading smoother
    const nextPoint = activeSegments[0].waypoints[1] ?? newLocation;
    const computedHeading = computeHeading(newLocation, nextPoint);
    cameraRef.current?.setCamera({
      pitch: 60,
      zoomLevel: 16,
      animationDuration: 1000,
      heading: computedHeading,
      centerCoordinate: newLocation,
    });

    // NOTE: Temporary implementation
    // TODO: modal should not force user to end the trip, add cancel
    // TODO: aside from modal, add button to end trip
    // check if currentLocation is near destination
    if (isNearLocation(newLocation, destination, 20)) {
      setShowTripFinishedModal(true);
    }

    // NOTE: Temporary implementation
    // Show transfer modal everytime it changes segment
    if (currentSegment && currentSegment?.id !== tripSegments[segmentIndex].id) {
      setShowNextSegmentModal(true);
    }

    // update the current segment and step information
    setCurrentSegment(segments[segmentIndex]);
    setCurrentStep(nextStep);
  };

  // Request location permission and get initial app state
  useEffect(() => {
    const getInitialLocation = async () => {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Location Access Needed",
          "To use this feature, please enable location access in your settings.",
          [{ text: "Cancel", style: "cancel" }],
        );
      } else {
        const location = await ExpoLocation.getCurrentPositionAsync({});
        handleUserLocationUpdate(location as Location);
      }
    };

    getInitialLocation();
  }, []);

  if (!hasActiveTransitJournal) {
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
        <MapView style={{ flex: 1 }} styleURL="mapbox://styles/mapbox/streets-v12">
          <Camera ref={cameraRef} />

          <UserLocation
            visible={true}
            showsUserHeadingIndicator={true}
            onUpdate={handleUserLocationUpdate}
            animated={false}
          />

          <CircleMarker
            id="start"
            coordinates={currentSegment?.startCoords}
            label={currentSegment?.startLocation}
            color={TRANSPORTATION_COLORS[0]}
            radius={7}
          />

          <CircleMarker
            id="end"
            coordinates={currentSegment?.endCoords}
            label={currentSegment?.endLocation}
            color={TRANSPORTATION_COLORS[0]}
            radius={7}
          />

          <ShapeSource
            id="routeSource"
            ref={routeSource}
            shape={{
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: [],
              },
              properties: {},
            }}
          >
            <LineLayer
              id="routeLayer"
              style={{
                lineColor: "blue",
                lineWidth: 5,
              }}
            />
          </ShapeSource>
        </MapView>

        <View className="absolute top-0 w-full bg-white p-4">
          {currentStep ? (
            <Text className="font-bold text-lg mb-2">{currentStep.instruction}</Text>
          ) : (
            <Text className="font-bold text-lg mb-2">Follow the instructions on the map.</Text>
          )}
          {currentSegment?.landmark && (
            <Text className="text-sm mb-2">Landmark: {currentSegment?.landmark}</Text>
          )}
          {currentSegment?.instruction && (
            <Text className="text-sm mb-2">Instruction: {currentSegment?.instruction}</Text>
          )}
        </View>
      </View>

      <ReportTab />

      <Modal transparent={true} visible={showNextSegmentModal} animationType="slide">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-lg shadow-lg">
            <Text className="text-lg font-bold mb-4">Segment completed!</Text>
            <Text className="mb-4">Transfer to the next ride.</Text>
            <Button title="Next" onPress={() => setShowNextSegmentModal(false)} />
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
