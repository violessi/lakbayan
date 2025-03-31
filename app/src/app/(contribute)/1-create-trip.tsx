import { router } from "expo-router";
import React, { useRef, useState } from "react";
import { SafeAreaView, View, Alert } from "react-native";
import Mapbox, { MapView, Camera, Images } from "@rnmapbox/maps";

import pin from "@assets/pin-purple.png";
import Header from "@components/ui/Header";
import PrimaryButton from "@components/ui/PrimaryButton";
import StartEndSearchBar from "@components/StartEndSearchBar";
import SymbolMarker from "@components/map/SymbolMarker";

import { useTripCreator } from "@contexts/TripCreator/TripCreatorContext";
import { reverseGeocode } from "@services/mapbox-service";
import { MAPBOX_ACCESS_TOKEN } from "@utils/mapbox-config";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

// TODO: set initial camera to current location
const INITIAL_CENTER = [121.05, 14.63] as Coordinates;

// TODO: create a hook for map attributes to have single source for all pages
export default function CustomTrip() {
  const cameraRef = useRef<Camera>(null);
  const [zoomLevel, setZoomLevel] = useState(15);

  const { trip, updateTrip } = useTripCreator();
  const [mapCoordinates, setMapCoordinates] = useState<Coordinates | null>(null);

  // When the user updates a location as "Source".
  const handleStartChange = (location: string, coords: Coordinates) => {
    setMapCoordinates(null);
    updateTrip({ startLocation: location, startCoords: coords });
    if (cameraRef.current) cameraRef.current.moveTo(coords, 1000);
  };

  // When the user updates a location as "Destination".
  const handleEndChange = (location: string, coords: Coordinates) => {
    setMapCoordinates(null);
    updateTrip({ endLocation: location, endCoords: coords });
    if (cameraRef.current) cameraRef.current.moveTo(coords, 1000);
  };

  // When the user presses the map.
  const handleMapPress = async (event: any) => {
    const coords = event.geometry.coordinates as Coordinates;
    const locationName = await reverseGeocode(coords);
    setMapCoordinates(coords);
    confirmationAlert(coords, locationName);
    if (cameraRef.current) cameraRef.current.moveTo(coords, 1000);
  };

  // Alert asking if the location is Source or Destination.
  const confirmationAlert = (coords: Coordinates, location: string) => {
    Alert.alert(
      "Confirm Location",
      `Do you want to set ${location} as your source or destination?`,
      [
        { text: "Cancel", onPress: () => setMapCoordinates(null) },
        { text: "Source", onPress: () => handleStartChange(location, coords) },
        { text: "Destination", onPress: () => handleEndChange(location, coords) },
      ],
    );
  };

  // When the user presses Confirm, navigate to the next screen if both locations are set.
  const handleConfirmLocation = () => {
    if (trip.startLocation && trip.endLocation) {
      router.replace("/(contribute)/2-review-trip");
    } else {
      Alert.alert("Please select both a source and destination.");
    }
  };

  // Update zoom level when region changes.
  // FIXME: translation of device zoom tp map zoom level
  const handleZoomChange = (event: any) => {
    setZoomLevel(event.properties.zoom);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Custom Trips" />

      <View>
        {/*​FIXME: This is not being overwritten by the map. */}
        <StartEndSearchBar
          defaultStart={trip.startLocation || "Starting location"}
          defaultEnd={trip.endLocation || "Destination"}
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
          label={trip.startLocation.split(",")[0]}
          coordinates={trip.startCoords}
        />
        <SymbolMarker
          id="end-location-c1"
          label={trip.endLocation.split(",")[0]}
          coordinates={trip.endCoords}
        />
        <Images images={{ pin }} />
      </MapView>

      <View className="z-50 p-5 absolute bottom-0 w-1/2 self-center">
        <PrimaryButton label="Confirm" onPress={handleConfirmLocation} />
      </View>
    </SafeAreaView>
  );
}
