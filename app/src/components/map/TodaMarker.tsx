import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { ShapeSource, SymbolLayer, Images } from "@rnmapbox/maps";
import { point, featureCollection } from "@turf/helpers";
import { getUsername } from "@services/account-service";

const iconMap: Record<string, any> = {
  none: require("@assets/toda-none.png"),
  black: require("@assets/toda-black.png"),
  white: require("@assets/toda-white.png"),
  yellow: require("@assets/toda-yellow.png"),
  blue: require("@assets/toda-blue.png"),
  red: require("@assets/toda-red.png"),
  green: require("@assets/toda-green.png"),
};

export default function TodaMarker({ stop }: { stop: StopData }) {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [username, setUsername] = useState("");

  const iconKey = stop.color?.toLowerCase() || "none";
  const iconImage = iconMap[iconKey] || iconMap["none"];

  useEffect(() => {
    getUsername(stop.contributor_id).then((username) => {
      setUsername(username ?? "Anonymous");
    });
  }, [stop.contributor_id]);

  const handleMarkerPress = async () => {
    setLoading(true);
    setLoading(false);
    setModalVisible(true);
  };

  const stopGeoJSON = featureCollection([point([stop.longitude, stop.latitude], { id: stop.id, name: stop.name })]);

  return (
    <>
      <ShapeSource id={`stop-${stop.id}`} shape={stopGeoJSON} onPress={handleMarkerPress}>
        <SymbolLayer
          id={`marker-${stop.id}`}
          style={{
            iconImage: iconKey,
            iconSize: 0.05,
          }}
        />
      </ShapeSource>
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            {loading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              <View className="flex items-center gap-3">
                <Text className="text-lg font-bold">{stop.name} TODA</Text>
                <View className="flex items-center">
                  <Text className="text-md">Contributor: {username}</Text>
                  <Text className="text-md">
                    Designated Color: {stop.color.charAt(0).toUpperCase() + stop.color.slice(1)}
                  </Text>
                  <Text className="text-sm text-gray-600">{stop.landmark || "No additional info"}</Text>
                </View>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text className="text-sm border-b">Close</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
      <Images images={{ [iconKey]: iconImage }} />
    </>
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
