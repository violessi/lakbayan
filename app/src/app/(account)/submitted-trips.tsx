import React from "react";
import { SafeAreaView, View, Text } from "react-native";

import Header from "@components/ui/Header";

export default function SubmittedTrips() {
  return (
    <SafeAreaView className="flex-1">
      <Header title="Submitted Trips" />
      <View className="flex-1 p-4">
        <Text>Test</Text>
      </View>
    </SafeAreaView>
  );
}
