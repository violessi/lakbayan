import React from "react";
import { useRouter } from "expo-router";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Text, View, FlatList, Image, TouchableOpacity } from "react-native";

import VotingBar from "@components/VotingBar";
import RouteItem from "@components/ui/RouteItem";
import PrimaryButton from "@components/ui/PrimaryButton";

import { useTripSummaryData } from "@hooks/use-trip-summary-data";
import { TRANSPORTATION_COLORS } from "@constants/transportation-color";
const comment = require("@assets/social-comment.png");

interface TripSummaryProps {
  trip: Trip;
  segments: Segment[];
  currentUserId: string | null | undefined;
  handleCommentPress: (tripId: string) => void;
  handleStartPress?: () => void;
}

const snapPoints = ["15%", "25%", "40%", "72%"];

export default function TripSummary({
  trip,
  segments,
  currentUserId,
  handleCommentPress,
  handleStartPress,
}: TripSummaryProps) {
  const router = useRouter();

  const { contributor } = useTripSummaryData(trip.contributorId, trip.id);

  const handleContributorPress = (contributorId: string, contributorUsername: string) => {
    router.push({
      pathname: "/(social)/contributor-account",
      params: { contributorId, contributorUsername },
    });
  };

  return (
    <BottomSheet snapPoints={snapPoints} index={2}>
      <BottomSheetView className="flex flex-col px-5 gap-6">
        {handleStartPress && (
          <View className="w-full">
            <PrimaryButton label="Start Transit Journal" onPress={handleStartPress} />
          </View>
        )}
        <View className="flex flex-row justify-between">
          <View className="flex flex-row gap-2">
            <Text>Contributed by</Text>
            <TouchableOpacity
              onPress={() => handleContributorPress(trip.contributorId, contributor || "")}
            >
              <Text className="text-primary font-bold">{contributor || ""}</Text>
            </TouchableOpacity>
          </View>
          <View className="flex flex-row gap-3 items-center">
            {currentUserId && <VotingBar trip={trip} userId={currentUserId} />}
            <TouchableOpacity onPress={() => handleCommentPress(trip.id)}>
              <Image source={comment} style={{ width: 12, height: 12 }} resizeMode="contain" />
            </TouchableOpacity>
          </View>
        </View>
        <View className="flex flex-row justify-center">
          {segments.length === 0 ? (
            <Text className="text-secondary mt-5">No transfers added yet.</Text>
          ) : (
            <FlatList
              data={segments}
              renderItem={({ item, index }) => (
                <RouteItem
                  segment={item}
                  color={TRANSPORTATION_COLORS[index % TRANSPORTATION_COLORS.length]}
                />
              )}
              keyExtractor={(item) => item.id}
            />
          )}
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
