import React from "react";
import { View, Image } from "react-native";
import { Text } from "react-native-paper";
import { getImageSource } from "@utils/transpo-utils";

interface RouteItemProps {
  segment: CreateSegment;
  color: string;
}

export default function RouteItem({ segment, color }: RouteItemProps) {
  const estimatedTime = Math.floor(segment.duration / 60);

  return (
    <View className="rounded-b-3xl overflow-hidden border border-gray-200 shadow-sm bg-white w-full mb-3">
      <View style={{ backgroundColor: color, height: 6 }} />

      <View className="py-5 px-12 flex flex-col gap-3">
        <View className="flex-row gap-7 items-start">
          <View className="w-3/12 flex-row justify-end items-center gap-2">
            <Image
              source={getImageSource(segment.segmentMode)}
              style={{ width: 17, height: 17, tintColor: color }}
              resizeMode="contain"
            />
            <Text className="text-lg" style={{ textAlign: "right", fontWeight: "bold" }}>
              {segment.segmentMode}
            </Text>
          </View>
          <View className="w-6/12 flex-col justify-end gap-3">
            <Text className="text-lg font-bold text-black">
              {segment.segmentName.toLowerCase().includes("walk") ? "Walk" : segment.segmentName}
            </Text>
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
              <Text className="font-medium text-sm">{segment.startLocation}</Text>
            </View>
          </View>
          <View className="w-3/12 flex-row items-center">
            <Text className="text-md font-bold text-black">₱{segment.cost.toFixed(2)}</Text>
          </View>
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
              <Text className="font-medium text-sm">{segment.endLocation}</Text>
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
