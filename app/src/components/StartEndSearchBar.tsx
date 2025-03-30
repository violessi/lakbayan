import React, { useState } from "react";
import { View, FlatList, Keyboard } from "react-native";
import { TextInput, List, IconButton } from "react-native-paper";
import { fetchSuggestions } from "@services/mapbox-service";

import Mapbox from "@rnmapbox/maps";
import { MAPBOX_ACCESS_TOKEN } from "../utils/mapbox-config";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

interface StartEndSearchProps {
  onStartChange?: (location: string, coordinates: [number, number]) => void;
  onEndChange: (location: string, coordinates: [number, number]) => void;
  defaultStart?: string | null;
  isStartActive?: boolean;
  defaultEnd?: string | null;
}

export default function StartEndSearch({
  onStartChange,
  onEndChange,
  defaultStart = null,
  isStartActive = true,
  defaultEnd = null,
}: StartEndSearchProps) {
  const [startSearchQuery, setStartSearchQuery] = useState("");
  const [endSearchQuery, setEndSearchQuery] = useState("");
  const [startSuggestions, setStartSuggestions] = useState<Suggestion[]>([]);
  const [endSuggestions, setEndSuggestions] = useState<Suggestion[]>([]);

  const handleFetchSuggestions = async (text: string, type: "start" | "end") => {
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
    if (type === "start" && onStartChange) {
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
    <View>
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
          <IconButton icon="close" size={20} onPress={() => handleClearAll("start")} />
        )}
      </View>

      <View className="absolute top-16 left-0 z-50 mx-5 my-3 flex-row items-center bg-white rounded-[8]">
        <TextInput
          placeholder={defaultEnd || "Destination"}
          value={endSearchQuery}
          onChangeText={(text) => {
            setEndSearchQuery(text);
            handleFetchSuggestions(text, "end");
          }}
          dense={true}
          editable={true}
          underlineStyle={{
            display: "none",
          }}
          style={{ backgroundColor: "none", fontSize: 12, flex: 1 }}
        />
        <IconButton icon="close" size={20} onPress={() => handleClearAll("end")} />
      </View>
      <View className="absolute max-h-500 top-36 left-0 z-40 mx-5 items-center bg-white rounded-[8]">
        <View>
          {startSuggestions.length > 0 && (
            <View>
              <FlatList
                data={startSuggestions.slice(0, 8)}
                keyExtractor={(item) => item.id}
                style={{ paddingBottom: 10 }}
                renderItem={({ item }) => (
                  <List.Item
                    title={item.place_name}
                    description={item.address || ""}
                    titleStyle={{ fontSize: 13, fontWeight: "bold", color: "#333" }}
                    descriptionStyle={{ fontSize: 11, color: "gray" }}
                    style={{ height: 45 }}
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
                data={endSuggestions.slice(0, 8)}
                keyExtractor={(item) => item.id}
                style={{ paddingBottom: 10 }}
                renderItem={({ item }) => (
                  <List.Item
                    title={item.place_name}
                    description={item.address || ""}
                    titleStyle={{ fontSize: 13, fontWeight: "bold", color: "#333" }}
                    descriptionStyle={{ fontSize: 11, color: "gray" }}
                    style={{ height: 45 }}
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
