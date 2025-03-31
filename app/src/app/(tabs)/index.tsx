import { useRouter } from "expo-router";
import * as ExpoLocation from "expo-location";
import React, { useEffect, useState } from "react";
import Mapbox, { MapView, Camera, LocationPuck, Images as MapImage } from "@rnmapbox/maps";
import { Text, Image, View, SafeAreaView, Pressable } from "react-native";

import trafficIcon from "@assets/report-traffic.png";
import lineIcon from "@assets/report-lines.png";
import disruptionIcon from "@assets/report-disruption.png";

import LiveUpdateMarker from "@components/map/LiveUpdateMarker";
import Header from "@components/ui/Header";
import RecentTrips from "@components/search/RecentTrips";
import { fetchNearbyLiveUpdates } from "@services/trip-service-v2";

import { MAPBOX_ACCESS_TOKEN } from "../../utils/mapbox-config";
Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function Index() {
  const router = useRouter();
  const [liveUpdates, setLiveUpdates] = useState<LiveUpdate[]>([]);

  const handleTextInputFocus = () => {
    router.push("/(search)/1-search-trip");
  };

  useEffect(() => {
    // TODO: make this to an onChangeListener
    const fetchLiveUpdates = async () => {
      const location = await ExpoLocation.getCurrentPositionAsync({});
      const coordinates: Coordinates = [location.coords.longitude, location.coords.latitude];
      try {
        // Fetch live updates within 10km radius
        const data = await fetchNearbyLiveUpdates(coordinates, 10000);
        setLiveUpdates(data);
      } catch (error) {
        console.error("Error fetching live updates", error);
      }
    };

    fetchLiveUpdates();
  }, []);

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
        {liveUpdates.map((update) => (
          <LiveUpdateMarker
            key={update.id}
            id={update.id}
            type={update.type}
            coordinates={update.coordinate}
          />
        ))}
        <MapImage
          images={{ Traffic: trafficIcon, Disruption: disruptionIcon, "Long Line": lineIcon }}
        />
      </MapView>
      <RecentTrips />
    </SafeAreaView>
  );
}
