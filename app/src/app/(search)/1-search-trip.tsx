import React, { useRef, useState } from "react";
import { useRouter } from "expo-router";

import { Alert, SafeAreaView, View } from "react-native";

import Header from "@components/ui/Header";
import SymbolMarker from "@components/map/SymbolMarker";
import PrimaryButton from "@components/ui/PrimaryButton";
import pin from "@assets/pin-purple.png";

import StartEndSearchBar from "@components/StartEndSearchBar";

import { MAPBOX_ACCESS_TOKEN } from "@utils/mapbox-config";
import { reverseGeocode } from "@services/mapbox-service";
import Mapbox, { MapView, Camera, Images } from "@rnmapbox/maps";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

// TODO: set initial camera to current location
const INITIAL_CENTER = [121.05, 14.63] as Coordinates;

export default function SearchTrip() {
  const router = useRouter();
  const cameraRef = useRef<Camera>(null);
  const [zoomLevel, setZoomLevel] = useState(15);

  const [tripDetails, setTripDetails] = useState<Partial<TripDetails> | null>(null);
  const [mapCoordinates, setMapCoordinates] = useState<Coordinates | null>(null);

  const handleStartChange = (startLocation: string, startCoords: Coordinates) => {
    setMapCoordinates(null);
    setTripDetails((prev) => ({ ...prev, startLocation, startCoords }));
    if (cameraRef.current) cameraRef.current.moveTo(startCoords, 1000);
  };

  const handleEndChange = (endLocation: string, endCoords: Coordinates) => {
    setMapCoordinates(null);
    setTripDetails((prev) => ({ ...prev, endLocation, endCoords }));
    if (cameraRef.current) cameraRef.current.moveTo(endCoords, 1000);
  };

  const handleMapPress = async (event: any) => {
    const coords = event.geometry.coordinates as Coordinates;
    const locationName = await reverseGeocode(coords);
    setMapCoordinates(coords);
    confirmationAlert(coords, locationName);
    if (cameraRef.current) cameraRef.current.moveTo(coords, 1000);
  };

  const confirmationAlert = (coords: Coordinates, location: string) => {
    Alert.alert(
      "Confirm Location",
      `Do you want to set ${location} as your source or destination?`,
      [
        { text: "Source", onPress: () => handleStartChange(location, coords) },
        { text: "Destination", onPress: () => handleEndChange(location, coords) },
        { text: "Cancel", onPress: () => setMapCoordinates(null) },
      ],
    );
  };

  const handleConfirmLocation = () => {
    if (tripDetails?.startLocation && tripDetails?.endLocation) {
      router.push({
        pathname: "/(search)/2-trip-suggestions",
        params: { params: JSON.stringify(tripDetails) },
      });
    } else {
      Alert.alert("Please select both a source and destination.");
    }
  };

  const handleZoomChange = (event: any) => {
    setZoomLevel(event.properties.zoom);
  };

  return (
    <SafeAreaView className="flex-1">
      <Header title="Where are we off to today?" />
      <View>
        <StartEndSearchBar
          defaultStart={tripDetails?.startLocation || "Starting location"}
          defaultEnd={tripDetails?.endLocation || "Destination"}
          onStartChange={handleStartChange}
          onEndChange={handleEndChange}
        />
      </View>

      <MapView
        style={{ flex: 1 }}
        styleURL="mapbox://styles/mapbox/streets-v12"
        onPress={handleMapPress}
        onRegionDidChange={handleZoomChange}
        projection="mercator"
      >
        <Camera
          ref={cameraRef}
          centerCoordinate={INITIAL_CENTER}
          zoomLevel={zoomLevel}
          animationMode="easeTo"
        />
        <SymbolMarker id="map-onclick-location-c1" coordinates={mapCoordinates} />
        <SymbolMarker
          id="start-location-c1"
          label={tripDetails?.startLocation?.split(",")[0]}
          coordinates={tripDetails?.startCoords}
        />
        <SymbolMarker
          id="end-location-c1"
          label={tripDetails?.endLocation?.split(",")[0]}
          coordinates={tripDetails?.endCoords}
        />
        <Images images={{ pin }} />
      </MapView>

      <View className="z-50 p-5 absolute bottom-0 w-1/2 self-center">
        <PrimaryButton label="Confirm" onPress={handleConfirmLocation} />
      </View>
    </SafeAreaView>
  );
}
