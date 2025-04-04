import { Button, SafeAreaView, Text } from "react-native";
import { useRouter } from "expo-router";

export default function NotFound() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 justify-center items-center">
      <Text>No active trip found.</Text>
      <Button title="Go back" onPress={() => router.push("/(tabs)")} />
    </SafeAreaView>
  );
}
