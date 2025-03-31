import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  FlatList,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

import {
  getUsername,
  getUserRole,
  getUserPoints,
  getUserJoinedDate,
} from "@services/account-service";

import UserHeader from "@components/account/UserHeader";
import TripPreview from "@components/ui/TripPreview";

import { useUserTrips } from "@hooks/use-trip-data";

interface ContributorDetails {
  id: string;
  username: string;
  userRole: string | null;
  points: number;
  joinedDate: string | null;
}

export default function ContributorAccount() {
  const { contributorId, contributorUsername } = useLocalSearchParams();
  const router = useRouter();

  // Default values for contributor details
  const [contributor, setContributor] = useState<ContributorDetails>({
    id: contributorId as string,
    username: contributorUsername as string,
    userRole: null,
    points: 0,
    joinedDate: null,
  });

  const [submittedTrips, setSubmittedTrips] = useState<FullTrip[]>([]);
  const [loading, setLoading] = useState(true);

  const { userTrips, loading: tripsLoading, error } = useUserTrips(contributor.id);

  useEffect(() => {
    if (!contributor.id || tripsLoading) return;
    setLoading(true);
    setSubmittedTrips(userTrips);
    setLoading(false);
  }, [contributor.id, userTrips, tripsLoading]);

  useEffect(() => {
    async function fetchContributorData() {
      try {
        const [username, userRole, userPoints, userJoinedDate] = await Promise.all([
          getUsername(contributor.id),
          getUserRole(contributor.id),
          getUserPoints(contributor.id),
          getUserJoinedDate(contributor.id),
        ]);

        setContributor((prev) => ({
          ...prev,
          username: username ?? prev.username,
          userRole: userRole ?? prev.userRole,
          points: userPoints ?? prev.points,
          joinedDate: userJoinedDate ?? prev.joinedDate,
        }));
      } catch (error) {
        console.error("Failed to fetch contributor details", error);
      }
    }

    if (contributor.id) {
      fetchContributorData();
    }
  }, [contributor.id]);

  function handleTripPress(trip: FullTrip) {
    const tripSearch: TripSearch = {
      ...trip,
      segments: trip.segments,
      preSegment: null,
      postSegment: null,
    };

    router.push({
      pathname: "/(search)/3-trip-overview",
      params: { tripData: JSON.stringify(tripSearch) },
    });
  }

  return (
    <SafeAreaView className="flex-1">
      <UserHeader
        username={contributor.username || "User"}
        role={contributor.userRole || "User"}
        points={contributor.points}
        joinedDate={contributor.joinedDate}
        hasBack={true}
      />

      <View className="flex-1 p-4 justify-between">
        <View>
          <View className="pb-10 border-b-1">
            <Text className="text-black text-xl font-bold mx-4 mt-4">
              {contributor.username}'s submitted trips
            </Text>
            {loading || tripsLoading ? (
              <ActivityIndicator size="small" testID="ActivityIndicator" />
            ) : submittedTrips.length === 0 ? (
              <Text className="mx-4 mt-4">No submitted trips</Text>
            ) : (
              <FlatList
                data={submittedTrips}
                keyExtractor={(trip) => trip.id}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handleTripPress(item)}>
                    <TripPreview trip={item} />
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
