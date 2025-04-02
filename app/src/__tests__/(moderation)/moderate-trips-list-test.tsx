import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import ModerateTripsList from "@app/(moderation)/moderate-trips-list";
import { usePendingVerifications } from "@hooks/use-pending-verifications";

jest.mock("@contexts/SessionContext");

jest.mock("@hooks/use-pending-verifications", () => ({
  usePendingVerifications: jest.fn(),
}));

jest.mock("expo-router");

describe("ModerateTripsList", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it("renders correctly", () => {
    (usePendingVerifications as jest.Mock).mockReturnValue({
      loading: false,
      pendingTodas: [],
      pendingTrips: [],
      refetch: jest.fn(),
    });

    const { getByText } = render(<ModerateTripsList />);
    expect(getByText("Community Moderation")).toBeTruthy();
    expect(getByText("Pending Verifications")).toBeTruthy();
  });

  it("displays a loading spinner while fetching data", async () => {
    (usePendingVerifications as jest.Mock).mockReturnValue({
      loading: true,
      pendingTrips: [],
      pendingTodas: [],

      refetch: jest.fn(),
    });

    const { getByTestId } = render(<ModerateTripsList />);

    await waitFor(() => {
      expect(getByTestId("activity-indicator")).toBeTruthy();
    });
  });

  it("shows message when no pending trips exist", async () => {
    (usePendingVerifications as jest.Mock).mockReturnValue({
      loading: false,
      pendingTrips: [],
      pendingTodas: [],

      refetch: jest.fn(),
    });

    const { getByText } = render(<ModerateTripsList />);

    await waitFor(() => {
      expect(getByText("No pending verifications.")).toBeTruthy();
    });
  });

  it("displays a list of pending trips", async () => {
    const trips = [
      {
        id: "trip-1",
        startLocation: "Location A",
        endLocation: "Location B",
        segments: [],
      },
    ];

    (usePendingVerifications as jest.Mock).mockReturnValue({
      loading: false,
      pendingTrips: trips,
      pendingTodas: [],

      refetch: jest.fn(),
    });
    const { getByText } = render(<ModerateTripsList />);

    await waitFor(() => {
      expect(getByText("Location A to Location B")).toBeTruthy();
    });
  });

  it("navigates to trip review on trip press", async () => {
    const trip = {
      id: "trip-1",
      startLocation: "Loc A",
      endLocation: "Loc B",
      segments: [],
    };

    (usePendingVerifications as jest.Mock).mockReturnValue({
      loading: false,
      pendingTrips: [trip],
      pendingTodas: [],

      refetch: jest.fn(),
    });

    const { getByText } = render(<ModerateTripsList />);

    await waitFor(() => {
      fireEvent.press(getByText("Loc A to Loc B"));
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith({
        pathname: "/(moderation)/moderate-trip-review",
        params: {
          tripData: JSON.stringify({
            ...trip,
            preSegment: null,
            postSegment: null,
          }),
        },
      });
    });
  });
});
