import { View, Text, Modal, Pressable } from "react-native";

export default function TransferModal({
  isVisible,
  currentSegment,
  callback,
}: {
  isVisible: boolean;
  currentSegment: Segment | null;
  callback: () => void;
}) {
  if (!currentSegment) return null;
  return (
    <Modal transparent visible={isVisible} animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white px-6 py-6 rounded-xl shadow-lg w-5/6 max-w-md">
          <Text className="text-2xl font-bold text-gray-900 mb-4">Next Segment</Text>

          <Text className="text-gray-700 mb-2">
            {`Travel via `}
            <Text className="font-medium text-gray-900">{currentSegment.segmentMode}</Text>
            {` to `}
            <Text className="font-medium text-gray-900">{currentSegment.endLocation}</Text>
            {` (~${Math.round(currentSegment.duration! / 60)} min)`}
          </Text>

          {currentSegment.instruction && (
            <Text className="text-gray-600 mb-1">
              <Text className="font-medium text-gray-800">Instruction:</Text>{" "}
              {currentSegment.instruction}
            </Text>
          )}

          {currentSegment.landmark && (
            <Text className="text-gray-600 mb-4">
              <Text className="font-medium text-gray-800">Landmark:</Text> {currentSegment.landmark}
            </Text>
          )}

          <Pressable
            className="mt-4 bg-primary py-3 rounded-lg active:bg-primary-60"
            onPress={() => callback()}
          >
            <Text className="text-white text-center font-medium text-lg">Continue</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
