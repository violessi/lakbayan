import { ImageSourcePropType } from "react-native";

interface TransportationModeItem {
  label: TransportationMode;
  icon: ImageSourcePropType;
}

export const TRANSPORTATION_MODES: TransportationModeItem[] = [
  { label: "Train", icon: require("@assets/transpo-train.png") },
  { label: "Bus", icon: require("@assets/transpo-bus.png") },
  { label: "Jeep", icon: require("@assets/transpo-jeep.png") },
  { label: "UV", icon: require("@assets/transpo-uv.png") },
  { label: "Tricycle", icon: require("@assets/transpo-tricycle.png") },
  { label: "Walk", icon: require("@assets/transpo-walk.png") },
];
