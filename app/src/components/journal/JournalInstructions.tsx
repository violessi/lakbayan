import { View, Text } from "react-native";

interface Props {
  currentStep: NavigationSteps | null;
  currentSegment: Segment | null;
}

const JournalInstructions = ({ currentStep, currentSegment }: Props) => {
  return (
    <View className="w-full bg-white px-4 py-2">
      {currentStep ? (
        <Text className="font-bold text-lg">{currentStep.instruction}</Text>
      ) : (
        <Text className="font-bold text-lg">Follow the instructions on the map.</Text>
      )}
      {currentSegment?.landmark && (
        <Text className="text-sm">Landmark: {currentSegment.landmark}</Text>
      )}
      {currentSegment?.instruction && (
        <Text className="text-sm">Instruction: {currentSegment.instruction}</Text>
      )}
    </View>
  );
};

export default JournalInstructions;
