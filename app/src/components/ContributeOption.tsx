import React from "react";
import { Text, View, TouchableOpacity, Image, ImageSourcePropType } from "react-native";
import { router, Route } from "expo-router";

const nextIcon = require("@assets/next-filled.png");

interface OptionProps {
  title: string;
  description: string;
  link: Route;
  icon: ImageSourcePropType;
}

const Option = ({ title, description, link, icon }: OptionProps) => {
  return (
    <TouchableOpacity
      onPress={() => router.push(link)}
      className="flex-row items-center justify-between mx-4 border-b border-gray-200 py-6"
    >
      <View className="flex-row justify-between items-center w-full">
        <View className="flex-col gap-1 w-10/12">
          <View className="flex-row items-center">
            <Image source={icon} className="w-6 h-6 mr-2" resizeMode="contain" style={{ tintColor: "#7F55D9" }} />
            <Text className="text-xl font-bold">{title}</Text>
          </View>
          <View className="flex-row">
            <Text className="text-md text-[#474747]">{description}</Text>
          </View>
        </View>
        <Image source={nextIcon} className="w-8 h-8" resizeMode="contain" />
      </View>
    </TouchableOpacity>
  );
};

export default Option;
