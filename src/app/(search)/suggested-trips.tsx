import React from "react";
import { Text, SafeAreaView, View, Pressable } from "react-native";

import { useRouter } from "expo-router";

import Header from "../../components/ui/Header";
import TripPreview from "../../components/ui/TripPreview";

export default function SuggestedTrips() {
  const router = useRouter();

  const handlePress = () => {
    router.push("/(search)/trip-overview");
  };

  return (
    <SafeAreaView className="flex-1">
      <View>
        <Header title="Suggested Trips" />
      </View>
      <View className="flex-1 p-4">
        <Pressable onPress={handlePress}>
          <TripPreview />
        </Pressable>
        <Pressable onPress={handlePress}>
          <TripPreview />
        </Pressable>
        <Pressable onPress={handlePress}>
          <TripPreview />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
