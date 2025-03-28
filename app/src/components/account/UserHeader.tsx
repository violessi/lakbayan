import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";

const back = require("@assets/left-arrow.png");

interface UserHeaderProps {
  username: string;
  role: string;
  points: number;
  joinedDate: string | null;
  hasBack?: boolean;
}

export default function UserHeader({
  username,
  role,
  points,
  joinedDate,
  hasBack = false,
}: UserHeaderProps) {
  return (
    <View className="h-24 bg-primary px-5 pb-3 flex flex-row justify-between items-end">
      <View className="flex flex-row gap-3 items-center">
        {hasBack && (
          <TouchableOpacity onPress={() => router.back()}>
            <Image source={back} className="w-5 h-5" />
          </TouchableOpacity>
        )}
        <View>
          <Text className="text-white text-2xl font-bold">{username}</Text>
          <Text className="text-white text-sm">
            {role ? role.charAt(0).toUpperCase() + role.slice(1) : ""}
          </Text>
        </View>
      </View>
      <View>
        <Text className="text-white text-lg font-bold">{points} points</Text>
        <Text className="text-white text-xs">Joined {joinedDate}</Text>
      </View>
    </View>
  );
}
