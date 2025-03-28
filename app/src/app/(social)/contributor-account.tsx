import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  FlatList,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams } from "expo-router";

import {
  getUsername,
  getUserRole,
  getUserPoints,
  getUserJoinedDate,
} from "@services/account-service";

// FIXME Option is broken from new trip, need to fix it
import Option from "@components/ContributeOption";
import UserHeader from "@components/account/UserHeader";

import { useTripData } from "@hooks/use-trip-data";

interface ContributorDetails {
  id: string;
  username: string;
  userRole: string | null;
  points: number;
  joinedDate: string | null;
}

export default function ContributorAccount() {
  const { contributorId, contributorUsername } = useLocalSearchParams();
  const { tripData, segmentData, loading: tripsLoading } = useTripData();

  const [contributor, setContributor] = useState<ContributorDetails>({
    id: contributorId as string,
    username: contributorUsername as string,
    userRole: null,
    points: 0,
    joinedDate: null,
  });
  const [submittedTrips, setSubmittedTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!contributor.id || tripsLoading) return;

    setLoading(true);
    const contributorTrips = tripData.filter((trip) => trip.contributorId === contributor.id);
    setSubmittedTrips(contributorTrips);
    setLoading(false);
  }, [contributor.id, tripData, tripsLoading]);

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
            {/* {loading || tripsLoading ? (
              <ActivityIndicator size="small" />
            ) : submittedTrips.length === 0 ? (
              <Text className="mx-4 mt-4">No submitted trips</Text>
            ) : (
              <FlatList
                data={submittedTrips}
                keyExtractor={(trip) => trip.id}
                renderItem={({ item }) => (
                  <TouchableOpacity>
                    <Option trip={item} segments={segmentData[item.id] || []} />
                  </TouchableOpacity>
                )}
              />
            )} */}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
