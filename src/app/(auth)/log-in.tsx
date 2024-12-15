import React, { useState } from "react";
import { router } from "expo-router";
import { Button, TextInput } from "react-native-paper";
import { Alert, View, AppState, SafeAreaView } from "react-native";

import { supabase } from "@utils/supabase";

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function LogIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert(error.message);
    } else {
      router.replace("/(tabs)");
    }
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert(error.message);
    } else {
      Alert.alert("Success! Please log in.");
    }
    // if (!session)
    //   Alert.alert("Please check your inbox for email verification!");
    setLoading(false);
  }

  return (
    <SafeAreaView className="flex h-full items-center justify-center">
      <View className="flex flex-col w-full px-5 gap-3 mb-10">
        <TextInput
          label="Email"
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize="none"
        />
        <TextInput
          label="Password"
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize="none"
        />
      </View>
      <View className="flex flex-col w-full">
        <Button disabled={loading} onPress={() => signInWithEmail()}>
          Log in
        </Button>
        <Button disabled={loading} onPress={() => signUpWithEmail()}>
          Sign up
        </Button>
      </View>
    </SafeAreaView>
  );
}
