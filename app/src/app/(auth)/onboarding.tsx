import { router } from "expo-router";
import { Text, View, SafeAreaView, TouchableOpacity } from "react-native";

export default function Onboarding() {
  return (
    <SafeAreaView className="flex h-full items-center justify-between">
      <TouchableOpacity className="px-5 py-3 rounded-lg justify-end" onPress={() => router.replace("/(auth)/log-in")}>
        <Text className="text-primary font-bold border-b border-primary">Skip</Text>
      </TouchableOpacity>
      <View className="flex h-full items-center justify-center">
        <Text className="text-pink-500">Onboarding!</Text>
      </View>
    </SafeAreaView>
  );
}
