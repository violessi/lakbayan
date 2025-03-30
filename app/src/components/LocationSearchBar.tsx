import React, { useState } from "react";

import { View, FlatList, Keyboard } from "react-native";
import { TextInput, List, IconButton } from "react-native-paper";

import { fetchSuggestions } from "@services/mapbox-service";

import Mapbox from "@rnmapbox/maps";
import { MAPBOX_ACCESS_TOKEN } from "../utils/mapbox-config";
Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

interface LocationSearchBarProps {
  onSuggestionSelect: (longitude: number, latitude: number) => void;
  onClear: () => void;
}

export default function LocationSearchBar({ onSuggestionSelect, onClear }: LocationSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const handleFetchSuggestions = async (text: string) => {
    const response = await fetchSuggestions(text);
    setSuggestions(response);
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
            handleFetchSuggestions(text);
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
            data={suggestions.slice(0, 8)}
            keyExtractor={(item) => item.id}
            style={{ paddingTop: 10, paddingBottom: 10 }}
            renderItem={({ item }) => (
              <List.Item
                title={item.place_name}
                description={item.address || ""}
                titleStyle={{ fontSize: 13, fontWeight: "bold", color: "#333" }}
                descriptionStyle={{ fontSize: 11, color: "gray" }}
                style={{ height: 45 }}
                onPress={() => handleSuggestionPress(item)}
              />
            )}
          />
        )}
      </View>
    </View>
  );
}
