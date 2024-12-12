import React from "react";
import { router } from "expo-router";

import { TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <View className="h-50 bg-primary px-5 py-5">
      <View className="flex-row items-center p-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-blue-500">Backsies</Text>
        </TouchableOpacity>
      </View>
      <View>
        <Text className="text-white text-lg font-bold">{title}</Text>
        {subtitle && <Text className="text-white text-sm">{subtitle}</Text>}
      </View>
    </View>
  );
}
