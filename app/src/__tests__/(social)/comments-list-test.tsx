import React from "react";
import { Alert } from "react-native";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import CommentsList from "@app/(social)/comments-list";
import { useLocalSearchParams } from "expo-router";
import { getComments, addComment } from "@services/socials-service";

jest.mock("expo-router");
jest.mock("@contexts/SessionContext");

jest.spyOn(Alert, "alert").mockImplementation(() => {});

const mockComment = (overrides = {}) => ({
  id: "1",
  user_id: "mockcommentuser",
  content: "This is a comment",
  created_at: "2023-01-01T00:00:00Z",
  is_gps_verified: true,
  ...overrides,
});

describe("CommentsList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      tripId: "mocktrip",
      is_gps_verified: "true",
    });
  });

  it("shows loading then displays empty comment UI", async () => {
    (getComments as jest.Mock).mockResolvedValue([]);

    const { getByText, getByPlaceholderText } = render(<CommentsList />);

    await waitFor(() => expect(getByText("Loading comments...")).toBeTruthy());
    expect(getByText("Comments")).toBeTruthy();
    expect(getByPlaceholderText("Add a comment...")).toBeTruthy();
    expect(getByText("Post")).toBeTruthy();
  });

  it("displays a list of comments", async () => {
    (getComments as jest.Mock).mockResolvedValue([mockComment()]);

    const { getByText } = render(<CommentsList />);

    await waitFor(() => {
      expect(getByText("This is a comment")).toBeTruthy();
    });
  });

  it("lets the user add a comment", async () => {
    (getComments as jest.Mock).mockResolvedValueOnce([]).mockResolvedValueOnce([mockComment()]);
    (addComment as jest.Mock).mockResolvedValue({});

    const { getByPlaceholderText, getByText } = render(<CommentsList />);
    fireEvent.changeText(getByPlaceholderText("Add a comment..."), "This is a comment");
    fireEvent.press(getByText("Post"));

    await waitFor(() => {
      expect(addComment).toHaveBeenCalledWith(
        "mocktrip",
        "3aa3a6d1-aef3-44c1-a02b-dc5db06f184a",
        "This is a comment",
        true,
      );
    });

    expect(getByText("This is a comment")).toBeTruthy();
  });

  it("renders GPS verified badge when is_gps_verified is true", async () => {
    (getComments as jest.Mock).mockResolvedValue([
      mockComment({ id: "1", content: "Verified", is_gps_verified: true }),
      mockComment({ id: "2", content: "Unverified", is_gps_verified: false }),
    ]);

    const { getByText, queryByTestId } = render(<CommentsList />);

    await waitFor(() => {
      expect(getByText("Verified")).toBeTruthy();
      expect(getByText("Unverified")).toBeTruthy();
    });

    expect(queryByTestId("gps-verified-badge")).toBeTruthy();
  });

  it("does not submit blank comments", async () => {
    const { getByPlaceholderText, getByText } = render(<CommentsList />);
    fireEvent.changeText(getByPlaceholderText("Add a comment..."), "   ");
    fireEvent.press(getByText("Post"));

    await waitFor(() => {
      expect(addComment).not.toHaveBeenCalled();
    });
  });

  it("alerts on error while fetching comments", async () => {
    (getComments as jest.Mock).mockRejectedValue(new Error("Failed to fetch comments"));

    const { getByText } = render(<CommentsList />);

    await waitFor(() => expect(getByText("Loading comments...")).toBeTruthy());

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Error",
        "Failed to get comments. Please try again later.",
      );
    });
  });
});
