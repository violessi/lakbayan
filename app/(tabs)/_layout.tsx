import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "blue", headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="contribute"
        options={{
          title: "contribute",
        }}
      />
      <Tabs.Screen
        name="routes"
        options={{
          title: "routes",
        }}
      />
    </Tabs>
  );
}
