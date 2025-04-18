import React, { useState } from "react";
import { ShapeSource, SymbolLayer, Images } from "@rnmapbox/maps";
import { point, featureCollection } from "@turf/helpers";
import { TodaMarkerModal } from "@components/map/TodaMarkerModal";

const iconMap: Record<string, any> = {
  none: require("@assets/toda-none.png"),
  black: require("@assets/toda-black.png"),
  white: require("@assets/toda-white.png"),
  yellow: require("@assets/toda-yellow.png"),
  blue: require("@assets/toda-blue.png"),
  red: require("@assets/toda-red.png"),
  green: require("@assets/toda-green.png"),
  violet: require("@assets/toda-violet.png"),
  orange: require("@assets/toda-orange.png"),
  pink: require("@assets/toda-pink.png"),
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

  const iconKey = stop.color?.toLowerCase() || "none";
  const iconImage = iconMap[iconKey] || iconMap["none"];

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
        />
      )}
    </>
  );
}
