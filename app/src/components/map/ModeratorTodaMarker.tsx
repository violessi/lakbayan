import React, { useEffect, useState } from "react";

import { View } from "react-native";

import { updateModerationStatus } from "@services/moderation-service";

import PrimaryButton from "@components/ui/PrimaryButton";
import SecondaryButton from "@components/ui/SecondaryButton";
import TodaMarker from "@components/map/TodaMarker";
import { TodaMarkerModal } from "@components/map/TodaMarkerModal";

import { getUsername } from "@services/account-service";
interface Props {
  stop: StopData;
  moderatorId: string;
  onActionComplete: (action: "verified" | "dismissed") => void;
}

export default function ModeratorTodaMarker({ stop, moderatorId, onActionComplete }: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [username, setUsername] = useState("Anonymous");

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const fetchedUsername = await getUsername(stop.contributor_id);
        setUsername(fetchedUsername || "Anonymous");
      } catch (error) {
        console.error("Error fetching username:", error);
      }
    };
    fetchUsername();
  });

  const handleUpdateModerationStatus = async (status: "verified" | "dismissed") => {
    try {
      await updateModerationStatus(moderatorId, stop.id, status);
      setModalVisible(false);
      onActionComplete(status);
    } catch (error) {
      console.error("Error updating moderation status:", error);
    }
  };

  return (
    <>
      <TodaMarker stop={stop} onPress={() => setModalVisible(true)} disableDefaultModal />

      <TodaMarkerModal
        stop={stop}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        username={username}
      >
        <View className="flex flex-row justify-between gap-2 mt-2">
          <SecondaryButton
            label="Dismiss"
            onPress={() => handleUpdateModerationStatus("dismissed")}
          />
          <PrimaryButton label="Verify" onPress={() => handleUpdateModerationStatus("verified")} />
        </View>
      </TodaMarkerModal>
    </>
  );
}
