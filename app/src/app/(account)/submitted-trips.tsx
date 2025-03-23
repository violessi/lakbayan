import React from "react";
import { SafeAreaView, View, Text } from "react-native";

import { useSession } from "@contexts/SessionContext";

import Header from "@components/ui/Header";

export default function SubmittedTrips() {
  const { userId } = useSession();

  return (
    <SafeAreaView className="flex-1">
      <Header title="Submitted Trips" />
      <View className="flex-1 p-4">
        <Text>Test</Text>
      </View>
    </SafeAreaView>
  );
}
