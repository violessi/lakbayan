import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";

import { getUsername } from "@services/account-service";

interface CommentItemProps {
  userId: string;
  content: string;
  createdAt: string;
}

export default function CommentItem({ userId, content, createdAt }: CommentItemProps) {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsername = async () => {
      const username = await getUsername(userId);
      setUsername(username);
    };

    fetchUsername();
  }, [userId]);

  return (
    <View className="flex mb-3 gap-1 ">
      <View className="flex flex-row items-center gap-2">
        <Text className="font-bold text-primary">{username}</Text>
        <Text className="text-xs text-gray-500">{new Date(createdAt).toLocaleString()}</Text>
      </View>
      <Text>{content}</Text>
    </View>
  );
}
