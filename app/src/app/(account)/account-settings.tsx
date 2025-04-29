import React from "react";
import { View, SafeAreaView, Text, BackHandler } from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import { useAccountSettings } from "@hooks/use-account-settings";
import { useSession } from "@contexts/SessionContext";
import Header from "@components/ui/Header";
import OutlinedTextInput from "@components/ui/OutlinedTextInput";
import PrimaryButton from "@components/ui/PrimaryButton";

export default function AccountSettings() {
  const router = useRouter();
  const { user, username, setUsername } = useSession();
  const { originalUsername, loading, handleUpdateProfile } = useAccountSettings();

  function prevCallback() {
    router.replace("/(tabs)/account");
  }

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        prevCallback();
        return true;
      };

      const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

      return () => backHandler.remove();
    }, []),
  );

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
                value={username || ""}
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
