import React, { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, SafeAreaView, Alert } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { useLocalSearchParams } from "expo-router";
import { useSession } from "@contexts/SessionContext";
import { getComments, addComment } from "@services/socials-service";

import Header from "@components/ui/Header";
import CommentItem from "@components/ui/CommentItem";
import PrimaryButton from "@components/ui/PrimaryButton";
import { set } from "lodash";

export default function CommentsList() {
  const { user } = useSession();
  const params = useLocalSearchParams();
  const tripId = Array.isArray(params.tripId) ? params.tripId[0] : params.tripId;
  const isGpsVerified = params.is_gps_verified === "true";

  const [comments, setComments] = useState<CommentData[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchComments() {
      setLoading(true);
      try {
        const fetchedComments = await getComments(tripId);
        setComments(fetchedComments || []);
      } catch {
        Alert.alert("Error", "Failed to get comments. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchComments();
  }, [tripId]);

  const handleCommentSubmit = async () => {
    setIsSubmitting(true);
    if (!content.trim()) {
      setIsSubmitting(false);
      return;
    }
    try {
      await addComment(tripId, user?.id || "", content, isGpsVerified);
      const updatedComments = await getComments(tripId);
      setComments(updatedComments || []);
      setContent("");
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      console.error("Error adding comment:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <Header title="Comments" />

      <View className="flex-1 px-4 py-2">
        <View className="flex-1">
          {loading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator animating={true} size="large" />
            </View>
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <CommentItem
                  userId={item.userId}
                  username={item.username}
                  content={item.content}
                  createdAt={item.createdAt}
                  isGpsVerified={item.isGpsVerified}
                />
              )}
            />
          )}
        </View>

        {/* Add Comment Input */}
        <View className="flex-row mt-4 gap-3">
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Add a comment..."
            className="flex-1 border border-gray-200 rounded-lg px-3"
            testID="comment-input"
          />
          <PrimaryButton
            label="Post"
            onPress={handleCommentSubmit}
            disabled={isSubmitting || !content}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
