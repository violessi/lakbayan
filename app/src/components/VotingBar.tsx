import React, { useState, useEffect } from "react";
import { TouchableOpacity, Image, View, Text } from "react-native";
import { updateVotes, getUserVote, getPoints } from "@services/socials-service";

const upvote = require("@assets/social-upvote.png");
const downvote = require("@assets/social-downvote.png");

interface VotingProps {
  trip: FullTrip;
  userId: string;
}

export default function VotingBar({ trip, userId }: VotingProps) {
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(null);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    async function fetchUserVote() {
      const existingVote = await getUserVote(trip.id, userId);
      setUserVote(existingVote);
    }
    async function fetchTripPoints() {
      const totalPoints = await getPoints(trip);
      setPoints(totalPoints);
    }
    fetchUserVote();
    fetchTripPoints();
  }, [trip, userId]);

  const handleVote = async (newVote: "upvote" | "downvote" | null) => {
    try {
      const updatedVote = userVote === newVote ? null : newVote;
      setUserVote(updatedVote);

      await updateVotes(trip.id, userId, updatedVote);

      const totalPoints = await getPoints(trip);
      setPoints(totalPoints);
    } catch (error) {
      console.error("Error updating vote:", error);
    }
  };

  return (
    <View style={{ flexDirection: "row", gap: 7, alignItems: "center" }}>
      <TouchableOpacity
        onPress={() => handleVote("upvote")}
        style={{ flexDirection: "row", alignItems: "center" }}
      >
        <Image
          source={upvote}
          style={{
            width: 12,
            height: 12,
            tintColor: userVote === "upvote" ? "#E53935" : "#000",
          }}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "bold",
          color:
            userVote === "upvote" ? "#E53935" : userVote === "downvote" ? "#1E88E5" : "#666666",
        }}
      >
        {points}
      </Text>
      <TouchableOpacity
        onPress={() => handleVote("downvote")}
        style={{ flexDirection: "row", alignItems: "center" }}
      >
        <Image
          source={downvote}
          style={{
            width: 12,
            height: 12,
            tintColor: userVote === "downvote" ? "#1E88E5" : "#000",
          }}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
}
