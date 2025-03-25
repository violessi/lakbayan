import React from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";

interface RouteItemProps {
  segment: CreateSegmentV2;
  color: string;
}

export default function RouteItem({ segment, color }: RouteItemProps) {
  const estimatedTime = Math.floor(segment.duration / 60);

  return (
    <View className="rounded-b-3xl overflow-hidden border border-gray-200 shadow-sm bg-white w-full">
      <View style={{ backgroundColor: color, height: 6 }} />

      <View className="py-5 px-12 flex flex-col gap-3">
        <View className="flex-row gap-7 items-start">
          <View className="w-3/12 flex-col justify-end gap-3">
            <Text className="text-lg font-extrabold" style={{ textAlign: "right" }}>
              {segment.segmentMode}
            </Text>
          </View>
          <View className="w-6/12 flex-col justify-end gap-3">
            <Text className="text-lg font-bold text-black">{segment.segmentName}</Text>
          </View>
          <View className="w-3/12 flex-row items-center">
            <Text className="text-lg font-bold text-black">{estimatedTime} min</Text>
          </View>
        </View>

        <View className="flex-row gap-7 items-start">
          <View className="w-3/12 flex-col justify-end gap-3">
            <View className="flex flex-col gap-1">
              <Text className="text-xs uppercase text-secondary" style={{ textAlign: "right" }}>
                Get On
              </Text>
            </View>
          </View>
          <View className="w-6/12 flex-col justify-end gap-3">
            <View className="flex flex-col gap-1">
              <Text className="font-medium text-sm">{segment.startLocation.split(",")[0]}</Text>
            </View>
          </View>
          <View className="w-3/12 flex-row items-center"></View>
        </View>

        <View className="flex-row gap-7 items-start">
          <View className="w-3/12 flex-col justify-end gap-3">
            <View className="flex flex-col gap-1">
              <Text className="text-xs uppercase text-secondary" style={{ textAlign: "right" }}>
                Get Off
              </Text>
            </View>
          </View>
          <View className="w-6/12 flex-col justify-end gap-3">
            <View className="flex flex-col gap-1">
              <Text className="font-medium text-sm">{segment.endLocation.split(",")[0]}</Text>
            </View>
          </View>
          <View className="w-3/12 flex-row items-center"></View>
        </View>

        <Text className="text-secondary text-md" style={{ textAlign: "center" }}>
          {segment.landmark}
        </Text>
      </View>
    </View>
  );
}
