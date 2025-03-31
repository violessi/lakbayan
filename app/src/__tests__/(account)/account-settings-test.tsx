import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import AccountSettings from "@app/(account)/account-settings";
import { Alert } from "react-native";
import { useAccountSettings } from "@hooks/use-account-settings";

jest.mock("@hooks/use-account-settings", () => ({
  useAccountSettings: jest.fn(),
}));

jest.spyOn(Alert, "alert").mockImplementation(() => {});

jest.mock("@contexts/SessionContext");

beforeAll(() => {
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
});

describe("AccountSettings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAccountSettings as jest.Mock).mockReturnValue({
      username: "mockuser",
      originalUsername: "mockuser",
      loading: false,
      setUsername: jest.fn(),
      handleUpdateProfile: jest.fn(),
    });
  });

  it("loads and displays user profile", async () => {
    const { getByDisplayValue } = render(<AccountSettings />);
    await waitFor(() => {
      expect(getByDisplayValue("mockuser")).toBeTruthy();
    });
  });

  it("disables update button when username hasn't changed", async () => {
    const { getByTestId } = render(<AccountSettings />);
    await waitFor(() => {
      const updateButton = getByTestId("update-button");
      expect(updateButton).toHaveProp("accessibilityState", { disabled: true });
    });
  });

  it("does not allow changing of username to an existing one", async () => {
    const mockHandleUpdate = jest.fn(() => {
      Alert.alert("Error", "Username already taken. Please choose another.");
    });

    (useAccountSettings as jest.Mock).mockReturnValueOnce({
      username: "taken_username",
      originalUsername: "mockuser",
      loading: false,
      setUsername: jest.fn(),
      handleUpdateProfile: mockHandleUpdate,
      isUsernameUnchanged: jest.fn(() => false),
    });

    const { getByText } = render(<AccountSettings />);
    await waitFor(() => {
      fireEvent.press(getByText("Update"));
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Error",
        expect.stringContaining("Username already taken. Please choose another."),
      );
    });
  });

  it("updates username and shows success alert when valid username is submitted", async () => {
    const mockHandleUpdate = jest.fn(() => {
      Alert.alert("Success", "Username updated successfully!");
    });

    (useAccountSettings as jest.Mock).mockReturnValueOnce({
      username: "new_username",
      originalUsername: "mockuser",
      loading: false,
      setUsername: jest.fn(),
      handleUpdateProfile: mockHandleUpdate,
      isUsernameUnchanged: jest.fn(() => false),
    });

    const { getByText } = render(<AccountSettings />);
    await waitFor(() => {
      fireEvent.press(getByText("Update"));
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Success", "Username updated successfully!");
    });
  });
});
