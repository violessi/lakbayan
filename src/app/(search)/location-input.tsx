import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";

import { Text, SafeAreaView, View } from "react-native";
import Option from "../../components/ContributeOption";

import Header from "../../components/ui/Header";

import StartEndSearchBar from "@components/StartEndSearchBar";

export default function Contribute() {
  const [startLocation, setStartLocation] = useState("");
  const [startCoordinates, setStartCoordinates] = useState([0, 0]);
  const [endLocation, setEndLocation] = useState("");
  const [endCoordinates, setEndCoordinates] = useState([0, 0]);

  const router = useRouter();

  const handleStartChange = (location: string, coordinates: [number, number]) => {
    setStartLocation(location);
    setStartCoordinates(coordinates);
  };

  const handleEndChange = (location: string, coordinates: [number, number]) => {
    setEndLocation(location);
    setEndCoordinates(coordinates);
  };

  useEffect(() => {
    if (startLocation && endLocation) {
      router.push({
        pathname: "/(search)/suggested-trips",
        params: {
          startLocation,
          endLocation,
          startCoords: JSON.stringify(startCoordinates),
          endCoords: JSON.stringify(endCoordinates),
        },
      });
    }
  }, [startLocation, endLocation, router, startCoordinates, endCoordinates]);

  return (
    <SafeAreaView className="flex-1">
      <Header title="Where are we off to today?" />
      <View>
        <StartEndSearchBar onStartChange={handleStartChange} onEndChange={handleEndChange} />
      </View>
    </SafeAreaView>
  );
}
