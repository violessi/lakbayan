import React, { useState, useEffect } from "react";
import { TouchableOpacity, Image, View, Text } from "react-native";
import { updateVotes, getUserVote, getPoints } from "@services/socials-service";

const upvote = require("@assets/social-upvote.png");
const downvote = require("@assets/social-downvote.png");

interface VotingProps {
  tripId: string;
  userId: string;
}

export default function VotingBar({ tripId, userId }: VotingProps) {
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(null);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    async function fetchUserVote() {
      const existingVote = await getUserVote(tripId, userId);
      setUserVote(existingVote);
    }
    async function fetchTripPoints() {
      const totalPoints = await getPoints(tripId);
      setPoints(totalPoints);
    }
    fetchUserVote();
    fetchTripPoints();
  }, [tripId, userId]);

  const handleVote = async (newVote: "upvote" | "downvote" | null) => {
    try {
      const updatedVote = userVote === newVote ? null : newVote;
      setUserVote(updatedVote);

      await updateVotes(tripId, userId, updatedVote);

      const totalPoints = await getPoints(tripId);
      setPoints(totalPoints);
    } catch (error) {
      console.error("Error updating vote:", error);
    }
  };

  return (
    <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
      <TouchableOpacity onPress={() => handleVote("upvote")} style={{ flexDirection: "row", alignItems: "center" }}>
        <Image
          source={upvote}
          style={{
            width: 12,
            height: 12,
            tintColor: userVote === "upvote" ? "#7F55D9" : "#000",
          }}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <Text style={{ fontSize: 14 }}>{points}</Text>
      <TouchableOpacity onPress={() => handleVote("downvote")} style={{ flexDirection: "row", alignItems: "center" }}>
        <Image
          source={downvote}
          style={{
            width: 12,
            height: 12,
            tintColor: userVote === "downvote" ? "#7F55D9" : "#000",
          }}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
}
