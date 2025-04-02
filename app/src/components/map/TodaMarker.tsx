import React, { useState, useEffect } from "react";
import { ShapeSource, SymbolLayer, Images } from "@rnmapbox/maps";
import { point, featureCollection } from "@turf/helpers";
import { TodaMarkerModal } from "@components/map/TodaMarkerModal";

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

interface TodaMarkerProps {
  stop: StopData;
  onPress?: () => void;
  disableDefaultModal?: boolean;
}

export default function TodaMarker({
  stop,
  onPress,
  disableDefaultModal = false,
}: TodaMarkerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [username, setUsername] = useState("Anonymous");

  const iconKey = stop.color?.toLowerCase() || "none";
  const iconImage = iconMap[iconKey] || iconMap["none"];

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const fetchedUsername = await getUsername(stop.contributor_id);
        setUsername(fetchedUsername || "Anonymous");
      } catch (error) {
        console.error("Error fetching username:", error);
      }
    };
    fetchUsername();
  });

  const stopGeoJSON = featureCollection([
    point([stop.longitude, stop.latitude], { id: stop.id, name: stop.name }),
  ]);

  const handlePress = () => {
    setModalVisible(true);
    if (onPress) onPress();
  };

  return (
    <>
      <ShapeSource id={`stop-${stop.id}`} shape={stopGeoJSON} onPress={handlePress}>
        <SymbolLayer
          id={`marker-${stop.id}`}
          style={{
            iconImage: iconKey,
            iconSize: 0.05,
          }}
        />
      </ShapeSource>
      <Images images={{ [iconKey]: iconImage }} />
      {!disableDefaultModal && (
        <TodaMarkerModal
          stop={stop}
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          username={username}
        />
      )}
    </>
  );
}
