import React, { useEffect, useState } from "react";
import { Text, SafeAreaView, View, Alert } from "react-native";
import { useRouter } from "expo-router";

import { logoutUser } from "@services/account-service";
import { getUsername, getUserRole, getUserDetails } from "@services/account-service";
import { useSession } from "@contexts/SessionContext";

import Option from "../../components/ContributeOption";
import SecondaryButton from "@components/ui/SecondaryButton";
import UserHeader from "@components/account/UserHeader";

export default function Account() {
  const router = useRouter();
  const { userId } = useSession();

  const [username, setUsername] = useState<string>("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [points, setPoints] = useState<number>(0);
  const [joinedDate, setJoinedDate] = useState<string>("");

  useEffect(() => {
    async function fetchUserDetails() {
      if (userId) {
        const role = await getUserRole(userId);
        setUserRole(role || "User");

        const username = await getUsername(userId);
        setUsername(username || "User");

        const { points, joinedDate } = await getUserDetails(userId);
        setPoints(points);
        setJoinedDate(joinedDate);
      }
    }
    fetchUserDetails();
  }, [userId]);

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
      {/* User Header */}
      <UserHeader username={username || "User"} role={userRole || "User"} points={points} joinedDate={joinedDate} />

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
          {userRole === "moderator" && (
            <View>
              <Text className="text-black text-xl font-bold mb-4">Moderation</Text>
              <Option
                title="Tag routes as verified"
                description="Tag user-submitted routes as verified!"
                link="/(moderation)/moderate-trips-list"
              />
            </View>
          )}
        </View>
        <SecondaryButton label="Log out" onPress={handleLogout} />
      </View>
    </SafeAreaView>
  );
}
