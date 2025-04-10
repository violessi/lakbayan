import { useRouter } from "expo-router";
import React, { useState } from "react";
import { SafeAreaView, Alert } from "react-native";

import Header from "@components/ui/Header";
import NotFound from "@components/journal/NotFound";
import { MapShell } from "@components/map/MapShell";
import LineSource from "@components/map/LineSource";
import CircleSource from "@components/map/CircleSource";
import JournalFeedback from "@components/journal/JournalFeedback";

import { useMapView } from "@hooks/use-map-view";
import { useSession } from "@contexts/SessionContext";
import { useTransitJournal } from "@contexts/TransitJournalContext";

import { addComment } from "@services/socials-service";
import {
  updateTransitJournal,
  updateProfile,
  incrementSegmentGPSCount,
} from "@services/trip-service";

export default function JournalReview() {
  const router = useRouter();
  const { user } = useSession();
  const { cameraRef } = useMapView();
  const { trip, segments, transitJournal } = useTransitJournal();
  const [newComment, setNewComment] = useState("");

  function handleCommentPress(tripId: string) {
    router.push({
      pathname: "/(social)/comments-list",
      params: { tripId, is_gps_verified: "true" },
    });
  }

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    if (!trip || !segments || !user) return;

    const journalPayload: Partial<TransitJournal> = {
      id: transitJournal.id,
      status: "success",
      endTime: new Date().toISOString(),
    };

    try {
      // TODO: make this atomic
      await addComment(trip.id, user.id, newComment, true);
      await incrementSegmentGPSCount(trip.segments.map(({ id }) => id));
      await updateTransitJournal(journalPayload);
      await updateProfile({ id: user.id, transitJournalId: null });

      Alert.alert("Success", "Your transit journal has been submitted!", [{ text: "OK" }]);
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Error", "Failed to submit your transit journal. Please try again.");
    }
  };

  if (!trip || !segments || !user) return <NotFound />;

  return (
    <SafeAreaView className="flex-1">
      <Header title="Journal Review" />

      <MapShell fitBounds={[trip.startCoords, trip.endCoords]} cameraRef={cameraRef}>
        <CircleSource id="start" data={[trip.startCoords]} radius={6} />
        <CircleSource id="transfer-points" data={segments} radius={6} />
        <LineSource id="line-source" data={segments} lineWidth={3} />
      </MapShell>

      <JournalFeedback
        trip={trip}
        currentUserId={user.id}
        onCommentPress={handleCommentPress}
        handleSubmit={handleSubmit}
        newComment={newComment}
        setNewComment={setNewComment}
      />
    </SafeAreaView>
  );
}
