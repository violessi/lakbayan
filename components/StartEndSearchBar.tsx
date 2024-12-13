import React, { useState } from "react";

import { View, Text } from "react-native";
import { TextInput, List, IconButton } from "react-native-paper";

import LocationSearchBar from "./LocationSearchBar";

import Mapbox from "@rnmapbox/maps";
import { MAPBOX_ACCESS_TOKEN } from "../utils/mapbox-config";
Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

interface StartEndSearchBarProps {
  onStartSelect: (longitude: number, latitude: number) => void;
  onEndSelect: (longitude: number, latitude: number) => void;
  onStartClear: () => void;
  onEndClear: () => void;
}

export default function StartEndSearchBar({
  onStartSelect,
  onEndSelect,
  onStartClear,
  onEndClear,
}: StartEndSearchBarProps) {
  return (
    <View className="flex">
      <LocationSearchBar
        onSuggestionSelect={onStartSelect}
        onClear={onStartClear}
      />
      <Text>asfsd</Text>
      <LocationSearchBar
        onSuggestionSelect={onEndSelect}
        onClear={onEndClear}
      />
    </View>
  );
}
