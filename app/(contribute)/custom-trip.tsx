import React from "react";
import { Text, SafeAreaView, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";

export default function CustomTrip() {
  return (
    <SafeAreaView className="flex-1">
      <View className="flex-row items-center p-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-blue-500">Back</Text>
        </TouchableOpacity>
      </View>
      <View className="flex-1 items-center justify-center">
        <Text className="text-lg font-bold">Custom Trips</Text>
      </View>
    </SafeAreaView>
  );
}
