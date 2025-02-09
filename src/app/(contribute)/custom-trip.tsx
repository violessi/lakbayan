import React, { useRef, useState, useEffect } from "react";
import { SafeAreaView, View, Alert } from "react-native";
import { router } from "expo-router";
import { useTrip } from "@contexts/TripContext"; 
import StartEndSearchBar from "../../components/StartEndSearchBar";
import Header from "../../components/ui/Header";
import PrimaryButton from "@components/ui/PrimaryButton";
import { reverseGeocode } from "@services/mapbox-service";

import pin from "@assets/pin-purple.png";

import Mapbox, { MapView, Camera, ShapeSource, SymbolLayer, Images } from "@rnmapbox/maps";
import { featureCollection, point } from "@turf/helpers";
import { MAPBOX_ACCESS_TOKEN } from "@utils/mapbox-config";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function CustomTrip() {
  // Get trip and the function to update its start/end values from context.
  const { trip, setStartEndLocations } = useTrip();
  const cameraRef = useRef<Camera>(null);

  const [mapCoordinates, setMapCoordinates] = useState<Coordinates | null>(null);
  const [zoomLevel, setZoomLevel] = useState(12);

  const [startTripLocation, setStartTripLocation] = useState<string | null>(trip.start_location || null);
  const [startTripCoordinates, setStartTripCoordinates] = useState<Coordinates | null>(trip.start_coords || null);
  const [endTripLocation, setEndTripLocation] = useState<string | null>(trip.end_location || null);
  const [endTripCoordinates, setEndTripCoordinates] = useState<Coordinates | null>(trip.end_coords || null);

  // When the user confirms a location as "Source", update the start values.
  const handleStartChange = (location: string, coords: Coordinates) => {
    setStartTripLocation(location);
    setStartTripCoordinates(coords);
    // Update the context: new start values; keep the current destination values.
    setStartEndLocations(location, coords, trip.end_location, trip.end_coords || [0, 0]);
  };

  // When the user confirms a location as "Destination", update the end values.
  const handleEndChange = (location: string, coords: Coordinates) => {
    setEndTripLocation(location);
    setEndTripCoordinates(coords);
    // Update the context: keep the current start values; update end values.
    setStartEndLocations(trip.start_location, trip.start_coords || [0, 0], location, coords);
  };

  // Alert asking if the location is Source or Destination.
  const confirmationAlert = (coords: Coordinates, location: string) => {
    Alert.alert(
      "Confirm Location",
      `Do you want to set ${location} as your source or destination?`,
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "Source",
          onPress: () => handleStartChange(location, coords),
        },
        {
          text: "Destination",
          onPress: () => handleEndChange(location, coords),
        },
      ]
    );
  };

  // When the user presses the map, get the coordinates and reverse-geocode the location name.
  const handleMapPress = async (event: any) => {
    const coords = event.geometry.coordinates as Coordinates;
    setMapCoordinates(coords);
    const locationName = await reverseGeocode(coords);
    confirmationAlert(coords, locationName);
  };

  // When the user presses Confirm, navigate to the next screen if both locations are set.
  const handleConfirmLocation = () => {
    if (trip.start_location && trip.end_location) {
      router.push("/(contribute)/trip-review");
    } else {
      Alert.alert("Please select both a source and destination.");
    }
  };

  // Update zoom level when region changes.
  const handleZoomChange = (event: any) => {
    const { zoom } = event.properties;
    setZoomLevel(zoom);
  };

  // Optionally, clear any temporary mapCoordinates on mount.
  useEffect(() => {
    setMapCoordinates(null);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Custom Trips" />

      <View>
        <StartEndSearchBar
          defaultStart={startTripLocation || "Starting location"}
          defaultEnd={endTripLocation || "Destination"}
          onStartChange={(location, coords) => {
            setStartTripLocation(location);
            setStartTripCoordinates(coords);
            handleStartChange(location, coords);
          }}
          onEndChange={(location, coords) => {
            setEndTripLocation(location);
            setEndTripCoordinates(coords);
            handleEndChange(location, coords);
          }}
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
          centerCoordinate={mapCoordinates || [121.05, 14.63]}
          zoomLevel={zoomLevel}
          animationMode="easeTo"
        />

        {trip.start_coords && (
          <ShapeSource id="start-location" shape={featureCollection([point(trip.start_coords)])}>
            <SymbolLayer
              id="start-location-icon"
              style={{
                iconImage: "pin",
                iconSize: 0.1,
              }}
            />
            <SymbolLayer
              id="start-location-label"
              style={{
                textField: trip.start_location.split(",")[0],
                textSize: 11,
                textOffset: [0, 3],
              }}
            />
          </ShapeSource>
        )}

        {trip.end_coords && (
          <ShapeSource id="end-location" shape={featureCollection([point(trip.end_coords)])}>
            <SymbolLayer
              id="end-location-icon"
              style={{
                iconImage: "pin",
                iconSize: 0.1,
              }}
            />
            <SymbolLayer
              id="end-location-label"
              style={{
                textField: trip.end_location.split(",")[0],
                textSize: 11,
                textOffset: [0, 3],
              }}
            />
          </ShapeSource>
        )}

        {/* Optionally, show a marker at the pressed location */}
        {mapCoordinates && (
          <ShapeSource id="temp-location" shape={featureCollection([point(mapCoordinates)])}>
            <SymbolLayer
              id="temp-location-icon"
              style={{
                iconImage: "pin",
                iconSize: 0.1,
              }}
            />
          </ShapeSource>
        )}

        <Images images={{ pin }} />
      </MapView>

      <View className="z-50 p-5 absolute bottom-0 w-1/2 self-center">
        <PrimaryButton label="Confirm" onPress={handleConfirmLocation} />
      </View>
    </SafeAreaView>
  );
}
