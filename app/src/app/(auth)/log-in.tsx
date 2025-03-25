import React, { useState } from "react";
import { Button, TextInput, Text } from "react-native-paper";
import { Alert, View, AppState, SafeAreaView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

import { supabase } from "@utils/supabase";

// FIXME: add cleanup to avoids potential memory leaks?
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function LogIn() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  return (
    <SafeAreaView className="flex h-full items-center justify-center">
      <View className="flex flex-col w-full px-5 gap-3 mb-10">
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="email@address.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          autoCapitalize="none"
          secureTextEntry
        />
      </View>
      <View className="flex flex-col w-full items-center">
        <Button disabled={loading} onPress={signInWithEmail}>
          Log in
        </Button>
        <TouchableOpacity onPress={() => router.push("/(auth)/sign-up")}>
          <Text className="text-primary mt-4 text-md">
            No account yet? <Text className="font-bold">Sign up here.</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
