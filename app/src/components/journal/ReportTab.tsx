import React, { useState } from "react";
import { Text, View, Image, TouchableOpacity } from "react-native";

import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

const reportOptions = [
  { label: "Traffic", image: require("@assets/report-traffic.png") },
  { label: "Long Line", image: require("@assets/report-lines.png") },
  { label: "Disruption", image: require("@assets/report-disruption.png") },
];

export default function ReportTab() {
  const snapPoints = ["15%", "20%", "40%", "72%"];
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const toggleSelection = (label: string) => {
    setSelectedOptions((prev) => (prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]));
  };

  return (
    <BottomSheet snapPoints={snapPoints} index={2}>
      <BottomSheetView className="flex flex-col px-5 gap-6">
        <View className="flex flex-row justify-between">
          <Text className="font-bold text-lg">How's the trip?</Text>
        </View>
        <View className="flex flex-row justify-between px-12">
          {reportOptions.map(({ label, image }) => {
            const isSelected = selectedOptions.includes(label);
            return (
              <TouchableOpacity
                key={label}
                onPress={() => toggleSelection(label)}
                className={`border rounded py-5 w-24 items-center ${
                  isSelected ? "border-primary bg-primary/10" : "border-gray-200"
                }`}
              >
                <Image
                  source={image}
                  className="w-7 h-7 mb-2"
                  resizeMode="contain"
                  style={{ tintColor: isSelected ? "#6D28D9" : "#9CA3AF" }} // Purple when selected, gray when not
                />
                <Text className={`${isSelected ? "text-primary" : "text-secondary"} text-sm`}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
