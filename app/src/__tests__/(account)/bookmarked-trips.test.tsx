import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import BookmarkedTrips from "@app/(account)/bookmarked-trips";
import { useRouter } from "expo-router";
import { useBookmarks } from "@hooks/use-bookmarks";
import { getBookmarks } from "@services/socials-service";

jest.mock("@contexts/SessionContext");
jest.mock("@hooks/use-bookmarks");
jest.mock("expo-router");

describe("BookmarkedTrips Screen", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it("renders correctly", () => {
    (useBookmarks as jest.Mock).mockReturnValue({
      bookmarks: [],
      loading: true,
    });
    const { getByText } = render(<BookmarkedTrips />);
    expect(getByText("Bookmarked Trips")).toBeTruthy();
  });

  it("shows loading indicator when loading", () => {
    (useBookmarks as jest.Mock).mockReturnValue({
      bookmarks: [],
      loading: true,
    });

    const { getByTestId } = render(<BookmarkedTrips />);
    expect(getByTestId("activity-indicator")).toBeTruthy();
  });

  it("shows message when no bookmarked trips", async () => {
    (useBookmarks as jest.Mock).mockReturnValue({
      bookmarks: [],
      loading: false,
    });

    const { getByText } = render(<BookmarkedTrips />);
    await waitFor(() => {
      expect(getByText("No bookmarked trips")).toBeTruthy();
    });
  });

  it("renders a list of bookmarked trips", async () => {
    (useBookmarks as jest.Mock).mockReturnValue({
      loading: false,
      bookmarks: [
        {
          id: "trip-1",
          startLocation: "A",
          endLocation: "B",
          segments: [],
        },
      ],
    });

    const { getByText } = render(<BookmarkedTrips />);
    await waitFor(() => {
      expect(getByText("A to B")).toBeTruthy();
    });
  });

  it("displays bookmarked icon for each bookmarked trip", async () => {
    (useBookmarks as jest.Mock).mockReturnValue({
      loading: false,
      bookmarks: [
        {
          id: "trip-1",
          startLocation: "A",
          endLocation: "B",
          segments: [],
        },
      ],
    });

    (getBookmarks as jest.Mock).mockResolvedValue(["trip-1"]);

    const { getByTestId } = render(<BookmarkedTrips />);
    await waitFor(() => {
      expect(getByTestId("bookmarked-icon")).toBeTruthy();
    });
  });
});
