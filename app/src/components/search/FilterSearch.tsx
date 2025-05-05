import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Checkbox, RadioButton } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import PrimaryButton from "@components/ui/PrimaryButton";

interface Props {
  sheetRef: React.RefObject<BottomSheet>;
  filters: FilterState;
  applyFilters: (filters: FilterState) => void;
}

export default function FilterSearch({ sheetRef, filters, applyFilters }: Props) {
  const snapPoints = ["60%"];

  const [showTimePicker, setShowTimePicker] = useState(false);

  const [timeToLeave, setTimeToLeave] = useState(filters.timeToLeave);
  const [sortBy, setSortBy] = useState(filters.sortBy);
  const [selectedModes, setSelectedModes] = useState(filters.transportModes);

  const hasAppliedRef = React.useRef(false);

  // Toggle transport mode selection
  const toggleTransportMode = (mode: string) => {
    setSelectedModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode],
    );
  };

  // Apply filters only if changed, then close the sheet
  const handleApplyFilters = () => {
    const isSortSame = sortBy === filters.sortBy;
    const areModesSame =
      selectedModes.length === filters.transportModes.length &&
      selectedModes.every((m) => filters.transportModes.includes(m));

    const isTimeSame = timeToLeave.getTime() === filters.timeToLeave.getTime();

    const isUnchanged = isSortSame && areModesSame && isTimeSame;
    if (!isUnchanged) {
      applyFilters({ timeToLeave, sortBy, transportModes: selectedModes });
    }
    hasAppliedRef.current = true; // <— mark as handled
    sheetRef.current?.close();
  };

  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={snapPoints}
      index={-1}
      enablePanDownToClose
      onClose={() => {
        if (!hasAppliedRef.current) handleApplyFilters();
        hasAppliedRef.current = false; // reset for next open
      }}
    >
      <BottomSheetView className="flex flex-col px-5 pb-8 gap-3">
        <View className="flex-row items-center gap-2">
          <Text className="text-xl font-bold">Filter & sort trips</Text>
        </View>

        <View>
          <Text className="text-gray-600">Time to leave</Text>
          <Pressable
            onPress={() => setShowTimePicker(true)}
            className="p-2 border border-gray-300 rounded"
          >
            <Text>
              {timeToLeave.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </Text>
          </Pressable>
          {showTimePicker && (
            <DateTimePicker
              value={timeToLeave}
              mode="time"
              display="spinner"
              onChange={(event, selectedTime) => {
                setShowTimePicker(false);
                if (selectedTime) setTimeToLeave(selectedTime);
              }}
            />
          )}
        </View>

        <View>
          <Text className="text-gray-600">Sort by</Text>
          <RadioButton.Group onValueChange={setSortBy} value={sortBy}>
            <View className="flex-row items-center">
              <RadioButton value="Verified by moderators" />
              <Text>Verified by moderators</Text>
            </View>
            <View className="flex-row items-center">
              <RadioButton value="Verified by GPS" />
              <Text>Verified by GPS</Text>
            </View>
            <View className="flex-row items-center">
              <RadioButton value="Votes" />
              <Text>Votes</Text>
            </View>
            <View className="flex-row items-center">
              <RadioButton value="Duration" />
              <Text>Duration</Text>
            </View>
          </RadioButton.Group>
        </View>

        <View>
          {["Train", "Bus", "Jeep", "UV", "Tricycle"].map((mode) => (
            <Pressable key={mode} onPress={() => toggleTransportMode(mode)}>
              <View className="flex-row items-center gap-2">
                <Checkbox status={selectedModes.includes(mode) ? "checked" : "unchecked"} />
                <Text>{mode}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <PrimaryButton label="Apply filters" onPress={handleApplyFilters} />
      </BottomSheetView>
    </BottomSheet>
  );
}
