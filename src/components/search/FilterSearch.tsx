import React, { useState, useMemo, useCallback, useRef } from "react";
import { View, Text, Pressable } from "react-native";

import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Checkbox, Button, Menu } from "react-native-paper";

import PrimaryButton from "@components/ui/PrimaryButton";

export default function FilterSearch({ onClose, filters, setFilters }) {
  const snapPoints = useMemo(() => ["50%"], []);
  const bottomSheetRef = useRef(null);

  const [timeToLeave, setTimeToLeave] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);

  const [sortBy, setSortBy] = useState(filters.sortBy);
  const [selectedModes, setSelectedModes] = useState(filters.transportModes);

  // Toggle transport mode selection
  const toggleTransportMode = (mode) => {
    setSelectedModes((prev) => (prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]));
  };

  const handleApplyFilters = () => {
    setFilters({ sortBy, transportModes: selectedModes });
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
          <Pressable onPress={() => setShowTimePicker(true)} className="p-2 border border-gray-300 rounded">
            <Text>{timeToLeave.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text>
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
          <Menu
            visible={sortMenuVisible}
            onDismiss={() => setSortMenuVisible(false)}
            anchor={
              <Pressable onPress={() => setSortMenuVisible(true)} className="p-2 border border-gray-300 rounded">
                <Text>{sortBy}</Text>
              </Pressable>
            }
          >
            <Menu.Item onPress={() => setSortBy("Verified by moderators")} title="Verified by moderators" />
            <Menu.Item onPress={() => setSortBy("Verified by GPS")} title="Verified by GPS" />
            <Menu.Item onPress={() => setSortBy("Votes")} title="Votes" />
          </Menu>
        </View>

        <View>
          {["Trains", "Bus", "Jeep", "UV Express", "Tricycle"].map((mode) => (
            <Pressable key={mode} onPress={() => toggleTransportMode(mode)}>
              <Checkbox status={selectedModes.includes(mode) ? "checked" : "unchecked"} />
              <Text>{mode}</Text>
            </Pressable>
          ))}
        </View>

        <PrimaryButton label="Apply filters" onPress={handleApplyFilters} />
      </BottomSheetView>
    </BottomSheet>
  );
}
