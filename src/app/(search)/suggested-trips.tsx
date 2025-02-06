import React from "react";
import { Text, SafeAreaView, View } from "react-native";

import Header from "../../components/ui/Header";
import TripPreview from "../../components/ui/TripPreview";

export default function Contribute() {
  return (
    <SafeAreaView className="flex-1">
      <View>
        <Header title="Suggested Trips" />
      </View>
      <View className="flex-1 p-4">
        <TripPreview />
      </View>
    </SafeAreaView>
  );
}
