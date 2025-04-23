import { View, Text } from "react-native";

interface Props {
  currentStep: NavigationSteps | null;
  currentSegment: Segment | null;
}

const JournalInstructions = ({ currentStep, currentSegment }: Props) => {
  return (
    <View style={{ top: 100 }} className="absolute left-5 right-5 bg-white px-5 py-4 rounded-md">
      <Text className="font-bold text-lg text-gray-800 mb-1">
        {currentStep ? currentStep.instruction : "Follow the instructions on the map."}
      </Text>
      {currentSegment?.landmark && (
        <Text className="text-sm text-gray-600 mb-1">
          <Text className="font-semibold">Landmark:</Text> {currentSegment.landmark}
        </Text>
      )}
      {currentSegment?.instruction && (
        <Text className="text-sm text-gray-600">
          <Text className="font-semibold">Instruction:</Text> {currentSegment.instruction}
        </Text>
      )}
    </View>
  );
};

export default JournalInstructions;
