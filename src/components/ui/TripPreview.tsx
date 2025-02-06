import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { Text } from "react-native-paper";

const verifiedMod = require("@assets/verified-mod.png");
const verifiedGPS = require("@assets/verified-gps.png");
const upvote = require("@assets/social-upvote.png");
const downvote = require("@assets/social-downvote.png");
const comment = require("@assets/social-comment.png");

const jeep = require("@assets/transpo-jeep.png");
const bus = require("@assets/transpo-bus.png");
const train = require("@assets/transpo-train.png");
const tricycle = require("@assets/transpo-tricycle.png");
const uv = require("@assets/transpo-uv.png");
const walk = require("@assets/transpo-walk.png");

interface TripPreviewProps {
  route: Route;
  color: string; // Accept color as a prop
}

const testTranspo = ["Jeep", "Walk", "Train"];

const getImageSource = (mode: string) => {
  switch (mode) {
    case "Jeep":
      return jeep;
    case "Bus":
      return bus;
    case "Train":
      return train;
    case "Tricycle":
      return tricycle;
    case "UV":
      return uv;
    case "Walk":
      return walk;
    default:
      return null;
  }
};

export default function TripPreview() {
  return (
    <View className="w-full border-b border-gray-200 py-6 px-2">
      <View className="flex-row items-center">
        <View className="flex-1 items-center">
          <View className="flex-row items-center gap-1">
            {testTranspo.map((mode, index) => (
              <View key={index} className="flex-row items-center justify-center gap-1">
                <View className="flex-col items-center gap-1 text-sm">
                  <Text>{mode}</Text>
                  <Image source={getImageSource(mode)} style={{ width: 25, height: 25 }} resizeMode="contain" />
                </View>
                {index < testTranspo.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>
        <View className="flex-1 gap-1">
          <Text className="text-lg" style={{ fontWeight: 700 }}>
            Est. Travel Time:
          </Text>
          <View className="flex flex-row gap-3 items-center">
            <View className="flex flex-row gap-1">
              <Image source={verifiedMod} style={{ width: 20, height: 20 }} resizeMode="contain" />
              <Image source={verifiedGPS} style={{ width: 20, height: 20 }} resizeMode="contain" />
            </View>
            <View className="flex flex-row gap-1">
              <Image source={upvote} style={{ width: 14, height: 14 }} resizeMode="contain" />
              <Image source={downvote} style={{ width: 14, height: 14 }} resizeMode="contain" />
              <Image source={comment} style={{ width: 14, height: 14 }} resizeMode="contain" />
            </View>
          </View>
          {/* <Text>Traffic around this time</Text> */}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  divider: {
    width: 14,
    height: 1,
    backgroundColor: "#515151",
  },
});
