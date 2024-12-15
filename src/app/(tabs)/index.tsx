import React from "react";
import { Text, View, SafeAreaView } from "react-native";
import Mapbox, { MapView, Camera, LocationPuck } from "@rnmapbox/maps";
import { MAPBOX_ACCESS_TOKEN } from "../../utils/mapbox-config";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function Index() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="h-20 bg-primary px-5 py-5">
        <Text className="text-white text-lg font-bold">Hi, user!</Text>
      </View>
      <MapView style={{ flex: 1 }} styleURL="mapbox://styles/mapbox/streets-v12">
        <Camera followZoomLevel={13} followUserLocation />
        <LocationPuck />
      </MapView>
    </SafeAreaView>
  );
}
