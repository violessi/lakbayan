import React, { useState } from "react";
import { View, Text } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Picker } from "@react-native-picker/picker";

export default function JeepInformation({
  dotcRoutes,
  setActiveRoute,
}: {
  dotcRoutes: DotcRoute | null;
  setActiveRoute: (route: DotcRoute | null) => void;
}) {
  const [selectedRoute, setSelectedRoute] = useState<string>("All Routes");

  // Get all unique route_long_name
  const routeNames = dotcRoutes?.features.map((feature) => feature.properties.route_long_name);
  const uniqueRouteNames = Array.from(new Set(routeNames));

  const handleRouteChange = (routeName: string) => {
    if (routeName === "All Routes") {
      setActiveRoute(dotcRoutes);
      setSelectedRoute(routeName);
      return;
    }

    // Find the selected route and update the state
    const selected = dotcRoutes?.features.find((feature) => feature.properties.route_long_name === routeName);
    if (!selected) throw new Error(`Route ${routeName} not found`);
    setActiveRoute(selected);
    setSelectedRoute(routeName);
  };

  return (
    <BottomSheet snapPoints={[300]} index={0}>
      <BottomSheetView className="flex flex-col px-5 gap-2">
        <Text className="text-xl font-bold">More information</Text>
        {/* Dropdown select */}
        <Picker selectedValue={selectedRoute} onValueChange={handleRouteChange} style={{ height: 50, width: "100%" }}>
          <Picker.Item label="All Routes" value={"All Routes"} />
          {uniqueRouteNames.map((routeName) => (
            <Picker.Item key={routeName} label={routeName} value={routeName} />
          ))}
        </Picker>
      </BottomSheetView>
    </BottomSheet>
  );
}
