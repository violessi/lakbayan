import React, { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, SafeAreaView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSession } from "@contexts/SessionContext";
import { getComments, addComment } from "@services/socials-service";

import Header from "@components/ui/Header";
import CommentItem from "@components/ui/CommentItem";
import PrimaryButton from "@components/ui/PrimaryButton";

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export default function CommentsList() {
  const { user } = useSession();
  const params = useLocalSearchParams();
  const tripId = Array.isArray(params.tripId) ? params.tripId[0] : params.tripId;

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchComments() {
      setLoading(true);
      try {
        const fetchedComments = await getComments(tripId);
        setComments(fetchedComments || []);
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchComments();
  }, [tripId]);

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;

    try {
      await addComment(tripId, user?.id || "", newComment);
      const updatedComments = await getComments(tripId);
      setComments(updatedComments || []);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <Header title="Comments" />

      <View className="flex-1 px-4 py-2">
        {loading ? (
          <Text>Loading comments...</Text>
        ) : (
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <CommentItem
                userId={item.user_id}
                content={item.content}
                createdAt={item.created_at}
              />
            )}
          />
        )}

        {/* Add Comment Input */}
        <View className="flex-row mt-4 gap-3">
          <TextInput
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Add a comment..."
            className="flex-1 border border-gray-200 rounded-lg px-3"
          />
          <PrimaryButton label="Post" onPress={handleCommentSubmit} />
        </View>
      </View>
    </SafeAreaView>
  );
}
