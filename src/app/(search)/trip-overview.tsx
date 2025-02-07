import React from "react";
import { Text, SafeAreaView, View } from "react-native";
import Mapbox, { MapView, Camera } from "@rnmapbox/maps";

import Header from "../../components/ui/Header";
import TripSummary from "../../components/search/TripSummary";

import { MAPBOX_ACCESS_TOKEN } from "@utils/mapbox-config";

export default function TripOverview() {
  return (
    <SafeAreaView className="flex-1">
      <View>
        <Header title="Trip Overview" />
      </View>
      <MapView style={{ flex: 1 }} styleURL="mapbox://styles/mapbox/streets-v12" projection="mercator"></MapView>
      {/* <TripSummary startLocation="Start Location" endLocation="End Location" /> */}
    </SafeAreaView>
  );
}
