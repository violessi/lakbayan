import React from "react";
import { View, SafeAreaView, Text } from "react-native";

import { useAccountSettings } from "@hooks/use-account-settings";
import Header from "@components/ui/Header";
import OutlinedTextInput from "@components/ui/OutlinedTextInput";
import PrimaryButton from "@components/ui/PrimaryButton";

export default function AccountSettings() {
  const { user, username, setUsername, originalUsername, loading, handleUpdateProfile } =
    useAccountSettings();

  return (
    <SafeAreaView className="flex-1">
      <Header title="Account Settings" />
      <View className="flex flex-col px-4 gap-10 my-5">
        <View className="flex flex-col gap-3">
          <Text className="text-black text-2xl font-bold">Account Information</Text>

          <OutlinedTextInput label="Email" value={user?.email || ""} disabled />

          <View className="flex flex-row gap-3 items-center">
            <View className="flex-1">
              <OutlinedTextInput
                label="Username"
                value={username}
                onChangeText={setUsername}
                testID="username"
              />
            </View>
            <View className="flex-3">
              <PrimaryButton
                testID="update-button"
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
