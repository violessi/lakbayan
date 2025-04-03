import { View, Text } from "react-native";

interface Props {
  currentStep: NavigationSteps | null;
  currentSegment: Segment | null;
}

const JournalInstructions = ({ currentStep, currentSegment }: Props) => {
  return (
    <View className="absolute top-0 w-full bg-white p-4">
      {currentStep ? (
        <Text className="font-bold text-lg mb-2">{currentStep.instruction}</Text>
      ) : (
        <Text className="font-bold text-lg mb-2">Follow the instructions on the map.</Text>
      )}
      {currentSegment?.landmark && (
        <Text className="text-sm mb-2">Landmark: {currentSegment?.landmark}</Text>
      )}
      {currentSegment?.instruction && (
        <Text className="text-sm mb-2">Instruction: {currentSegment?.instruction}</Text>
      )}
    </View>
  );
};

export default JournalInstructions;
