import React, { useState, useRef } from "react";
import { Button, TextInput } from "react-native-paper";
import { Alert, View, AppState, SafeAreaView, TextInput as Text } from "react-native";

import { supabase } from "@utils/supabase";
import { useSession } from "@contexts/SessionContext";

// TODO: move to higher-level component?
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
  const passwordInputRef = useRef<Text>(null);

  //TODO: fix error handling
  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) Alert.alert(error.message);
    else Alert.alert("Success! Please log in.");
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
          returnKeyType="next"
          onSubmitEditing={() => passwordInputRef.current?.focus()}
        />
        <TextInput
          label="Password"
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize="none"
          ref={passwordInputRef}
          returnKeyType="done"
        />
      </View>
      <View className="flex flex-col w-full">
        <Button disabled={loading} onPress={signInWithEmail}>
          Log in
        </Button>
        <Button disabled={loading} onPress={signUpWithEmail}>
          Sign up
        </Button>
      </View>
    </SafeAreaView>
  );
}
