import React from "react";
import { Text, SafeAreaView, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";

import Mapbox, { MapView, Camera, LocationPuck } from "@rnmapbox/maps";
import { MAPBOX_ACCESS_TOKEN } from "../../utils/mapbox-config";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function TodaStops() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="h-50 bg-primary px-5 py-5">
        <View className="flex-row items-center p-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-blue-500">Back</Text>
          </TouchableOpacity>
        </View>
        <Text className="text-white text-lg font-bold">Pin Tricycle Stops</Text>
      </View>
      <MapView
        style={{ flex: 1 }}
        styleURL="mapbox://styles/mapbox/streets-v12"
      >
        <Camera followZoomLevel={13} followUserLocation />
        <LocationPuck />
      </MapView>
    </SafeAreaView>
  );
}
