import React, { useState, useEffect } from "react";
import { Text, View, Image, TouchableOpacity, TextInput, Alert } from "react-native";
import { useRouter } from "expo-router";

import { getPoints } from "@services/socials-service";
import { addComment } from "@services/socials-service";
import { insertJournalEntry } from "@services/journal-service";

import VotingBar from "@components/VotingBar";
import PrimaryButton from "@components/ui/PrimaryButton";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

const comment = require("@assets/social-comment.png");

interface JournalFeedbackProps {
  startLocation: string;
  endLocation: string;
  trip: Trip;
  segments: Segment[];
  currentUserId: string;
  onCommentPress: (tripId: string) => void;
}

export default function JournalFeedback({
  startLocation,
  endLocation,
  trip,
  segments,
  currentUserId,
  onCommentPress,
}: JournalFeedbackProps) {
  const snapPoints = ["10%", "18%", "40%", "72%"];
  const router = useRouter();

  const [points, setPoints] = useState<number>(0);

  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    async function fetchPoints() {
      const points = await getPoints(trip.id);
      setPoints(points || 0);
    }

    fetchPoints();
  }, [trip.contributor_id, trip.id]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    try {
      await addComment(trip.id, currentUserId || "", newComment);
      console.log("Comment added successfully");

      for (const segment of segments) {
        if (segment.id.startsWith("walk")) continue; // Skip generated walk segments

        await insertJournalEntry(
          segment.id,
          currentUserId,
          "2025-03-10T08:00:00Z", // FIXME Placeholder time_start
          "2025-03-10T08:30:00Z", // FIXME Placeholder time_end
          1800, // FIXME Placeholder duration
          false,
          false,
        );
      }

      console.log("Journal entries added successfully");

      Alert.alert("Success", "Your transit journal has been submitted!", [
        {
          text: "OK",
          onPress: () => router.replace("/(tabs)"),
        },
      ]);

      setNewComment("");
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

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
