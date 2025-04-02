import { useRouter } from "expo-router";
import * as ExpoLocation from "expo-location";
import { ShapeSource, LineLayer } from "@rnmapbox/maps";
import React, { useEffect, useRef, useState } from "react";
import { Alert, SafeAreaView, View, Text, Button, Pressable } from "react-native";
import Mapbox, { MapView, Camera, UserLocation, Location } from "@rnmapbox/maps";

import Header from "@components/ui/Header";
import ReportTab from "@components/journal/ReportTab";
import CircleMarker from "@components/map/CircleMarker";
import TransferModal from "@components/journal/TransferModal";
import CompleteModal from "@components/journal/CompleteModal";

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
  const [showCompleteButton, setShowCompleteButton] = useState(false);

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
      setShowNextSegmentModal(true);
    }

    // check if currentLocation is near destination
    const destination = segments[segments.length - 1].endCoords;
    if (isNearLocation(newLocation, destination, 20)) {
      setShowTripFinishedModal(true);
      setShowCompleteButton(true);
    } else {
      setShowCompleteButton(false);
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
          />

          <CircleMarker
            id="end"
            coordinates={currentSegment?.endCoords}
            label={currentSegment?.endLocation}
          />

          {/* TODO: move this */}
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

        {/* TODO: move this */}
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

      {showCompleteButton && (
        <Pressable
          className="absolute bottom-60 right-6 bg-primary px-4 py-2 rounded-full shadow-lg active:bg-primary/50"
          onPress={() => setShowTripFinishedModal(true)}
        >
          <Text className="text-white font-bold text-lg">Done</Text>
        </Pressable>
      )}

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
