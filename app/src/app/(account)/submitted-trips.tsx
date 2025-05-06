import {
  SafeAreaView,
  View,
  FlatList,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  BackHandler,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

import { useSession } from "@contexts/SessionContext";
import { useSubmittedTrips } from "@hooks/use-submitted-trips";

import Header from "@components/ui/Header";
import TripPreview from "@components/ui/TripPreview";
import { SourceDestinationTitle } from "@components/ui/SourceDestinationTitle";

export default function SubmittedTrips() {
  const { user } = useSession();
  const router = useRouter();

  const { submittedTrips, loading } = useSubmittedTrips(user?.id || null);

  function handleTripPress(trip: TripSearch) {
    router.replace({
      pathname: "/(search)/3-trip-overview",
      params: { tripData: JSON.stringify(trip), from: "submitted-trips" },
    });
  }

  // navigation
  function prevCallback() {
    router.replace("/(tabs)/account");
  }

  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        prevCallback();
        return true;
      };

      const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

      return () => backHandler.remove();
    }, []),
  );

  return (
    <SafeAreaView className="flex-1">
      <Header title="Submitted Trips" prevCallback={prevCallback} />
      <View className="flex-1 px-4">
        {loading ? (
          <ActivityIndicator size="small" testID="activity-indicator" />
        ) : submittedTrips.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text>No submitted trips</Text>
          </View>
        ) : (
          <FlatList
            data={submittedTrips}
            keyExtractor={(trip) => trip.id}
            renderItem={({ item: trip }) => (
              <View className="flex flex-col justify-center mt-3">
                <TouchableOpacity onPress={() => handleTripPress(trip)}>
                  <SourceDestinationTitle
                    start={trip.startLocation ?? ""}
                    end={trip.endLocation ?? ""}
                  />
                  <View>
                    <TripPreview trip={trip} />
                  </View>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
