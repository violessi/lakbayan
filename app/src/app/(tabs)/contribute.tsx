import React from "react";
import { Text, SafeAreaView, View } from "react-native";
import Option from "@components/ContributeOption";

const customTripIcon = require("@assets/option-custom-trip.png");
const todaStopsIcon = require("@assets/option-pin.png");
const jeepRoutesIcon = require("@assets/option-jeep-routes.png");

export default function Contribute() {
  return (
    <SafeAreaView className="flex-1">
      <View className="h-24 bg-primary px-5 py-5 flex justify-end">
        <Text className="text-white text-2xl font-bold">Contribute a route</Text>
      </View>
      <View className="flex-1 px-4 py-2">
        <Option
          title="Add custom trip"
          description="Help users discover ways to get from starting point to their destination!"
          link="/(contribute)/1-create-trip"
          icon={customTripIcon}
        />
        <Option
          title="Pin tricycle TODA stops"
          description="Let others know where tricycles are stationed!"
          link="/(contribute)/toda-stops"
          icon={todaStopsIcon}
        />
        <Option
          title="Jeepney Routes"
          description="Help others know the routes of jeepneys in your area!"
          link="/(contribute)/jeepney-routes"
          icon={jeepRoutesIcon}
        />
      </View>
    </SafeAreaView>
  );
}
