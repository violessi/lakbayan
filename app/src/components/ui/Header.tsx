import React from "react";
import { router } from "expo-router";

import { TouchableOpacity, View, StyleSheet, Image } from "react-native";
import { Text } from "react-native-paper";

const back = require("@assets/left-arrow.png");

interface HeaderProps {
  title: string;
  subtitle?: string;
  hasBack?: boolean;
}

export default function Header({ title, subtitle, hasBack = true }: HeaderProps) {
  return (
    <View className="h-24 bg-primary px-5 py-5 flex-col justify-end">
      <View className="flex-row gap-3 items-center">
        {hasBack && (
          <TouchableOpacity onPress={() => router.back()}>
            <Image source={back} className="w-5 h-5" />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{title}</Text>
      </View>
      <View>{subtitle && <Text className="text-white text-sm">{subtitle}</Text>}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  textWhite: {
    color: "#ffffff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
});
