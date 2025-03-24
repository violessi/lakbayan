import React from "react";
import { View, Text } from "react-native";

interface UserHeaderProps {
  username: string;
  role: string;
  points: number;
  joinedDate: string;
}

export default function UserHeader({ username, role, points, joinedDate }: UserHeaderProps) {
  return (
    <View className="h-24 bg-primary px-5 pb-3 flex flex-row justify-between items-end">
      <View>
        <Text className="text-white text-2xl font-bold">{username}</Text>
        <Text className="text-white text-sm"> {role ? role.charAt(0).toUpperCase() + role.slice(1) : ""}</Text>
      </View>
      <View>
        <Text className="text-white text-lg font-bold">{points} points</Text>
        <Text className="text-white text-xs">Joined {joinedDate}</Text>
      </View>
    </View>
  );
}
