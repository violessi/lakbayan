import React, { useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, Modal, TouchableOpacity } from "react-native";
import Mapbox, { ShapeSource, SymbolLayer } from "@rnmapbox/maps";
import { point, featureCollection } from "@turf/helpers";
import pinPurple from "@assets/pin-purple.png";

export default function TodaMarker({ stop }: { stop: StopData }) {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

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
            iconImage: "pinPurple",
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
                <View className="flex items-center ">
                  <Text className="text-md">Designated Color: {stop.color}</Text>
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
      <Mapbox.Images images={{ pinPurple: pinPurple }} />
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
