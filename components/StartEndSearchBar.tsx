import React, { useState } from "react";
import { View, FlatList, Keyboard, StyleSheet } from "react-native";
import { TextInput, List, IconButton } from "react-native-paper";
import { fetchSuggestions } from "@/services/mapbox-service";
import { Suggestion } from "@/types/location-types";

import Mapbox from "@rnmapbox/maps";
import { MAPBOX_ACCESS_TOKEN } from "../utils/mapbox-config";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

interface StartEndSearchProps {
  onStartChange: (location: string, coordinates: [number, number]) => void;
  onEndChange: (location: string, coordinates: [number, number]) => void;
  defaultStart?: string | null;
  isStartActive?: boolean;
}

export default function StartEndSearch({
  onStartChange,
  onEndChange,
  defaultStart = null,
  isStartActive = true,
}: StartEndSearchProps) {
  const [startSearchQuery, setStartSearchQuery] = useState("");
  const [endSearchQuery, setEndSearchQuery] = useState("");
  const [startSuggestions, setStartSuggestions] = useState<Suggestion[]>([]);
  const [endSuggestions, setEndSuggestions] = useState<Suggestion[]>([]);

  const handleFetchSuggestions = async (
    text: string,
    type: "start" | "end"
  ) => {
    const response = await fetchSuggestions(text);
    if (type === "start") {
      setStartSuggestions(response);
      setEndSuggestions([]);
    } else {
      setEndSuggestions(response);
      setStartSuggestions([]);
    }
  };

  const handleClearAll = (type: "start" | "end") => {
    if (type === "start") {
      setStartSearchQuery("");
      setStartSuggestions([]);
    } else {
      setEndSearchQuery("");
      setEndSuggestions([]);
    }
    Keyboard.dismiss();
  };

  const handleSuggestionPress = (feature: any, type: "start" | "end") => {
    const [longitude, latitude] = feature.geometry.coordinates;
    if (type === "start") {
      setStartSearchQuery(feature.place_name);
      setStartSuggestions([]);
      onStartChange(feature.place_name, [longitude, latitude]);
    } else {
      setEndSearchQuery(feature.place_name);
      setEndSuggestions([]);
      onEndChange(feature.place_name, [longitude, latitude]);
    }
    Keyboard.dismiss();
  };

  return (
    <View className="absolute top-0 left-0 z-40 m-5flex flex-col bg-white rounded-[8]">
      <View className="absolute top-0 left-0 z-50 m-5 flex-row items-center bg-white rounded-[8]">
        <TextInput
          placeholder={defaultStart || "Starting location"}
          value={startSearchQuery}
          onChangeText={(text) => {
            setStartSearchQuery(text);
            handleFetchSuggestions(text, "start");
          }}
          dense={true}
          editable={isStartActive}
          style={{ backgroundColor: "none", fontSize: 12, flex: 1 }}
        />
        {isStartActive && (
          <IconButton
            icon="close"
            size={20}
            onPress={() => handleClearAll("start")}
          />
        )}
      </View>

      <View className="absolute top-16 left-0 z-50 m-5 flex-row items-center bg-white rounded-[8]">
        <TextInput
          placeholder="Destination"
          value={endSearchQuery}
          onChangeText={(text) => {
            setEndSearchQuery(text);
            handleFetchSuggestions(text, "end");
          }}
          dense={true}
          underlineStyle={{
            display: "none",
          }}
          style={{ backgroundColor: "none", fontSize: 12, flex: 1 }}
        />
        <IconButton
          icon="close"
          size={20}
          onPress={() => handleClearAll("end")}
        />
      </View>
      <View className="absolute max-h-500 top-36 left-0 z-40 mx-5 items-center bg-white rounded-[8]">
        <View>
          {startSuggestions.length > 0 && (
            <View>
              <FlatList
                data={startSuggestions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <List.Item
                    title={item.place_name}
                    titleStyle={{ fontSize: 11 }}
                    style={{ height: 40, paddingBottom: 0 }}
                    onPress={() => handleSuggestionPress(item, "start")}
                  />
                )}
              />
            </View>
          )}
        </View>
        <View>
          {endSuggestions.length > 0 && (
            <View>
              <FlatList
                data={endSuggestions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <List.Item
                    title={item.place_name}
                    titleStyle={{ fontSize: 11 }}
                    style={{ height: 40, paddingBottom: 0 }}
                    onPress={() => handleSuggestionPress(item, "end")}
                  />
                )}
              />
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
