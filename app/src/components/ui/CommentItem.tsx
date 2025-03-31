import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, Modal } from "react-native";

import { getUsername } from "@services/account-service";

const gpsBadge = require("@assets/verified-gps.png");

interface CommentItemProps {
  userId: string;
  content: string;
  createdAt: string;
  isGpsVerified: boolean;
}

export default function CommentItem({
  userId,
  content,
  createdAt,
  isGpsVerified,
}: CommentItemProps) {
  const [username, setUsername] = useState<string | null>(null);
  const [showPopover, setShowPopover] = useState(false);

  useEffect(() => {
    const fetchUsername = async () => {
      const username = await getUsername(userId);
      setUsername(username);
    };

    fetchUsername();
  }, [userId]);

  return (
    <View className="flex mb-3 gap-1">
      <View className="flex flex-row items-center gap-2">
        <Text className="font-bold text-primary">{username}</Text>
        <Text className="text-xs text-gray-500">{new Date(createdAt).toLocaleString()}</Text>

        {isGpsVerified && (
          <TouchableOpacity onPress={() => setShowPopover(true)}>
            <Image
              source={gpsBadge}
              className="w-4 h-4"
              accessibilityLabel="GPS Verified"
              testID="gps-verified-badge"
            />
          </TouchableOpacity>
        )}
      </View>
      <Text>{content}</Text>

      <Modal visible={showPopover} transparent animationType="fade">
        <TouchableOpacity
          className="flex-1 mx-20 justify-center items-center"
          onPress={() => setShowPopover(false)}
        >
          <View className="flex flex-col items-center bg-white p-4 rounded-lg gap-2 shadow-sm">
            <Image source={gpsBadge} className="w-12 h-12" accessibilityLabel="GPS Verified" />
            <Text className="text-lg text-center font-semibold">GPS Verified</Text>
            <Text className="text-gray-500 text-center mt-1">
              This comment was made after transit journal verification.
            </Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
