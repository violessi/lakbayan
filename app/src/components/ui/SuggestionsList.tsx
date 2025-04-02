import React from "react";
import { List } from "react-native-paper";

export function SuggestionListItem({ item, onPress }: { item: Suggestion; onPress: () => void }) {
  return (
    <List.Item
      title={item.place_name}
      description={item.address || ""}
      descriptionNumberOfLines={1}
      titleStyle={{ fontSize: 13, fontWeight: "bold", color: "#333" }}
      descriptionStyle={{ fontSize: 11, color: "gray" }}
      style={{ height: 45 }}
      onPress={onPress}
    />
  );
}
