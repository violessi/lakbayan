import React, { useState } from "react";

import { View, FlatList, Keyboard } from "react-native";
import { TextInput, List, IconButton } from "react-native-paper";

import Mapbox from "@rnmapbox/maps";
import { MAPBOX_ACCESS_TOKEN } from "../utils/mapbox-config";
Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

interface LocationSearchBarProps {
  onSuggestionSelect: (longitude: number, latitude: number) => void;
  onClear: () => void;
}

export default function LocationSearchBar({
  onSuggestionSelect,
  onClear,
}: LocationSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const fetchSuggestions = async (query: any) => {
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
    onClear();
    Keyboard.dismiss();
  };

  const handleSuggestionPress = (feature: any) => {
    const [longitude, latitude] = feature.geometry.coordinates;
    setSearchQuery(feature.place_name);
    setSuggestions([]);
    onSuggestionSelect(longitude, latitude);
    Keyboard.dismiss();
  };

  return (
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
  );
}
