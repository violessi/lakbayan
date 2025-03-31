// account.test.tsx
import React from "react";
import { Alert } from "react-native";
import { render, fireEvent, waitFor, screen } from "@testing-library/react-native";
import { getUserRole, logoutUser } from "@services/account-service";
import { useRouter } from "expo-router";
import Account from "@app/(tabs)/account";

jest.mock("@services/account-service");
jest.mock("@contexts/SessionContext");

describe("Account Screen", () => {
  let mockRouter: { push: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter = { push: jest.fn() };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it("fetches and displays contributor details", async () => {
    const { getByText } = render(<Account />);

    await waitFor(() => {
      expect(getByText("mockuser")).toBeTruthy();
      expect(getByText("Moderator")).toBeTruthy();
      expect(getByText("20 points")).toBeTruthy();
      expect(getByText("Joined May 25, 2025")).toBeTruthy();
    });
  });

  it("renders options for trips", async () => {
    const { getByText } = render(<Account />);

    await waitFor(() => {
      expect(getByText("My trips")).toBeTruthy();
      expect(getByText("Bookmarked Trips")).toBeTruthy();
      expect(getByText("Submitted Trips")).toBeTruthy();
      expect(getByText("Account Settings")).toBeTruthy();
    });
  });

  it("renders moderation option for moderators", async () => {
    (getUserRole as jest.Mock).mockResolvedValue("moderator");
    const { getByText } = render(<Account />);

    await waitFor(() => {
      expect(getByText("Moderation")).toBeTruthy();
      expect(getByText("Tag routes as verified")).toBeTruthy();
    });
  });

  it("does not render moderation option for non-moderators", async () => {
    (getUserRole as jest.Mock).mockResolvedValue("contributor");
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
