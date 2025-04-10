import {
  SafeAreaView,
  View,
  FlatList,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";

import { useSession } from "@contexts/SessionContext";
import { useSubmittedTrips } from "@hooks/use-submitted-trips";

import Header from "@components/ui/Header";
import TripPreview from "@components/ui/TripPreview";

export default function SubmittedTrips() {
  const { user } = useSession();
  const router = useRouter();

  const { submittedTrips, loading } = useSubmittedTrips(user?.id || null);

  function handleTripPress(trip: TripSearch) {
    router.push({
      pathname: "/(search)/3-trip-overview",
      params: { tripData: JSON.stringify(trip) },
    });
  }

  return (
    <SafeAreaView className="flex-1">
      <Header title="Submitted Trips" />
      <View className="flex-1 p-4">
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
              <View className="flex flex-col justify-center mt-5">
                <TouchableOpacity onPress={() => handleTripPress(trip)}>
                  <View className="flex flex-row justify-center">
                    <Text className="text-sm text-center">
                      {trip.startLocation} to {trip.endLocation}
                    </Text>
                  </View>
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
