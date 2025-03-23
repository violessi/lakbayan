import React from "react";
import { Text, SafeAreaView, View, Alert } from "react-native";

import { useRouter } from "expo-router";
import { logoutUser } from "@services/account-service";

import Option from "../../components/ContributeOption";
import SecondaryButton from "@components/ui/SecondaryButton";

export default function Account() {
  const router = useRouter();

  async function handleLogout() {
    try {
      await logoutUser();
      router.replace("/(auth)/onboarding");
    } catch (error) {
      Alert.alert(error.message);
    }
  }

  return (
    <SafeAreaView className="flex-1">
      <View className="h-32 bg-primary px-5 py-5">
        <Text className="text-white text-lg font-bold">Contribute a route</Text>
        <Text className="text-white text-sm">
          Lakbayan depends on community contributions to ensure up-to-date and complete route information!
        </Text>
      </View>

      <View className="flex-1 p-4 justify-between">
        <View>
          <View className="pb-10 border-b-1">
            <Text className="text-black text-xl font-bold mb-4">My trips</Text>
            <Option
              title="Bookmarked Trips"
              description="Take your favorite trips or the trips you have saved for later!"
              link="/(account)/bookmarked-trips"
            />
            <Option
              title="Submitted Trips"
              description="View the trips you have shared with other users so far!"
              link="/(account)/submitted-trips"
            />
            <Option
              title="Account Settings"
              description="Change your login credentials"
              link="/(account)/account-settings"
            />
          </View>
          <View>
            <Text className="text-black text-xl font-bold mb-4">Moderation</Text>
            <Option
              title="Tag routes as verified"
              description="Tag user-submitted routes as verified!"
              link="/(moderation)/moderate-trips-list"
            />
          </View>
        </View>
        <SecondaryButton label="Log out" onPress={handleLogout} />
      </View>
    </SafeAreaView>
  );
}
