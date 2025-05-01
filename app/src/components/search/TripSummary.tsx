import React from "react";
import { useRouter } from "expo-router";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
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
  loadingTrip?: boolean;
}

const snapPoints = ["15%", "25%", "40%", "72%"];

export default function TripSummary({
  trip,
  segments,
  currentUserId,
  handleCommentPress,
  handleStartPress,
  loadingTrip = false,
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
    <BottomSheet snapPoints={snapPoints} index={2} maxDynamicContentSize={75}>
      <View className="px-5 gap-4">
        {handleStartPress &&
          (loadingTrip ? (
            <View className="w-full">
              <PrimaryButton label="Loading trip..." onPress={() => {}} disabled={true} />
            </View>
          ) : (
            <View className="w-full">
              <PrimaryButton label="Start Transit Journal" onPress={handleStartPress} />
            </View>
          ))}
        <View className="flex flex-row justify-between mb-3">
          <View className="flex flex-row gap-2">
            <Text>Contributed by</Text>
            <TouchableOpacity
              onPress={() => handleContributorPress(trip.contributorId, contributor || "")}
            >
              <Text className="text-primary font-bold">{contributor || ""}</Text>
            </TouchableOpacity>
          </View>
          <View className="flex flex-row gap-5 items-center">
            {currentUserId && <VotingBar trip={trip} userId={currentUserId} />}
            <TouchableOpacity onPress={() => handleCommentPress(trip.id)} hitSlop={10}>
              <View className="flex flex-row gap-1 items-center justify-center">
                <Image source={comment} style={{ width: 11, height: 11 }} resizeMode="contain" />
                <Text className="text-sm">{trip.comments}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <BottomSheetFlatList
        data={segments}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 24, paddingBottom: 60 }}
        ListEmptyComponent={
          <View className="flex flex-row justify-center">
            <Text className="text-secondary mt-5">No transfers added yet.</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <RouteItem
            segment={item}
            color={TRANSPORTATION_COLORS[index % TRANSPORTATION_COLORS.length]}
          />
        )}
        keyExtractor={(item) => item.id}
      />
    </BottomSheet>
  );
}
