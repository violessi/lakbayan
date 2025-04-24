import React, { useState, useEffect } from "react";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Text, View, Image, TouchableOpacity, TextInput } from "react-native";

import VotingBar from "@components/VotingBar";
import PrimaryButton from "@components/ui/PrimaryButton";

import { getPoints } from "@services/socials-service";
const comment = require("@assets/social-comment.png");

interface JournalFeedbackProps {
  trip: Trip;
  currentUserId: string;
  onCommentPress: (tripId: string) => void;
  handleSubmit: () => void;
  newComment: string;
  setNewComment: (comment: string) => void;
  rating: number | null;
  setRating: (rating: number | null) => void;
  hasDeviated: boolean | null;
  setHasDeviated: (hasDeviated: boolean | null) => void;
  isSubmitting?: boolean;
}

const RATING: Record<number, string> = {
  0: "Very Bad",
  1: "Bad",
  2: "Okay",
  3: "Good",
  4: "Very Good",
};

export default function JournalFeedback({
  trip,
  currentUserId,
  onCommentPress,
  handleSubmit,
  newComment,
  setNewComment,
  rating,
  setRating,
  hasDeviated,
  setHasDeviated,
  isSubmitting,
}: JournalFeedbackProps) {
  const snapPoints = ["10%", "18%", "40%", "72%"];

  const [points, setPoints] = useState<number>(0);

  useEffect(() => {
    async function fetchPoints() {
      const points = await getPoints(trip);
      setPoints(points || 0);
    }

    fetchPoints();
  }, [trip.contributorId, trip.id]);

  const canSubmit = rating !== null && hasDeviated !== null && newComment.trim();

  return (
    <BottomSheet snapPoints={snapPoints} index={2}>
      <BottomSheetView className="flex flex-col px-5 gap-2">
        <View className="flex flex-row justify-between">
          <View className="flex flex-row">
            <Text className="text-lg font-bold">Share your experience!</Text>
          </View>
          <View className="flex flex-row gap-3 items-center">
            <VotingBar trip={trip} userId={currentUserId} />
            <TouchableOpacity onPress={() => onCommentPress(trip.id)}>
              <Image source={comment} style={{ width: 12, height: 12 }} resizeMode="contain" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex gap-4">
          <Text className="text-sm text-gray-500">How can you rate the trip on its accuracy?</Text>
          <View className="flex-row justify-center gap-2">
            {Object.entries(RATING).map(([key, label]) => {
              const numericKey = parseInt(key);
              const isSelected = rating === numericKey;
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => setRating(numericKey)}
                  className={`px-3 py-2 rounded-lg ${isSelected ? "bg-blue-500" : "bg-gray-200"}`}
                >
                  <Text className={`text-sm ${isSelected ? "text-white font-bold" : "text-gray-800"}`}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text className="text-sm text-gray-500">Has your actual transit deviate from the trip?</Text>
          <View className="flex-row justify-center gap-2">
            <TouchableOpacity
              onPress={() => setHasDeviated(true)}
              className={`px-3 py-2 rounded-lg ${hasDeviated === true ? "bg-blue-500" : "bg-gray-200"}`}
            >
              <Text className={`text-sm ${hasDeviated === true ? "text-white font-bold" : "text-gray-800"}`}>
                Yes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setHasDeviated(false)}
              className={`px-3 py-2 rounded-lg ${hasDeviated === false ? "bg-blue-500" : "bg-gray-200"}`}
            >
              <Text className={`text-sm ${hasDeviated === false ? "text-white font-bold" : "text-gray-800"}`}>
                No
              </Text>
            </TouchableOpacity>
          </View>

          <Text className="text-sm text-gray-500">Share your thoughts on the trip!</Text>
          <TextInput
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Add a comment..."
            className="border border-gray-200 rounded-lg p-4"
            multiline
          />
          <PrimaryButton label="Submit" onPress={handleSubmit} disabled={!canSubmit || isSubmitting} />
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
