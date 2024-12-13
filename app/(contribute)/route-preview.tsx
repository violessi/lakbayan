import { useLocalSearchParams } from "expo-router";
import { Text, SafeAreaView, View } from "react-native";

import Header from "@/components/ui/Header";

export default function RoutePreview() {
  const { startLocation, startCoordinates, endLocation, endCoordinates } =
    useLocalSearchParams();

  const startCoords = JSON.parse(startCoordinates as string);
  const endCoords = JSON.parse(endCoordinates as string);

  return (
    <SafeAreaView>
      <Header title="Route Preview" />
      <View>
        <Text>Start Location: {startLocation}</Text>
        <Text>Start Coordinates: {startCoords}</Text>
        <Text>End Location: {endLocation}</Text>
        <Text>End Coordinates: {endCoords}</Text>
      </View>
    </SafeAreaView>
  );
}
