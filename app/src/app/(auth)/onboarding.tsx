import { useRef, useState } from "react";
import { useRouter } from "expo-router";
import {
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
} from "react-native";

import PrimaryButton from "@components/ui/PrimaryButton";

const { width } = Dimensions.get("window");

const slides = [
  {
    title: "Navigating the Unknown?",
    text: "Welcome to Lakbayan, your guide to public transportation in the Philippines.",
    image: require("@assets/logo-temp.png"),
  },
  {
    title: "Find Your Way",
    text: "Discover routes, get real-time updates on road conditions, and never feel lost again.",
    image: require("@assets/logo-temp.png"),
  },
  {
    title: "Powered by Commuters",
    text: "Lakbayan thrives on shared knowledge. Contribute, validate, and refine routes with the community.",
    image: require("@assets/logo-temp.png"),
  },
  {
    title: "Let’s Get Moving!",
    text: "You're all set! Find your next ride with Lakbayan.",
    image: require("@assets/logo-temp.png"),
  },
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
      flatListRef.current?.scrollToIndex({ index: currentSlide + 1 });
    } else {
      router.replace("/(auth)/log-in");
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 justify-between my-5">
        {/* Skip button */}
        <View className="flex-row justify-end px-10">
          <TouchableOpacity onPress={() => router.replace("/(auth)/log-in")}>
            <Text className="text-primary font-bold border-b border-primary">Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <FlatList
          testID="onboarding-flatlist"
          ref={flatListRef}
          data={slides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, index) => index.toString()}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setCurrentSlide(index);
          }}
          getItemLayout={(data, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          renderItem={({ item }) => (
            <View className="flex-1 items-center justify-center px-6 gap-3" style={{ width }}>
              <Image source={item.image} className="w-40 h-40 mb-6" resizeMode="contain" />
              <Text className="text-2xl font-semibold text-gray-800 text-center">{item.title}</Text>
              <Text className="text-md text-gray-800 text-center">{item.text}</Text>
            </View>
          )}
        />

        <View className="flex flex-col items-center gap-5">
          {/* Progress Indicator */}
          <View className="flex flex-row gap-1">
            {slides.map((_, index) => (
              <View
                key={index}
                className={`h-2 w-2 rounded-full ${index === currentSlide ? "bg-primary" : "bg-gray-300"}`}
              />
            ))}
          </View>
          <PrimaryButton
            label={currentSlide === slides.length - 1 ? "Get Started" : "Next"}
            onPress={handleNext}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
