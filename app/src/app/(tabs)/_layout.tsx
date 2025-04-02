import { Tabs, Redirect } from "expo-router";
import { Image, ImageSourcePropType, StyleSheet, Platform } from "react-native";

import { useSession } from "@contexts/SessionContext";

const homeIcon = require("@assets/tab-home.png");
const contributeIcon = require("@assets/tab-contribute.png");
const accountIcon = require("@assets/tab-account.png");

const TabIcon = ({
  source,
  size,
  focused,
}: {
  source: ImageSourcePropType;
  size: number;
  focused: boolean;
}) => (
  <Image
    source={source}
    style={[styles.icon, { width: size, height: size, tintColor: focused ? "#7F55D9" : "gray" }]}
    resizeMode="contain"
  />
);

export default function TabLayout() {
  const { user } = useSession();
  if (!user) return <Redirect href="/(auth)/log-in" />;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#7F55D9",
        headerShown: false,
        tabBarStyle: {
          height: Platform.OS === "ios" ? 75 : 60,
          paddingTop: 4,
          paddingBottom: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Home", tabBarIcon: (props) => <TabIcon source={homeIcon} {...props} /> }}
      />
      <Tabs.Screen
        name="contribute"
        options={{
          title: "Contribute",
          tabBarIcon: (props) => <TabIcon source={contributeIcon} {...props} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: (props) => <TabIcon source={accountIcon} {...props} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  icon: {
    tintColor: "gray",
  },
});
