import React from "react";
import { Text, SafeAreaView, View } from "react-native";
import Option from "../../components/ContributeOption";

export default function Contribute() {
  return (
    <SafeAreaView className="flex-1">
      <View className="h-32 bg-primary px-5 py-5">
        <Text className="text-white text-lg font-bold">Contribute a route</Text>
        <Text className="text-white text-sm">
          Lakbayan depends on community contributions to ensure up-to-date and complete route information!
        </Text>
      </View>
      <View className="flex-1 p-4">
        <Option
          title="Add custom trip"
          description="Help users discover ways to get from starting point to their destination!"
          link="/(contribute)/custom-trip"
        />
        <Option
          title="Pin tricycle TODA stops"
          description="Let others know where tricycles are stationed!"
          link="/(contribute)/toda-stops"
        />
      </View>
    </SafeAreaView>
  );
}
