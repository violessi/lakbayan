import React from "react";
import { Text, View } from "react-native";

interface TripTitleProps {
  startLocation: string;
  endLocation: string;
  transportationMode?: TransportationMode;
}

export default function TripTitle({ startLocation, endLocation, transportationMode }: TripTitleProps) {
  const startLocationDisplay = startLocation.split(",")[0];
  const endLocationDisplay = endLocation.split(",")[0];

  return (
    <View className="absolute top-0 left-50 z-40 m-5 px-5 py-2 flex flex-col bg-white rounded-[8]">
      <Text className="text-center">
        <Text className="font-bold">{startLocationDisplay}</Text> to{" "}
        <Text className="font-bold">{endLocationDisplay}</Text>
        {transportationMode && (
          <>
            {" "}
            via <Text className="font-bold">{transportationMode}</Text>
          </>
        )}
      </Text>
    </View>
  );
}
