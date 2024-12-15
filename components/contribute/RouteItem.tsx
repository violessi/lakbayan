import React from "react";

import { View } from "react-native";
import { Text } from "react-native-paper";

import { Route } from "@/types/route-types";

interface RouteItemProps {
  route: Route;
}

export default function RouteItem({ route }: RouteItemProps) {
  const estimatedTime = Math.floor(route.directions.routes[0].duration / 60);

  return (
    <View className="rounded-b-3xl overflow-hidden border border-gray-200 shadow-sm bg-white w-full">
      <View className="bg-red-600 h-1.5" />

      <View className="py-5 px-12 flex flex-col gap-3">
        <View className="flex-row gap-7 items-start">
          <View className="w-3/12 flex-col justify-end gap-3">
            <Text className="text-lg font-extrabold" style={{ textAlign: "right" }}>
              {route.transportationMode}
            </Text>
          </View>
          <View className="w-6/12 flex-col justify-end gap-3">
            <Text className="text-lg font-bold text-black">{route.routeName}</Text>
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
              <Text className="font-medium text-sm">{route.startLocation.split(",")[0]}</Text>
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
              <Text className="font-medium text-sm">{route.endLocation.split(",")[0]}</Text>
            </View>
          </View>
          <View className="w-3/12 flex-row items-center"></View>
        </View>

        <Text className="text-secondary text-md" style={{ textAlign: "center" }}>
          {route.landmark}
        </Text>
      </View>
    </View>
  );
}
