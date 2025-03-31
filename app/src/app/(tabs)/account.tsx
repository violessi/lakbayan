import React from "react";
import { Text, SafeAreaView, View, Alert } from "react-native";

import { logoutUser } from "@services/account-service";
import { useSession } from "@contexts/SessionContext";

import Option from "@components/ContributeOption";
import SecondaryButton from "@components/ui/SecondaryButton";
import UserHeader from "@components/account/UserHeader";

import { useAccountDetails } from "@hooks/use-account-details";

const bookmarkIcon = require("@assets/option-bookmark.png");
const submissionIcon = require("@assets/option-submissions.png");
const accountIcon = require("@assets/option-account.png");
const tagIcon = require("@assets/option-tag.png");

export default function Account() {
  const { user } = useSession();
  const { username, userRole, points, joinedDate, loading } = useAccountDetails(user?.id);

  async function handleLogout() {
    try {
      await logoutUser();
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      } else {
        Alert.alert("An unexpected error occurred.");
      }
    }
  }

  return (
    <SafeAreaView className="flex-1">
      {loading ? (
        <View className="h-24 bg-primary px-5 pb-7 flex flex-row justify-center items-end">
          <Text className="text-white">Loading user details...</Text>
        </View>
      ) : (
        <UserHeader
          username={username || "User"}
          role={userRole || "User"}
          points={points}
          joinedDate={joinedDate}
        />
      )}

      <View className="flex-1 p-4 justify-between">
        <View>
          <View className="pb-10 border-b-1">
            <Text className="text-black text-2xl font-bold mx-4 mt-4">My trips</Text>
            <Option
              title="Bookmarked Trips"
              description="Take your favorite trips or the trips you have saved for later!"
              link="/(account)/bookmarked-trips"
              icon={bookmarkIcon}
            />
            <Option
              title="Submitted Trips"
              description="View the trips you have shared with other users so far!"
              link="/(account)/submitted-trips"
              icon={submissionIcon}
            />
            <Option
              title="Account Settings"
              description="Change your login credentials"
              link="/(account)/account-settings"
              icon={accountIcon}
            />
          </View>
          {userRole === "moderator" && (
            <View>
              <Text className="text-black text-2xl font-bold mx-4 mt-2">Moderation</Text>
              <Option
                title="Tag routes as verified"
                description="Tag user-submitted routes as verified!"
                link="/(moderation)/moderate-trips-list"
                icon={tagIcon}
              />
            </View>
          )}
        </View>
        <SecondaryButton label="Log out" onPress={handleLogout} />
      </View>
    </SafeAreaView>
  );
}
