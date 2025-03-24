import React, { useState, useEffect } from "react";
import { View, Alert, SafeAreaView } from "react-native";
import { Button, TextInput } from "react-native-paper";

import { useSession } from "@contexts/SessionContext";
import { fetchUserProfile, updateUserProfile } from "@services/account-service";

import Header from "@components/ui/Header";

export default function AccountSettings() {
  const { session } = useSession();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (!session?.user) return;

      setLoading(true);
      try {
        const profile = await fetchUserProfile(session.user.id);
        if (profile) setUsername(profile.username);
      } catch (error) {
        Alert.alert(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (session) loadProfile();
  }, [session]);

  async function handleUpdateProfile() {
    if (!session?.user) return;

    setLoading(true);
    try {
      await updateUserProfile(session.user.id, username);
      Alert.alert("Profile updated successfully!");
    } catch (error) {
      Alert.alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1">
      <Header title="Account Settings" />
      <View className="flex-1 p-4">
        <TextInput label="Email" value={session?.user?.email} disabled />
        <TextInput label="Username" value={username || ""} onChangeText={setUsername} />
        <Button onPress={handleUpdateProfile} disabled={loading}>
          {loading ? "Loading ..." : "Update"}
        </Button>
      </View>
    </SafeAreaView>
  );
}
