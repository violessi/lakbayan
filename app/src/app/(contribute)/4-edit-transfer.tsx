import { router } from "expo-router";
import React, { useRef, useState, useCallback } from "react";
import { Alert, SafeAreaView, View } from "react-native";
import Mapbox, { MapView, Camera } from "@rnmapbox/maps";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { usePreventRemove } from "@react-navigation/native";

import Header from "@components/ui/Header";
import DirectionsLine from "@components/ui/DirectionsLine";
import CircleMarker from "@components/map/CircleMarker";
import TripTitle from "@components/contribute/TripTitle";
import RouteInformation from "@components/contribute/RouteInformation";
import PrimaryButton from "@components/ui/PrimaryButton";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

import { useTripCreator } from "@contexts/TripCreator/TripCreatorContext";
import { getDirections, paraphraseStep } from "@services/mapbox-service";
import { MAPBOX_ACCESS_TOKEN } from "@utils/mapbox-config";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function RouteInput() {
  const cameraRef = useRef<Camera>(null);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const navigation = useNavigation();
  const [zoomLevel, setZoomLevel] = useState(13);

  const { route, inEditMode, setInEditMode, updateRoute, addSegment } = useTripCreator();
  const [customWaypoints, setCustomWaypoint] = useState<Coordinates[]>([]);
  const [isAddingWaypoints, setIsAddingWaypoints] = useState(false);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  const { index } = useLocalSearchParams<{ index: string }>();
  const segmentIndex = index !== undefined && index !== null ? parseInt(String(index), 10) : -1;

  const getRouteDirections = async () => {
    setIsLoadingRoute(true);
    try {
      const data = await getDirections(
        route.startCoords,
        customWaypoints,
        route.endCoords,
        route.segmentMode,
        true,
      );

      const directions = data.routes[0];
      const waypoints = directions.geometry.coordinates ?? [];
      const duration = directions.duration;
      const distance = directions.distance;
      const navigationSteps = directions.legs.flatMap(({ steps }) =>
        steps.map(({ maneuver }) => ({
          instruction: paraphraseStep(maneuver.instruction),
          location: maneuver.location,
        })),
      );
      updateRoute({ waypoints, duration, distance, navigationSteps });
    } catch (error) {
      console.error("Error fetching directions:", error);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const handleMapClick = async (event: any) => {
    if (!isAddingWaypoints) return;
    setCustomWaypoint((prev) => [...prev, event.geometry.coordinates]);
  };

  const handleToggleMode = async () => {
    if (isAddingWaypoints) await getRouteDirections();
    setIsAddingWaypoints((prev) => !prev);
  };

  const handleDismissPress = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  const handleSubmit = () => {
    if (!route.segmentMode || !route.segmentName || !route.cost || isNaN(route.cost) || route.waypoints.length === 0) {
      Alert.alert("Please fill in all fields to proceed.");
      return;
    }
    handleDismissPress();
    addSegment(segmentIndex);
    router.replace("/(contribute)/2-review-trip");
  };

  const clearWaypoints = () => setCustomWaypoint([]);
  const handleZoomChange = (event: any) => setZoomLevel(event.properties.zoom);
  const handleMapLoaded = () => {
    if (cameraRef.current) {
      cameraRef.current.fitBounds(route.startCoords, route.endCoords, [150, 150, 250, 150]);
    }
  };

  // bottom sheet
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current!.present();
  }, []);

  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  const handleDismiss = useCallback(() => {
    console.log('on dismiss');
  }, []);

  // back navigation
  usePreventRemove(inEditMode, ({ data }) => {
    Alert.alert(
      'Unsaved Changes',
      'You have unsaved changes. If you leave now, your progress will be lost. Do you want to continue?',
      [
        {
          text: 'Leave Anyway',
          style: 'destructive',
          onPress: () => {
            navigation.dispatch(data.action);
            if (inEditMode) {
              setInEditMode(false);
              console.log("inEditMode", inEditMode);
            }
          },
        },
        {
          text: "Stay",
          style: 'cancel',
          onPress: () => {},
        },
      ]
    );
  });
  

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Route Input" />
      <View className="flex justify-center items-center">
        <TripTitle
          startLocation={route.startLocation}
          endLocation={route.endLocation}
          transportationMode={route.segmentMode}
        />
      </View>

      <MapView
        style={{ flex: 1 }}
        styleURL="mapbox://styles/mapbox/streets-v12"
        projection="mercator"
        onRegionDidChange={handleZoomChange}
        onDidFinishLoadingMap={handleMapLoaded}
        onPress={handleMapClick}
      >
        <Camera ref={cameraRef} zoomLevel={zoomLevel} animationMode="easeTo" />

        <CircleMarker
          id="start-location"
          coordinates={route.startCoords}
          label={route.startLocation}
          color="red"
        />
        <CircleMarker
          id="end-location"
          coordinates={route.endCoords}
          label={route.endLocation}
          color="red"
        />

        {customWaypoints.map((waypoint, index) => (
          <CircleMarker
            key={`waypoint-${index}`}
            id={`waypoint-${index}`}
            coordinates={waypoint}
            label={`Waypoint ${index + 1}`}
            color="blue"
            radius={6}
          />
        ))}

        {!isLoadingRoute && !isAddingWaypoints && route.waypoints.length > 0 && (
          <DirectionsLine coordinates={route.waypoints} />
        )}
      </MapView>

      <View className="absolute bottom-0 z-50 flex flex-row gap-2 p-5 w-full justify-center">
        <PrimaryButton
          label={isAddingWaypoints ? "Recalculate" : "Edit Route"}
          onPress={handleToggleMode}
        />
        <PrimaryButton
          label={isAddingWaypoints ? "Clear" : "Calculate"}
          onPress={isAddingWaypoints ? clearWaypoints : getRouteDirections}
        />
        <PrimaryButton
          label="Edit Details"
          onPress={handlePresentModalPress}
        />
      </View>

      <RouteInformation
        onRouteNameChange={(segmentName) => updateRoute({ segmentName })}
        onLandmarkChange={(landmark) => updateRoute({ landmark })}
        onInstructionChange={(instruction) => updateRoute({ instruction })}
        onCostChange={(cost) => updateRoute({ cost: Number(cost) })}
        routeName={route.segmentName}
        landmark={route.landmark ?? ""}
        instruction={route.instruction ?? ""}
        cost={route.cost.toString()}
        onSubmit={handleSubmit}
        bottomSheetModalRef={bottomSheetModalRef}
        handleSheetChanges={handleSheetChanges}
        updateRoute={updateRoute}
        handleDismiss={handleDismiss}
      />
    </SafeAreaView>
  );
}
