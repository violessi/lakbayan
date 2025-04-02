import { View, Text, Modal, Pressable } from "react-native";

export default function CompleteModal({
  isVisible,
  nextCallback,
  cancelCallback,
}: {
  isVisible: boolean;
  nextCallback: () => void;
  cancelCallback: () => void;
}) {
  return (
    <Modal transparent visible={isVisible} animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white px-6 py-6 rounded-xl shadow-lg w-5/6 max-w-md">
          <Text className="text-2xl font-bold text-gray-900 mb-4 text-center">Trip Completed!</Text>

          <Text className="text-gray-700 mb-4 text-center">
            Great job! You've successfully reached your destination.
          </Text>

          <View className="mt-4">
            <Pressable
              className="bg-primary py-3 rounded-lg active:bg-primary/60 mb-2"
              onPress={nextCallback}
            >
              <Text className="text-white text-center font-medium text-lg">Review Trip</Text>
            </Pressable>

            <Pressable
              className="bg-gray-300 py-3 rounded-lg active:bg-gray-400"
              onPress={cancelCallback}
            >
              <Text className="text-gray-800 text-center font-medium text-lg">Return</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
