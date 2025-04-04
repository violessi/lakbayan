import React from "react";
import * as ExpoLocation from "expo-location";
import { Text, View, Image, TouchableOpacity, Alert } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

import { useTransitJournal } from "@contexts/TransitJournal";

const reportOptions = [
  { label: "Traffic", image: require("@assets/report-traffic.png") },
  { label: "Long Line", image: require("@assets/report-lines.png") },
  { label: "Disruption", image: require("@assets/report-disruption.png") },
];

export default function ReportTab() {
  const snapPoints = ["15%", "20%", "40%", "72%"];

  const { addLiveUpdate } = useTransitJournal();

  const handleReportPress = async (type: string) => {
    const location = await ExpoLocation.getCurrentPositionAsync({});
    const coordinate: Coordinates = [location.coords.longitude, location.coords.latitude];

    Alert.alert("Send Live Update", `Report ${type} at your current location?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Send Live Update",
        onPress: () => addLiveUpdate({ type, coordinate }),
      },
    ]);
  };

  return (
    <BottomSheet snapPoints={snapPoints} index={2}>
      <BottomSheetView className="flex flex-col px-5 gap-6">
        <View className="flex flex-row justify-between">
          <Text className="font-bold text-lg">How's the trip?</Text>
        </View>
        <View className="flex flex-row justify-between px-12">
          {reportOptions.map(({ label, image }) => {
            return (
              <TouchableOpacity
                key={label}
                onPress={() => handleReportPress(label)}
                className={`border rounded py-5 w-24 items-center border-gray-200"
                }`}
              >
                <Image
                  source={image}
                  className="w-7 h-7 mb-2"
                  resizeMode="contain"
                  style={{ tintColor: "#9CA3AF" }} // Purple when selected, gray when not
                />
                <Text className={`text-secondary text-sm`}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
