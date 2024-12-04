import { Text, View } from "react-native";
import Mapbox, { MapView, Camera, LocationPuck } from "@rnmapbox/maps";
import { MAPBOX_ACCESS_TOKEN } from "../../utils/mapbox-config";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function Index() {
  return (
    <MapView style={{ flex: 1 }} styleURL="mapbox://styles/mapbox/streets-v12">
      <Camera followZoomLevel={13} followUserLocation />
      <LocationPuck />
    </MapView>
  );
}
