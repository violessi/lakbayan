import React, { useState, useEffect } from "react";
import { Text, View, Image, TouchableOpacity, TextInput } from "react-native";

import { getPoints } from "@services/socials-service";

import VotingBar from "@components/VotingBar";
import PrimaryButton from "@components/ui/PrimaryButton";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

const comment = require("@assets/social-comment.png");

interface JournalFeedbackProps {
  trip: Trip;
  currentUserId: string;
  onCommentPress: (tripId: string) => void;
  handleSubmit: () => void;
  newComment: string;
  setNewComment: (comment: string) => void;
}

export default function JournalFeedback({
  trip,
  currentUserId,
  onCommentPress,
  handleSubmit,
  newComment,
  setNewComment,
}: JournalFeedbackProps) {
  const snapPoints = ["10%", "18%", "40%", "72%"];

  const [points, setPoints] = useState<number>(0);

  useEffect(() => {
    async function fetchPoints() {
      const points = await getPoints(trip.id);
      setPoints(points || 0);
    }

    fetchPoints();
  }, [trip.contributorId, trip.id]);

  return (
    <BottomSheet snapPoints={snapPoints} index={2}>
      <BottomSheetView className="flex flex-col px-5 gap-2">
        <View className="flex flex-row justify-between">
          <View className="flex flex-row">
            <Text className="text-lg font-bold">Share your experience!</Text>
          </View>
          <View className="flex flex-row gap-3 items-center">
            <VotingBar tripId={trip.id} userId={currentUserId} />
            <TouchableOpacity onPress={() => onCommentPress(trip.id)}>
              <Image source={comment} style={{ width: 12, height: 12 }} resizeMode="contain" />
            </TouchableOpacity>
          </View>
        </View>
        <View className="flex-row mt-4 gap-3">
          <TextInput
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Add a comment..."
            className="flex-1 border border-gray-200 rounded-lg px-3"
          />
          <PrimaryButton label="Submit" onPress={handleSubmit} />
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
