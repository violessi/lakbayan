import React, { useState, useEffect } from "react";
import { Text, View, FlatList, Image, TouchableOpacity } from "react-native";

import { getUsername } from "@services/account-service";
import { getPoints } from "@services/socials-service";

import RouteItem from "@components/ui/RouteItem";
import VotingBar from "@components/VotingBar";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

import { TRANSPORTATION_COLORS } from "@constants/transportation-color";

const comment = require("@assets/social-comment.png");

interface TripSummaryProps {
  startLocation: string;
  endLocation: string;
  trip: Trip;
  segments: Segment[];
  currentUserId: string;
  onCommentPress: (tripId: string) => void;
}

export default function TripSummary({
  startLocation,
  endLocation,
  trip,
  segments,
  currentUserId,
  onCommentPress,
}: TripSummaryProps) {
  const snapPoints = ["15%", "25%", "40%", "72%"];

  const [contributor, setContributor] = useState<string | null>(null);
  const [points, setPoints] = useState<number>(0);

  useEffect(() => {
    async function fetchContributor() {
      const username = await getUsername(trip.contributor_id);
      setContributor(username);
    }

    async function fetchPoints() {
      const points = await getPoints(trip.id);
      setPoints(points || 0);
    }

    fetchContributor();
    fetchPoints();
  }, [trip.contributor_id, trip.id]);

  return (
    <BottomSheet snapPoints={snapPoints} index={2}>
      <BottomSheetView className="flex flex-col px-5 gap-6">
        <View className="flex flex-row justify-between">
          <View className="flex flex-row">
            <Text>Contributed by</Text>
            <Text className="text-primary font-bold"> {contributor || ""}</Text>
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
                <RouteItem segment={item} color={TRANSPORTATION_COLORS[index % TRANSPORTATION_COLORS.length]} />
              )}
              keyExtractor={(item) => item.id}
            />
          )}
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
