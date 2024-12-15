import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";

import { supabase } from "../../utils/supabase";
import { useSession } from "../../contexts/SessionContext";

import { View, Alert, SafeAreaView } from "react-native";
import { Button, TextInput } from "react-native-paper";

export default function Account() {
  const { session } = useSession();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const router = useRouter();

  useEffect(() => {
    const getProfile = async () => {
      try {
        setLoading(true);
        if (!session?.user) throw new Error("No user on the session!");

        const { data, error, status } = await supabase
          .from("profiles")
          .select(`username`)
          .eq("id", session?.user.id)
          .single();
        if (error && status !== 406) {
          throw error;
        }

        if (data) {
          setUsername(data.username);
        }
      } catch (error) {
        if (error instanceof Error) {
          Alert.alert(error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      getProfile();
    }
  }, [session]);

  async function updateProfile({ username }: { username: string }) {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const updates = {
        id: session?.user.id,
        username,
        updated_at: new Date(),
      };

      const { error } = await supabase.from("profiles").upsert(updates);

      if (error) {
        throw error;
      } else {
        Alert.alert("Profile updated successfully!");
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert(error.message);
    } else {
      router.replace("/(auth)/onboarding");
    }
  }

  return (
    <SafeAreaView>
      <View>
        <TextInput label="Email" value={session?.user?.email} disabled />
      </View>
      <View>
        <TextInput label="Username" value={username || ""} onChangeText={(text) => setUsername(text)} />
      </View>

      <View>
        <Button onPress={() => updateProfile({ username })} disabled={loading}>
          {loading ? "Loading ..." : "Update"}
        </Button>
      </View>

      <View>
        <Button onPress={handleLogout}>Log out</Button>
      </View>
    </SafeAreaView>
  );
}
