import React from "react";
import { Text, View, FlatList, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTripSummaryData } from "@hooks/use-trip-summary-data";

import RouteItem from "@components/ui/RouteItem";
import VotingBar from "@components/VotingBar";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

import { TRANSPORTATION_COLORS } from "@constants/transportation-color";

const comment = require("@assets/social-comment.png");

interface TripSummaryProps {
  trip: Trip;
  segments: Segment[];
  currentUserId: string;
  onCommentPress: (tripId: string) => void;
}

const snapPoints = ["15%", "25%", "40%", "72%"];

export default function TripSummary({
  trip,
  segments,
  currentUserId,
  onCommentPress,
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
        <View className="flex flex-row justify-between">
          <View className="flex flex-row">
            <Text>Contributed by</Text>
            <TouchableOpacity
              onPress={() => handleContributorPress(trip.contributorId, contributor || "")}
            >
              <Text className="text-primary font-bold">{contributor || ""}</Text>
            </TouchableOpacity>
          </View>
          <View className="flex flex-row gap-3 items-center">
            <VotingBar tripId={trip.id} userId={currentUserId} />
            <TouchableOpacity onPress={() => onCommentPress(trip.id)}>
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
