import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { z } from "zod";

import { useSession } from "@contexts/SessionContext";
import { getUsername, updateUsername, checkUsernameExists } from "@services/account-service";

const accountSettingsSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(15, "Username must be at most 15 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
});

export function useAccountSettings() {
  const { user } = useSession();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [originalUsername, setOriginalUsername] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const fetchedUsername = await getUsername(user.id);
        const safeUsername = fetchedUsername || "Unknown user";
        setUsername(safeUsername);
        setOriginalUsername(safeUsername);
      } catch (error: any) {
        Alert.alert("Error", error.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const isUsernameUnchanged = username === originalUsername;

  async function handleUpdateProfile() {
    if (!user) return;

    try {
      accountSettingsSchema.shape.username.parse(username);

      if (!isUsernameUnchanged) {
        const exists = await checkUsernameExists(username);
        console.log("Username exists:", exists);
        if (exists) {
          Alert.alert("Error", "Username already taken. Please choose another.");
          return;
        }
      }

      await updateUsername(user.id, username);
      setOriginalUsername(username);
      Alert.alert("Success", "Username updated successfully!");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        Alert.alert("Error", error.errors[0].message);
      } else {
        Alert.alert("Error", error.message);
      }
    }
  }

  return {
    user,
    username,
    setUsername,
    originalUsername,
    loading,
    handleUpdateProfile,
    isUsernameUnchanged,
  };
}
