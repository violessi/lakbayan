import React, { useState, useMemo, useCallback, useRef } from "react";
import { View, Text, Pressable } from "react-native";

import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Checkbox, Modal, Menu, RadioButton } from "react-native-paper";

import PrimaryButton from "@components/ui/PrimaryButton";

interface Props {
  onClose: () => void;
  filters: FilterState;
  applyFilters: (filters: FilterState) => void;
}

export default function FilterSearch({ onClose, filters, applyFilters }: Props) {
  const snapPoints = useMemo(() => ["55%"], []);
  const bottomSheetRef = useRef(null);

  const [timeToLeave, setTimeToLeave] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [sortBy, setSortBy] = useState(filters.sortBy);
  const [selectedModes, setSelectedModes] = useState(filters.transportModes);

  // Toggle transport mode selection
  const toggleTransportMode = (mode: string) => {
    setSelectedModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode],
    );
  };

  const handleApplyFilters = () => {
    applyFilters({ sortBy, transportModes: selectedModes });
    onClose();
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      index={0}
      enablePanDownToClose
      onClose={handleApplyFilters}
    >
      <BottomSheetView className="flex flex-col px-5 gap-3">
        {/* Header */}
        <View className="flex-row items-center gap-2">
          <Text className="text-xl font-bold">Filter trips</Text>
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
