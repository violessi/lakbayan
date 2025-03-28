import React, { useState, useEffect } from "react";
import { View, Alert, SafeAreaView, Text } from "react-native";
import { z } from "zod";

import { useSession } from "@contexts/SessionContext";
import {
  fetchUserProfile,
  updateUserProfile,
  checkUsernameExists,
} from "@services/account-service";

import Header from "@components/ui/Header";
import OutlinedTextInput from "@components/ui/OutlinedTextInput";
import PrimaryButton from "@components/ui/PrimaryButton";

const accountSettingsSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(15, "Username must be at most 15 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function AccountSettings() {
  const { user } = useSession();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [originalUsername, setOriginalUsername] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const profile = await fetchUserProfile(user.id);
        if (profile) {
          setUsername(profile.username);
          setOriginalUsername(profile.username);
        }
      } catch (error: any) {
        Alert.alert("Error", error.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) loadProfile();
  }, [user]);

  async function handleUpdateProfile() {
    if (!user) return;

    try {
      accountSettingsSchema.shape.username.parse(username);

      // Check if username exists only if it has changed
      if (username !== originalUsername) {
        const exists = await checkUsernameExists(username);
        if (exists) {
          Alert.alert("Error", "Username already taken. Please choose another.");
          return;
        }
      }

      await updateUserProfile(user.id, username);
      setOriginalUsername(username); // Update reference username
      Alert.alert("Success", "Username updated successfully!");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        Alert.alert("Error", error.errors[0].message);
      } else {
        Alert.alert("Error", error.message);
      }
    }
  }

  return (
    <SafeAreaView className="flex-1">
      <Header title="Account Settings" />
      <View className="flex flex-col px-4 gap-10 my-5">
        <View className="flex flex-col gap-3">
          <Text className="text-black text-2xl font-bold">Account Information</Text>

          <OutlinedTextInput label="Email" value={user?.email || ""} disabled />

          <View className="flex flex-row gap-3 items-center">
            <View className="flex-1">
              <OutlinedTextInput label="Username" value={username} onChangeText={setUsername} />
            </View>
            <View className="flex-3">
              <PrimaryButton
                label={loading ? "Loading ..." : "Update"}
                onPress={handleUpdateProfile}
                disabled={loading || username === originalUsername}
              />
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
