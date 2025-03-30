import React from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";

import { supabase } from "@utils/supabase";
import { createUserProfile, checkUsernameExists } from "@services/account-service";

import SignUp from "../(auth)/sign-up";

import { render, fireEvent, screen, waitFor, act } from "@testing-library/react-native";

jest.useFakeTimers();
jest.spyOn(Alert, "alert").mockImplementation(() => {});

beforeEach(() => {
  jest.clearAllMocks(); // Reset mocks before each test
});

// Mock navigation
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@services/account-service", () => ({
  checkUsernameExists: jest.fn(),
  createUserProfile: jest.fn(),
}));

jest.mock("@utils/supabase", () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
    },
  },
}));

describe("SignUp Component", () => {
  it("renders correctly", () => {
    const { getByText, getByLabelText, getByTestId } = render(<SignUp />);

    const usernameInput = getByTestId("username-input");
    const emailInput = getByTestId("email-input");
    const passwordInput = getByTestId("password-input");

    // Check that inputs exist
    expect(usernameInput).toBeTruthy();
    expect(emailInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();

    // Check that placeholders exist but are initially hidden
    expect(usernameInput.props.placeholder).toBe(" ");
    expect(emailInput.props.placeholder).toBe(" ");
    expect(passwordInput.props.placeholder).toBe(" ");

    // Check text labels
    expect(getByText("Welcome!")).toBeTruthy();
    expect(getByText("Create an account to get started.")).toBeTruthy();
    expect(getByText("Are you a commuter?")).toBeTruthy();
    expect(screen.getAllByText("Username").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Email").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Password").length).toBeGreaterThan(0);

    // Check switch
    const switchInput = getByLabelText("Are you a commuter?");
    expect(switchInput).toBeTruthy();

    // Check button
    const signUpButton = screen.getByTestId("button");
    expect(signUpButton).toBeTruthy();
    expect(getByText("Sign up")).toBeTruthy();

    // Check back button
    const backButton = getByText("Back");
    expect(backButton).toBeTruthy();
  });

  it("renders the Back button and navigates back when pressed", () => {
    const mockBack = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ back: mockBack });

    const { getByTestId } = render(<SignUp />);

    // Ensure the back button is rendered
    const backButton = getByTestId("back-button");
    expect(backButton).toBeTruthy();

    // Simulate button press
    fireEvent.press(backButton);

    // Ensure router.back() was called
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("handles input changes", () => {
    render(<SignUp />);

    const { getByTestId } = render(<SignUp />);

    const usernameInput = getByTestId("username-input");
    const emailInput = getByTestId("email-input");
    const passwordInput = getByTestId("password-input");

    // Simulate input changes
    fireEvent.changeText(usernameInput, "testuser");
    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.changeText(passwordInput, "password123");

    // Check that values have changed
    expect(usernameInput.props.value).toBe("testuser");
    expect(emailInput.props.value).toBe("test@example.com");
    expect(passwordInput.props.value).toBe("password123");
  });

  it("validates inputs correctly", async () => {
    (checkUsernameExists as jest.Mock).mockResolvedValue(false);

    const { getByText, getByTestId } = render(<SignUp />);

    const usernameInput = getByTestId("username-input");
    const emailInput = getByTestId("email-input");
    const passwordInput = getByTestId("password-input");

    fireEvent.changeText(usernameInput, "a");
    fireEvent.changeText(emailInput, "invalid-email");
    fireEvent.changeText(passwordInput, "123");

    await act(async () => {
      fireEvent.press(getByText("Sign up"));
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Invalid input!",
        expect.stringContaining("Username must be at least 3 characters"),
      );
      expect(Alert.alert).toHaveBeenCalledWith(
        "Invalid input!",
        expect.stringContaining("Invalid email format"),
      );
      expect(Alert.alert).toHaveBeenCalledWith(
        "Invalid input!",
        expect.stringContaining("Password must be at least 6 characters"),
      );
    });
  });

  it("shows an error if the username is taken", async () => {
    (checkUsernameExists as jest.Mock).mockResolvedValue(true);

    const { getByText, getByTestId } = render(<SignUp />);

    const usernameInput = getByTestId("username-input");
    const emailInput = getByTestId("email-input");
    const passwordInput = getByTestId("password-input");

    fireEvent.changeText(usernameInput, "abcd");
    fireEvent.changeText(emailInput, "email@gmail.com");
    fireEvent.changeText(passwordInput, "1234567youmakemefeellike11");

    await act(async () => {
      fireEvent.press(getByText("Sign up"));
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Username already taken. Please choose another.");
    });
  });

  it("signs up a user successfully", async () => {
    (checkUsernameExists as jest.Mock).mockResolvedValue(false);
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { user: { id: "123" } },
      error: null,
    });
    (createUserProfile as jest.Mock).mockResolvedValue(undefined);

    const { getByText, getByTestId } = render(<SignUp />);

    const usernameInput = getByTestId("username-input");
    const emailInput = getByTestId("email-input");
    const passwordInput = getByTestId("password-input");

    fireEvent.changeText(usernameInput, "abcd");
    fireEvent.changeText(emailInput, "email@gmail.com");
    fireEvent.changeText(passwordInput, "1234567youmakemefeellike11");

    await act(async () => {
      fireEvent.press(getByText("Sign up"));
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledTimes(1);
      expect(Alert.alert).toHaveBeenCalledWith("Sign-up successful!");
    });
  });

  it("shows an error if sign-up fails", async () => {
    (checkUsernameExists as jest.Mock).mockResolvedValue(false);
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: "Sign-up failed" },
    });

    const { getByText, getByTestId } = render(<SignUp />);

    const usernameInput = getByTestId("username-input");
    const emailInput = getByTestId("email-input");
    const passwordInput = getByTestId("password-input");

    fireEvent.changeText(usernameInput, "abcd");
    fireEvent.changeText(emailInput, "email@gmail.com");
    fireEvent.changeText(passwordInput, "1234567youmakemefeellike11");

    await act(async () => {
      fireEvent.press(getByText("Sign up"));
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Sign-up failed");
    });
  });
});
