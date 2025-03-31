import React from "react";
import { render, waitFor, cleanup } from "@testing-library/react-native";
import ContributorAccount from "@app/(social)/contributor-account";
import { useLocalSearchParams } from "expo-router";

import * as accountService from "@services/account-service";
import { useUserTrips } from "@hooks/use-trip-data";

// Mock components (optional to move)
jest.mock("@components/ui/TripPreview", () => "TripPreview");
jest.mock("@components/account/UserHeader", () => "UserHeader");

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve));
}

describe("ContributorAccount screen", () => {
  it("renders contributor's submitted trips section title", async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      contributorId: "abc123",
      contributorUsername: "TestUser",
    });

    (accountService.getUsername as jest.Mock).mockResolvedValue("TestUser");
    (accountService.getUserRole as jest.Mock).mockResolvedValue("Explorer");
    (accountService.getUserPoints as jest.Mock).mockResolvedValue(50);
    (accountService.getUserJoinedDate as jest.Mock).mockResolvedValue("2024-01-01");

    (useUserTrips as jest.Mock).mockReturnValue({
      userTrips: [],
      loading: false,
      error: null,
    });

    const { getByText } = render(<ContributorAccount />);

    await waitFor(() => {
      expect(getByText("TestUser's submitted trips")).toBeTruthy();
    });
  });
});
