import React from "react";
import { Alert } from "react-native";
import { render, fireEvent, waitFor } from "@testing-library/react-native";

import CommentsList from "@app/(social)/comments-list";
import { useSession } from "@contexts/SessionContext";
import { getComments, addComment } from "@services/socials-service";
import { TESTER_ID } from "@constants/test-constants";

jest.spyOn(Alert, "alert").mockImplementation(() => {});

describe("CommentsList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useSession as jest.Mock).mockReturnValue({
      user: { id: "user123" },
    });
  });

  it("renders correctly with no comments", async () => {
    (getComments as jest.Mock).mockResolvedValue([]);

    const { getByText, getByPlaceholderText } = render(<CommentsList />);

    await waitFor(() => {
      expect(getByText("Loading comments...")).toBeTruthy();
    });

    await waitFor(() => {
      expect(getByText("Comments")).toBeTruthy();
      expect(getByPlaceholderText("Add a comment...")).toBeTruthy();
      expect(getByText("Post")).toBeTruthy();
    });
  });

  it("renders a list of comments", async () => {
    (getComments as jest.Mock).mockResolvedValue([
      {
        id: "1",
        user_id: TESTER_ID,
        content: "This is a comment",
        created_at: "2023-01-01T00:00:00Z",
        is_gps_verified: true,
      },
    ]);

    const { getByText } = render(<CommentsList />);

    await waitFor(() => {
      expect(getByText("This is a comment")).toBeTruthy();
    });
  });

  it("allows the user to add a comment", async () => {
    (getComments as jest.Mock).mockResolvedValueOnce([]).mockResolvedValueOnce([
      {
        id: "1",
        user_id: TESTER_ID,
        content: "This is a comment",
        created_at: "2023-01-01T00:00:00Z",
        is_gps_verified: true,
      },
    ]);

    (addComment as jest.Mock).mockResolvedValue({});

    const { getByPlaceholderText, getByText } = render(<CommentsList />);

    const input = getByPlaceholderText("Add a comment...");
    const postButton = getByText("Post");

    fireEvent.changeText(input, "This is a comment");
    fireEvent.press(postButton);

    await waitFor(() => {
      expect(addComment).toHaveBeenCalledWith("123", "user123", "This is a comment", true);
    });

    await waitFor(() => {
      expect(getByText("This is a comment")).toBeTruthy();
    });
  });

  it("renders GPS verified badge when is_gps_verified is true", async () => {
    (getComments as jest.Mock).mockResolvedValue([
      {
        id: "1",
        user_id: TESTER_ID,
        content: "Verified comment",
        created_at: "2023-01-01T00:00:00Z",
        is_gps_verified: true,
      },
      {
        id: "2",
        user_id: TESTER_ID,
        content: "Unverified comment",
        created_at: "2023-01-02T00:00:00Z",
        is_gps_verified: false,
      },
    ]);

    const { getByText, queryByTestId } = render(<CommentsList />);

    await waitFor(() => {
      expect(getByText("Verified comment")).toBeTruthy();
      expect(getByText("Unverified comment")).toBeTruthy();
    });

    expect(queryByTestId("gps-verified-badge")).toBeTruthy();
  });

  it("does not allow posting an empty comment", async () => {
    const { getByPlaceholderText, getByText } = render(<CommentsList />);

    const input = getByPlaceholderText("Add a comment...");
    const postButton = getByText("Post");

    fireEvent.changeText(input, "   ");
    fireEvent.press(postButton);

    await waitFor(() => {
      expect(addComment).not.toHaveBeenCalled();
    });
  });

  it("handles errors when fetching comments", async () => {
    (getComments as jest.Mock).mockRejectedValue(new Error("Failed to fetch comments"));

    const { getByText } = render(<CommentsList />);

    await waitFor(() => {
      expect(getByText("Loading comments...")).toBeTruthy();
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Error",
        "Failed to get comments. Please try again later.",
      );
    });
  });
});
