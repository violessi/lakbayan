import React from "react";
import * as ExpoLocation from "expo-location";
import { Text, View, Image, TouchableOpacity, Alert } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

import { useTransitJournal } from "@contexts/TransitJournalContext";

type Report = { label: LiveUpdateType; image: any };
const reportOptions: Report[] = [
  { label: "Traffic", image: require("@assets/report-traffic.png") },
  { label: "Long Line", image: require("@assets/report-lines.png") },
  { label: "Disruption", image: require("@assets/report-disruption.png") },
];

export default function ReportTab() {
  const snapPoints = ["7"];

  const { addLiveUpdate } = useTransitJournal();

  const handleReportPress = async (type: LiveUpdateType) => {
    const location = await ExpoLocation.getCurrentPositionAsync({});
    const coordinate: Coordinates = [location.coords.longitude, location.coords.latitude];

    Alert.alert("Send Live Update", `Report ${type} at your current location?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Send Live Update", onPress: () => addLiveUpdate({ type, coordinate }) },
    ]);
  };

  return (
    <BottomSheet snapPoints={snapPoints} index={1}>
      <BottomSheetView className="flex flex-col px-6 pb-8 gap-4">
        <View className="flex flex-row justify-between">
          <Text className="font-bold text-xl">Send Live Updates</Text>
        </View>
        <View className="flex flex-row justify-center gap-4">
          {reportOptions.map(({ label, image }) => {
            return (
              <TouchableOpacity
                key={label}
                onPress={() => handleReportPress(label)}
                className={
                  "border border-primary rounded-xl w-20 aspect-square flex justify-center items-center"
                }
              >
                <Image
                  source={image}
                  className="size-6 mb-2"
                  resizeMode="contain"
                  style={{ tintColor: "#9CA3AF" }} // Purple when selected, gray when not
                />
                <Text className={`text-gray-600 text-sm`}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
