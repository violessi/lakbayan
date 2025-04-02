import React, { useState, useEffect } from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";

import { countModVerifications } from "@services/socials-service";
import { getUsername } from "@services/account-service";

import modVerificationIcon from "@assets/verified-mod.png";

export function TodaMarkerModal({
  stop,
  visible,
  onClose,
  children,
}: {
  stop: StopData;
  visible: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}) {
  const [modVerifications, setModVerifications] = useState(0);
  const [username, setUsername] = useState("Anonymous");

  useEffect(() => {
    const fetchModalData = async () => {
      try {
        const [count, fetchedUsername] = await Promise.all([
          countModVerifications(stop.id, "toda"),
          getUsername(stop.contributor_id),
        ]);
        setModVerifications(count);
        setUsername(fetchedUsername || "Anonymous");
      } catch (error) {
        console.error("Error loading modal data:", error);
      }
    };
    fetchModalData();
  }, [stop.id, stop.contributor_id]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.modalBackground} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={() => {}}>
          <View className="flex items-center gap-2">
            <View className="flex flex-row items-center justify-between w-full">
              <Text className="text-lg font-bold">{stop.name} TODA</Text>
              <View className="flex flex-row items-center gap-1">
                <Image source={modVerificationIcon} style={{ width: 15, height: 15 }} />
                <Text className="text-md text-gray-600">{modVerifications} </Text>
              </View>
            </View>
            <View className="flex w-full">
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
