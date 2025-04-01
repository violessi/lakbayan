import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";

import { useSession } from "@contexts/SessionContext";
import { useTripPreviewData } from "@hooks/use-trip-preview-data";

import VotingBar from "@components/VotingBar";

const verifiedMod = require("@assets/verified-mod.png");
const verifiedGPS = require("@assets/verified-gps.png");
const comment = require("@assets/social-comment.png");
const bookmarkIcon = require("@assets/social-bookmark.png");
const bookmarkedIcon = require("@assets/social-bookmarked.png");

const jeep = require("@assets/transpo-jeep.png");
const bus = require("@assets/transpo-bus.png");
const train = require("@assets/transpo-train.png");
const tricycle = require("@assets/transpo-tricycle.png");
const uv = require("@assets/transpo-uv.png");
const walk = require("@assets/transpo-walk.png");

const getImageSource = (mode: TransportationMode) => {
  switch (mode) {
    case "Jeep":
      return jeep;
    case "Bus":
      return bus;
    case "Train":
      return train;
    case "Tricycle":
      return tricycle;
    case "UV":
      return uv;
    case "Walk":
      return walk;
    default:
      return null;
  }
};

export default function TripPreview({ trip }: { trip: FullTrip }) {
  const { user } = useSession();
  const { bookmarked, modVerifications, gpsVerifications, commentCount, toggleBookmark } =
    useTripPreviewData(user?.id || null, trip);

  const totalDuration = trip.segments.reduce((sum, seg) => sum + seg.duration, 0);
  const totalCost = trip.segments.reduce((sum, seg) => sum + seg.cost, 0);
  const transportModes = trip.segments.map((seg) => seg.segmentMode);

  return (
    <View className="w-full border-b border-gray-200 py-6 px-2">
      <View className="flex-row items-center">
        <View className="items-center" style={{ flex: 7 }}>
          <View className="flex-row flex-wrap justify-center items-center gap-1">
            {transportModes.map((mode, index) => (
              <View key={index} className="flex-row items-center gap-1">
                <View className="flex-col items-center gap-1 text-sm">
                  <Text className="text-xs text-secondary">{mode}</Text>
                  <Image
                    source={getImageSource(mode)}
                    style={{ width: 22, height: 22, tintColor: "#7F55D9" }}
                    resizeMode="contain"
                  />
                </View>
                {index < transportModes.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>
        <View className="gap-1" style={{ flex: 6 }}>
          <View className="flex flex-row justify-between gap-1 items-center">
            <Text className="text-md" style={{ fontWeight: 700 }}>
              Time: {Math.round(totalDuration / 60)} min
            </Text>
            <Text className="text-sm">₱{totalCost.toFixed(2)}</Text>
          </View>
          <View className="flex flex-row gap-4 items-center">
            <View className="flex flex-row gap-2">
              <View className="flex flex-row gap-1 items-center">
                <Image
                  source={verifiedMod}
                  style={{ width: 16, height: 16 }}
                  resizeMode="contain"
                />
                <Text className="text-sm">{modVerifications}</Text>
              </View>
              <View className="flex flex-row gap-1 items-center">
                <Image
                  source={verifiedGPS}
                  style={{ width: 16, height: 16 }}
                  resizeMode="contain"
                />
                <Text className="text-sm">{gpsVerifications}</Text>
              </View>
            </View>
            <View className="flex flex-row gap-3">
              {user && <VotingBar tripId={trip.id} userId={user.id} />}
              <View className="flex flex-row gap-1 items-center">
                <Image source={comment} style={{ width: 11, height: 11 }} resizeMode="contain" />
                <Text className="text-sm">{commentCount}</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <TouchableOpacity onPress={toggleBookmark}>
            <Image
              source={bookmarked ? bookmarkedIcon : bookmarkIcon}
              testID={bookmarked ? "bookmarked-icon" : "bookmark-icon"}
              style={{ width: 15, height: 15, tintColor: "#7F55D9" }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  divider: {
    width: 14,
    height: 0.8,
    marginTop: 18,
    backgroundColor: "#515151",
  },
});
