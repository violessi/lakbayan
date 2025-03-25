import React, { useState } from "react";
import { Button, TextInput, Text } from "react-native-paper";
import { Alert, View, SafeAreaView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

import { supabase } from "@utils/supabase";

export default function SignUp() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      console.error("Sign up error", error);
      Alert.alert(error.message);
    } else {
      Alert.alert("Sign-up successful!");
    }
    setLoading(false);
  }
  return (
    <SafeAreaView className="flex h-full items-center justify-center">
      <TouchableOpacity onPress={() => router.back()} className="absolute top-10 left-5">
        <Text className="text-primary font-bold">← Back</Text>
      </TouchableOpacity>
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
      <View className="flex flex-col w-full">
        <Button disabled={loading} onPress={signUpWithEmail}>
          Sign up
        </Button>
      </View>
    </SafeAreaView>
  );
}
