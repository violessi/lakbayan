import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import ContributorAccount from "@app/(social)/contributor-account";
import { useLocalSearchParams } from "expo-router";

import { mockFullTrip } from "@test-utils/mock-trip";
import { useUserTrips } from "@hooks/use-trip-data";

const mockTrips = [
  mockFullTrip({ id: "trip1", mode: "Jeep", duration: 600, cost: 13 }),
  mockFullTrip({ id: "trip2", mode: "Train", duration: 240, cost: 15 }),
];

jest.mock("@services/account-service");
jest.mock("@services/socials-service");
jest.mock("@contexts/SessionContext");
jest.mock("expo-router");

afterEach(() => {
  jest.clearAllMocks();
});

describe("ContributorAccount screen", () => {
  beforeEach(() => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      contributorId: "user123",
      contributorUsername: "bob3030",
    });
  });

  it("renders submitted trips with relevant data", async () => {
    (useUserTrips as jest.Mock).mockReturnValue({
      userTrips: mockTrips,
      loading: false,
      error: null,
    });

    const { getByText, getAllByText } = render(<ContributorAccount />);
    await waitFor(() => {
      expect(getByText("mockuser's submitted trips")).toBeTruthy();
      expect(getByText("Jeep")).toBeTruthy();
      expect(getByText("₱13.00")).toBeTruthy();
      expect(getByText(/10\s*min/)).toBeTruthy(); // 600s = 10 min
      expect(getByText(/4\s*min/)).toBeTruthy(); // 240s = 4 min
      expect(getAllByText("29")).toHaveLength(2);
      expect(getAllByText("58")).toHaveLength(2);
      expect(getAllByText("92")).toHaveLength(2);
    });
  });

  it("shows loading indicator when fetching trips", async () => {
    (useUserTrips as jest.Mock).mockReturnValue({
      userTrips: [],
      loading: true,
      error: null,
    });

    const { getByTestId, queryByTestId } = render(<ContributorAccount />);

    expect(getByTestId("ActivityIndicator")).toBeTruthy();

    await waitFor(() => {
      expect(queryByTestId("ActivityIndicator")).toBeTruthy();
    });
  });

  it("shows empty state when user has no trips", async () => {
    (useUserTrips as jest.Mock).mockReturnValue({
      userTrips: [],
      loading: false,
      error: null,
    });

    const { getByText } = render(<ContributorAccount />);

    await waitFor(() => {
      expect(getByText("No submitted trips")).toBeTruthy();
    });
  });

  it("shows user info like username, role, points, and join date", async () => {
    (useUserTrips as jest.Mock).mockReturnValue({
      userTrips: [],
      loading: false,
      error: null,
    });

    const { getByText } = render(<ContributorAccount />);

    await waitFor(() => {
      expect(getByText("mockuser")).toBeTruthy();
      expect(getByText("Moderator")).toBeTruthy();
      expect(getByText("20 points")).toBeTruthy();
      expect(getByText("Joined May 25, 2025")).toBeTruthy();
    });
  });
});
