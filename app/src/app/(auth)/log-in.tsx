import React, { useState } from "react";
import { useRouter } from "expo-router";
import { z } from "zod";

import { Text } from "react-native-paper";
import { AppState, Alert, View, SafeAreaView, TouchableOpacity, StyleSheet } from "react-native";
import OutlinedTextInput from "@components/ui/OutlinedTextInput";
import PrimaryButton from "@components/ui/PrimaryButton";

import { supabase } from "@utils/supabase";

// FIXME: add cleanup to avoids potential memory leaks?
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

const logInSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Invalid password"),
});

export default function LogIn() {
  const router = useRouter();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateInputs = async (): Promise<boolean> => {
    const result = logInSchema.safeParse(form);
    if (!result.success) {
      const messages = result.error.errors.map((err) => `• ${err.message}`).join("\n");
      Alert.alert("Invalid input!", messages);
      return false;
    }

    return true;
  };

  async function signInWithEmail() {
    const isValid = await validateInputs();
    if (!isValid) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });
    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  return (
    <View className="flex h-full">
      <SafeAreaView className="h-1/3 bg-primary px-5 py-5 flex-col justify-end">
        <View className="flex flex-col gap-0 px-5 pb-5">
          <Text style={styles.whiteText} className="text-4xl">
            Welcome!
          </Text>
          <Text style={styles.whiteText} className="text-lg">
            Where are we off to today?
          </Text>
        </View>
      </SafeAreaView>
      <View className="flex flex-col w-full px-5 gap-7 my-10">
        <View className="flex flex-col w-full gap-2">
          <OutlinedTextInput
            label="Email"
            value={form.email}
            onChangeText={(text) => handleChange("email", text)}
            placeholder="email@address.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <OutlinedTextInput
            label="Password"
            value={form.password}
            onChangeText={(text) => handleChange("password", text)}
            placeholder="Password"
            autoCapitalize="none"
            secureTextEntry
          />
        </View>
        <View className="flex flex-col w-full">
          <PrimaryButton label="Log in" disabled={loading} onPress={signInWithEmail} />
        </View>
        <View className="flex flex-col w-full items-center">
          <TouchableOpacity onPress={() => router.push("/(auth)/sign-up")}>
            <Text className="mt-4 text-md">
              No account yet? <Text style={styles.grayText}>Sign up here.</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  whiteText: {
    color: "#ffffff",
  },
  grayText: {
    color: "#555555",
  },
});
