import { ExpoConfig, ConfigContext } from "@expo/config";
import * as dotenv from "dotenv";

// Initialize dotenv
dotenv.config();

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  slug: "Lakbayan",
  name: "Lakbayan",
  version: "1.0.1",
  orientation: "portrait",
  scheme: "myapp",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./src/assets/splashscreen_logo.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.lakbayan",
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#ffffff",
    },
    package: "com.lakbayan",
    icon: "./src/assets/splashscreen_logo.png",
  },
  web: {
    bundler: "metro",
    output: "single",
  },
  plugins: [
    "expo-router",
    "expo-font",
    [
      "@rnmapbox/maps",
      {
        RNMapboxMapsDownloadToken: process.env.RNMAPBOX_MAPS_DOWNLOAD_TOKEN,
        RNMapboxMapsVersion: "11.0.0",
      },
    ],
    [
      "expo-location",
      {
        locationWhenInUsePermission: "Show current location on map.",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: "1ab18941-792f-43fe-8e32-aa54a5e37d2b",
    },
  },
});
