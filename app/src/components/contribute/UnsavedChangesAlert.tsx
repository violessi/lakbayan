import { Alert } from "react-native";

export default function UnsavedChangesAlert(callback: () => void) {
  Alert.alert(
    "Unsaved Changes",
    "You have unsaved changes. If you leave now, your progress will be lost. Do you want to continue?",
    [
      { text: "Leave Anyway", style: "destructive", onPress: callback },
      { text: "Stay", style: "cancel" },
    ],
  );
}
