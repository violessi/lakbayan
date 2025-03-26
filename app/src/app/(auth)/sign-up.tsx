import React, { useState } from "react";
import { useRouter } from "expo-router";
import { z } from "zod";

import { Text, Switch } from "react-native-paper";
import { Alert, View, SafeAreaView, TouchableOpacity, Image, StyleSheet } from "react-native";
import OutlinedTextInput from "@components/ui/OutlinedTextInput";
import PrimaryButton from "@components/ui/PrimaryButton";

import { supabase } from "@utils/supabase";
import { createUserProfile, checkUsernameExists } from "@services/account-service";

const back = require("@assets/left-arrow.png");

const signUpSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(15, "Username must be at most 15 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function SignUp() {
  const router = useRouter();

  const [form, setForm] = useState({ username: "", email: "", password: "", isCommuter: false });
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateInputs = async (): Promise<boolean> => {
    const result = signUpSchema.safeParse(form);
    if (!result.success) {
      const messages = result.error.errors.map((err) => `• ${err.message}`).join("\n");
      Alert.alert("Invalid input!", messages);
      return false;
    }

    const usernameExists = await checkUsernameExists(form.username);
    if (usernameExists) {
      Alert.alert("Username already taken. Please choose another.");
      return false;
    }

    return true;
  };

  async function signUpWithEmail() {
    const isValid = await validateInputs();
    if (!isValid) return;

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email: form.email, password: form.password });

    if (error) {
      Alert.alert(error.message);
      setLoading(false);
      return;
    }

    const user = data.user;
    if (!user) {
      Alert.alert("Failed to get user!");
      setLoading(false);
      return;
    }

    try {
      await createUserProfile(user.id, form.username, form.isCommuter);
      Alert.alert("Sign-up successful!");
    } catch (err) {
      let errorMessage = "An unknown error occurred.";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      Alert.alert(errorMessage);
    }

    setLoading(false);
  }

  return (
    <View className="flex h-full">
      <SafeAreaView className="h-1/3 bg-primary px-5 py-5 flex-col justify-between">
        <TouchableOpacity onPress={() => router.back()}>
          <View className="flex flex-row justify-start gap-2 px-5">
            <Image source={back} className="w-5 h-5" style={{ tintColor: "white" }} />
            <Text style={styles.whiteText}>Back</Text>
          </View>
        </TouchableOpacity>
        <View className="flex flex-col gap-0 px-5 pb-5">
          <Text style={styles.whiteText} className="text-4xl">
            Welcome!
          </Text>
          <Text style={styles.whiteText} className="text-lg">
            Create an account to get started.
          </Text>
        </View>
      </SafeAreaView>
      <View className="flex flex-col w-full px-5 gap-7 my-10">
        <View className="flex flex-col w-full gap-2">
          <OutlinedTextInput
            label="Username"
            value={form.username}
            onChangeText={(text) => handleChange("username", text)}
            placeholder="Choose a username"
            autoCapitalize="none"
          />
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
          <View className="flex flex-row items-center justify-center gap-5">
            <Text className="text-md">Are you a commuter?</Text>
            <Switch value={form.isCommuter} onValueChange={(value) => handleChange("isCommuter", value)} />
          </View>
        </View>
        <View className="flex flex-col w-full">
          <PrimaryButton label="Sign up" disabled={loading} onPress={signUpWithEmail} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  whiteText: {
    color: "#ffffff",
  },
});
