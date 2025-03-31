import React from "react";
import { Alert } from "react-native";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { logoutUser } from "@services/account-service";
import { useRouter } from "expo-router";
import Account from "@app/(tabs)/account";
import { useAccountDetails } from "@hooks/use-account-details";

jest.mock("@hooks/use-account-details");

const mockUseAccountDetails = jest.mocked(useAccountDetails);
const accountDetailsMockData = {
  username: "mockuser",
  userRole: "moderator",
  points: 20,
  joinedDate: "Joined May 25, 2025",
  loading: false,
};

describe("Account Screen", () => {
  let mockRouter: { push: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter = { push: jest.fn() };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    mockUseAccountDetails.mockReturnValue(accountDetailsMockData);
  });

  it("fetches and displays contributor details", async () => {
    const { getByText } = render(<Account />);

    await waitFor(() => {
      expect(getByText("mockuser")).toBeVisible();
      expect(getByText("Moderator")).toBeVisible();
      expect(getByText("20 points")).toBeVisible();
      expect(getByText(/May 25, 2025/)).toBeTruthy();
    });
  });

  it("renders options for trips", async () => {
    const { getByText } = render(<Account />);

    await waitFor(() => {
      expect(getByText("My trips")).toBeVisible();
      expect(getByText("Bookmarked Trips")).toBeVisible();
      expect(getByText("Submitted Trips")).toBeVisible();
      expect(getByText("Account Settings")).toBeVisible();
    });
  });

  it("renders moderation option for moderators", async () => {
    const { getByText } = render(<Account />);

    await waitFor(() => {
      expect(getByText("Moderation")).toBeVisible();
      expect(getByText("Tag routes as verified")).toBeVisible();
    });
  });

  it("does not render moderation option for non-moderators", async () => {
    accountDetailsMockData.userRole = "contributor";
    mockUseAccountDetails.mockReturnValue(accountDetailsMockData);
    const { queryByText } = render(<Account />);

    await waitFor(() => {
      expect(queryByText("Moderation")).toBeNull();
      expect(queryByText("Tag routes as verified")).toBeNull();
    });
  });

  it("handles logout successfully", async () => {
    const { getByText } = render(<Account />);
    const logoutButton = getByText("Log out");
    fireEvent.press(logoutButton);

    await waitFor(() => {
      expect(logoutUser).toHaveBeenCalled();
    });
  });

  it("alerts when logout fails", async () => {
    (logoutUser as jest.Mock).mockRejectedValue(new Error("Logout error"));
    const alertMock = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    const { getByText } = render(<Account />);
    const logoutButton = getByText("Log out");
    fireEvent.press(logoutButton);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith("Logout error");
    });
  });
});
