import React, { useState } from "react";
import { router } from "expo-router";

import {
  SafeAreaView,
  TouchableOpacity,
  View,
  FlatList,
  Keyboard,
} from "react-native";
import { Text, TextInput, List, IconButton } from "react-native-paper";

import Mapbox, { MapView, Camera } from "@rnmapbox/maps";
import { MAPBOX_ACCESS_TOKEN } from "../../utils/mapbox-config";
Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function TodaStops() {
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const handleMapPress = (event) => {
    const { geometry } = event;
    const { coordinates } = geometry;
    setCoordinates(coordinates);
  };

  const fetchSuggestions = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${MAPBOX_ACCESS_TOKEN}`
      );
      const data = await response.json();

      if (data.features) {
        setSuggestions(data.features);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const handleClearAll = () => {
    setSearchQuery("");
    setSuggestions([]);
    setCoordinates(null);
    Keyboard.dismiss();
  };

  const handleSuggestionPress = (feature) => {
    const [longitude, latitude] = feature.geometry.coordinates;
    setCoordinates([longitude, latitude]);
    setSearchQuery(feature.place_name);
    setSuggestions([]);
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Header */}
      <View className="h-50 bg-primary px-5 py-5">
        <View className="flex-row items-center p-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-blue-500">Back</Text>
          </TouchableOpacity>
        </View>
        <Text className="text-white text-lg font-bold">Pin Tricycle Stops</Text>
      </View>

      <View>
        <View className="absolute top-0 left-0 z-50 m-5 flex-row items-center bg-white rounded-[8]">
          <TextInput
            placeholder="Narrow down your search!"
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              fetchSuggestions(text);
            }}
            dense={true}
            underlineStyle={{
              display: "none",
            }}
            style={{ backgroundColor: "none", fontSize: 12, flex: 1 }}
          />
          <View className="ml-2">
            <IconButton icon="close" size={20} onPress={handleClearAll} />
          </View>
        </View>

        <View className="absolute max-h-500 top-20 left-0 z-40 mx-5 items-center bg-white rounded-[8]">
          {suggestions.length > 0 && (
            <FlatList
              data={suggestions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <List.Item
                  title={item.place_name}
                  titleStyle={{ fontSize: 11 }}
                  style={{ height: 40, paddingBottom: 0 }}
                  onPress={() => handleSuggestionPress(item)}
                />
              )}
            />
          )}
        </View>
      </View>

      <MapView
        style={{ flex: 1 }}
        styleURL="mapbox://styles/mapbox/streets-v12"
        onPress={handleMapPress}
      >
        <Camera
          followZoomLevel={16}
          centerCoordinate={coordinates || undefined}
          followUserLocation={!coordinates}
        />
      </MapView>
    </SafeAreaView>
  );
}
