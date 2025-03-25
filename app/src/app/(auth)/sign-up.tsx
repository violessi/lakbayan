import React, { useState } from "react";
import { useRouter } from "expo-router";
import { z } from "zod";

import { Button, TextInput, Text, Switch } from "react-native-paper";
import { Alert, View, SafeAreaView, TouchableOpacity } from "react-native";

import { supabase } from "@utils/supabase";
import { createUserProfile, checkUsernameExists } from "@services/account-service";

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
    <SafeAreaView className="flex h-full items-center justify-center">
      <TouchableOpacity onPress={() => router.back()} className="absolute top-10 left-5">
        <Text className="text-primary font-bold">← Back</Text>
      </TouchableOpacity>
      <View className="flex flex-col w-full px-5 gap-3 mb-10">
        <TextInput
          label="Username"
          value={form.username}
          onChangeText={(text) => handleChange("username", text)}
          placeholder="Choose a username"
          autoCapitalize="none"
        />
        <TextInput
          label="Email"
          value={form.email}
          onChangeText={(text) => handleChange("email", text)}
          placeholder="email@address.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          label="Password"
          value={form.password}
          onChangeText={(text) => handleChange("password", text)}
          placeholder="Password"
          autoCapitalize="none"
          secureTextEntry
        />
        <View className="flex flex-row items-center justify-between">
          <Text>Are you a commuter?</Text>
          <Switch value={form.isCommuter} onValueChange={(value) => handleChange("isCommuter", value)} />
        </View>
      </View>
      <View className="flex flex-col w-full">
        <Button disabled={loading} onPress={signUpWithEmail}>
          Sign up
        </Button>
      </View>
    </SafeAreaView>
  );
}
