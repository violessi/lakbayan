import { useRouter } from "expo-router";
import React, { useState, useCallback } from "react";
import { SafeAreaView, Alert, BackHandler } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import Header from "@components/ui/Header";
import NotFound from "@components/journal/NotFound";
import { MapShell } from "@components/map/MapShell";
import LineSource from "@components/map/LineSource";
import CircleSource from "@components/map/CircleSource";
import JournalFeedback from "@components/journal/JournalFeedback";
import UnsavedChangesAlert from "@components/contribute/UnsavedChangesAlert";

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
  const { trip, segments, transitJournal, rating, hasDeviated, setRating, setHasDeviated } = useTransitJournal();
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleCommentPress(tripId: string) {
    router.push({
      pathname: "/(social)/comments-list",
      params: { tripId, is_gps_verified: "true" },
    });
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);
    if (!newComment.trim()) { setIsSubmitting(false); return; }
    if (!trip || !segments || !user) { setIsSubmitting(false); return; }

    const journalPayload: Partial<TransitJournal> = {
      id: transitJournal.id,
      status: "success",
      endTime: new Date().toISOString(),
      rating: rating,
      hasDeviated: hasDeviated,
    };
    console.log((Boolean(hasDeviated) ? "User deviated from the route" : "User did not deviate from the route"));

    try {
      // // TODO: make this atomic
      await addComment(trip.id, user.id, newComment, Boolean(!hasDeviated));

      // // if did not deviate, increment GPS count
      if (!Boolean(hasDeviated)) {
        await incrementSegmentGPSCount(trip.segments.map(({ id }) => id), !Boolean(hasDeviated));
        console.log("Segment GPS count incremented successfully");
      } else {
        console.log("User deviated from the route, not incrementing GPS count");
      }

      await updateTransitJournal(journalPayload);
      await updateProfile({ id: user.id, transitJournalId: null });

      Alert.alert("Success", "Your transit journal has been submitted!", [{ text: "OK" }]);
      setIsSubmitting(false);
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Error", "Failed to submit your transit journal. Please try again.");
    }
  };

  // navigation
  function handleBackNavigation() {
    router.replace("/(journal)/transit-journal");
  }

  function prevCallback() {
    UnsavedChangesAlert(handleBackNavigation);
  }

  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        prevCallback();
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction,
      );

      return () => backHandler.remove();
    }, []),
  );

  if (!trip || !segments || !user) return <NotFound />;

  return (
    <SafeAreaView className="flex-1">
      <Header title="Journal Review" prevCallback={prevCallback} />

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
        rating={rating}
        setRating={setRating}
        hasDeviated={hasDeviated}
        setHasDeviated={setHasDeviated}
        isSubmitting={isSubmitting}
      />
    </SafeAreaView>
  );
}
