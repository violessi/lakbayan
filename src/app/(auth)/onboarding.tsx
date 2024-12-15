import { router } from "expo-router";
import { Text, View, SafeAreaView, TouchableOpacity } from "react-native";

export default function Onboarding() {
  return (
    <SafeAreaView className="flex h-full items-center justify-between">
      <TouchableOpacity
        className="bg-blue-500 p-2 rounded-md justify-end"
        onPress={() => router.replace("/(auth)/log-in")}
      >
        <Text>Skip</Text>
      </TouchableOpacity>
      <View className="flex h-full items-center justify-center">
        <Text className="text-pink-500">Onboarding!</Text>
      </View>
    </SafeAreaView>
  );
}
