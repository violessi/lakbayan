import React, { useState } from "react";
import { Text, View, Alert, Keyboard } from "react-native";
import { Dialog, Portal, Button } from "react-native-paper";
import { z } from "zod";

import uuid from "react-native-uuid";

import OutlinedTextInput from "@components/ui/OutlinedTextInput";
import PrimaryButton from "@components/ui/PrimaryButton";
import SecondaryButton from "@components/ui/SecondaryButton";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

import { insertStop } from "@services/toda-stop-service";
import { useSession } from "@contexts/SessionContext";

const todaStopSchema = z.object({
  name: z.string().min(1, "Please provide a name for the TODA stop!"),
  color: z.string().min(1, "Provide a color for the TODA stop!"),
  landmark: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  transpo_mode: z.literal("tricycle"),
  contributor_id: z.string().optional(),
});

const TODA_COLORS = ["Red", "Blue", "Green", "Yellow", "Black", "White", "None"];

interface TodaStopsProps {
  coordinates: Coordinates | null;
  onNewStopAdded: () => void;
}

export default function TodaStops({ coordinates, onNewStopAdded }: TodaStopsProps) {
  const { user } = useSession();
  const [form, setForm] = useState({ todaName: "", color: "", landmark: "" });
  const [dialogVisible, setDialogVisible] = useState(false);

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm({ todaName: "", color: "", landmark: "" });
    Keyboard.dismiss();
  };

  const handleSubmit = async () => {
    if (!coordinates) {
      Alert.alert("No pins set!", "Please select a location on the map.");
      return;
    }

    const stopData = {
      id: uuid.v4(),
      name: form.todaName.trim(),
      color: form.color.trim(),
      landmark: form.landmark.trim() || "",
      latitude: coordinates[1],
      longitude: coordinates[0],
      transpo_mode: "tricycle",
      contributor_id: user?.id || "",
    };

    const validation = todaStopSchema.safeParse(stopData);

    if (!validation.success) {
      const errorMessage = validation.error.issues.map((issue) => issue.message).join("\n");
      return Alert.alert("Validation Error", errorMessage);
    }

    try {
      await insertStop(stopData);
      Alert.alert("Success!", "TODA stop information submitted successfully!");
      resetForm();
      onNewStopAdded();
    } catch (error: any) {
      console.error("Error submitting TODA stop:", error);
      Alert.alert("Submission failed", "Something went wrong. Please try again.");
    }
  };

  return (
    <BottomSheet maxDynamicContentSize={500}>
      <BottomSheetView className="flex flex-col px-5">
        <View className="flex flex-col gap-5 mb-5">
          <View>
            <Text className="text-xl font-bold mb-2">More information</Text>
            <View className="flex flex-row gap-4 justify-center items-center">
              <View className="flex-[3]">
                <OutlinedTextInput
                  label="Name of TODA"
                  value={form.todaName}
                  onChangeText={(text) => updateForm("todaName", text)}
                />
              </View>
              <View className="flex-[2]">
                <SecondaryButton label={form.color || "Select Color"} onPress={() => setDialogVisible(true)} />
              </View>
            </View>
            <View>
              <OutlinedTextInput
                label="Landmark Information"
                value={form.landmark}
                onChangeText={(text) => updateForm("landmark", text)}
              />
            </View>
          </View>
          <PrimaryButton label="Submit" onPress={handleSubmit} />
        </View>
        <Portal>
          <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
            <Dialog.Title>Select TODA Color</Dialog.Title>
            <Dialog.Content>
              {TODA_COLORS.map((color) => (
                <Button
                  key={color}
                  onPress={() => {
                    updateForm("color", color);
                    setDialogVisible(false);
                  }}
                >
                  {color}
                </Button>
              ))}
            </Dialog.Content>
          </Dialog>
        </Portal>
      </BottomSheetView>
    </BottomSheet>
  );
}
