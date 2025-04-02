import React, { useEffect } from "react";
import { SafeAreaView, View, Text, Alert } from "react-native";

import { useSession } from "@contexts/SessionContext";
import { usePendingVerifications } from "@hooks/use-pending-verifications";
import { useMapView } from "@hooks/use-map-view";

import Header from "@components/ui/Header";
import { MapShell } from "@components/map/MapShell";
import ModeratorTodaMarker from "@components/map/ModeratorTodaMarker";

export default function ModerateTodaStopsMap() {
  const { user } = useSession();
  const { pendingTodas, refetch } = usePendingVerifications(user?.id || null);
  const { center, zoomLevel, cameraRef, handleMapPress, handleUserLocation } = useMapView(12);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Moderate TODA Stops" />
      <View
        className="z-10 absolute inset-0 justify-end mb-20 items-center"
        pointerEvents="box-none"
      >
        <View className="bg-white p-4 rounded-lg">
          <Text className="text-gray-600">{pendingTodas.length} stop/s to verify.</Text>
        </View>
      </View>
      <MapShell
        center={center}
        zoomLevel={zoomLevel}
        cameraRef={cameraRef}
        handleMapPress={handleMapPress}
        handleUserLocation={handleUserLocation}
      >
        {pendingTodas.map((stop) => (
          <ModeratorTodaMarker
            key={stop.id}
            stop={stop}
            moderatorId={user?.id || ""}
            onActionComplete={(action: "verified" | "dismissed") => {
              const message =
                action === "verified"
                  ? "Stop verified successfully!"
                  : "Stop dismissed successfully.";
              Alert.alert("Success", message);
              refetch();
            }}
          />
        ))}
      </MapShell>
    </SafeAreaView>
  );
}
