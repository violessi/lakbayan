import { View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export function SourceDestinationTitle({ start, end }: { start: string; end: string }) {
  return (
    <View className="px-4 pb-0 pt-5">
      <View className="flex-row items-center flex-wrap justify-center">
        <Text className="text-md font-bold flex-shrink">{start.split(",")[0]}</Text>
        <MaterialIcons name="arrow-forward" size={10} color="black" className="px-2" />
        <Text className="text-md font-bold flex-shrink">{end.split(",")[0]}</Text>
      </View>
    </View>
  );
}
