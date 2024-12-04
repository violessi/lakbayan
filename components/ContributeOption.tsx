import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";

interface OptionProps {
  title: string;
  description: string;
  link: any;
}

const Option = ({ title, description, link }: OptionProps) => {
  return (
    <View className="flex-row justify-between items-center mb-4">
      <View>
        <Text className="text-lg font-bold">{title}</Text>
        <Text className="text-sm">{description}</Text>
      </View>
      <TouchableOpacity onPress={() => router.push(link)}>
        <Text className="text-blue-500">Click</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Option;
