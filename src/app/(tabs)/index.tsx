import React, { useState } from "react";
import { Text, Image, View, SafeAreaView, Pressable } from "react-native";
import { TextInput } from "react-native-paper";
import Mapbox, { MapView, Camera, LocationPuck } from "@rnmapbox/maps";
import { MAPBOX_ACCESS_TOKEN } from "../../utils/mapbox-config";

import { useRouter } from "expo-router";

import RecentTrips from "@components/search/RecentTrips";
import Header from "@components/ui/Header";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function Index() {
  const router = useRouter();

  const handleTextInputFocus = () => {
    router.push("/(search)/location-input");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Hi, user!" hasBack={false} />
      <View>
        <Pressable
          onPress={handleTextInputFocus}
          className="absolute z-50 m-5 w-[90%] h-12 flex-row items-center bg-white rounded-lg px-4"
        >
          <Image
            source={require("../../assets/search.png")}
            style={{ width: 15, height: 15, marginRight: 10 }}
            resizeMode="contain"
          />
          <Text style={{ fontSize: 12, color: "#888" }}>Where are we off to today?</Text>
        </Pressable>
      </View>
      <MapView style={{ flex: 1 }} styleURL="mapbox://styles/mapbox/streets-v12">
        <Camera followZoomLevel={12} followUserLocation />
        <LocationPuck />
      </MapView>

      <RecentTrips />
    </SafeAreaView>
  );
}
