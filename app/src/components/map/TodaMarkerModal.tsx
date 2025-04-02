import React from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function TodaMarkerModal({
  stop,
  visible,
  onClose,
  username = "Anonymous",
  children,
}: {
  stop: StopData;
  visible: boolean;
  onClose: () => void;
  username: string;
  children?: React.ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.modalBackground} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={() => {}}>
          <View className="flex items-center gap-3">
            <Text className="text-lg font-bold">{stop.name} TODA</Text>
            <View className="flex items-center">
              <Text className="text-md">Contributor: {username}</Text>
              <Text className="text-md">
                Designated Color: {stop.color.charAt(0).toUpperCase() + stop.color.slice(1)}
              </Text>
              <Text className="text-sm text-gray-600">{stop.landmark || "No additional info"}</Text>
            </View>
            {children ? (
              children
            ) : (
              <TouchableOpacity onPress={onClose}>
                <Text className="text-sm border-b">Close</Text>
              </TouchableOpacity>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "60%",
  },
});
