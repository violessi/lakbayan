import React from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { render, fireEvent, screen, waitFor, act } from "@testing-library/react-native";

import { supabase } from "@utils/supabase";
import { createUserProfile, checkUsernameExists } from "@services/account-service";
import SignUp from "../sign-up";

jest.useFakeTimers();
jest.spyOn(Alert, "alert").mockImplementation(() => {});

jest.mock("expo-router", () => ({ useRouter: jest.fn() }));
jest.mock("@services/account-service", () => ({
  checkUsernameExists: jest.fn(),
  createUserProfile: jest.fn(),
}));
jest.mock("@utils/supabase", () => ({
  supabase: { auth: { signUp: jest.fn() } },
}));

beforeEach(() => jest.clearAllMocks());

describe("SignUp Component", () => {
  const setup = () => {
    const utils = render(<SignUp />);
    return {
      ...utils,
      usernameInput: screen.getByTestId("username-input"),
      emailInput: screen.getByTestId("email-input"),
      passwordInput: screen.getByTestId("password-input"),
      signUpButton: screen.getByTestId("button"),
      backButton: screen.getByTestId("back-button"),
    };
  };

  it("renders correctly", () => {
    const { usernameInput, emailInput, passwordInput, signUpButton, backButton } = setup();

    expect(usernameInput).toBeTruthy();
    expect(emailInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();
    expect(signUpButton).toBeTruthy();
    expect(backButton).toBeTruthy();
  });

  it("navigates back when Back button is pressed", () => {
    const mockBack = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ back: mockBack });

    const { backButton } = setup();
    fireEvent.press(backButton);
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("handles input changes", () => {
    const { usernameInput, emailInput, passwordInput } = setup();

    fireEvent.changeText(usernameInput, "testuser");
    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.changeText(passwordInput, "password123");

    expect(usernameInput.props.value).toBe("testuser");
    expect(emailInput.props.value).toBe("test@example.com");
    expect(passwordInput.props.value).toBe("password123");
  });

  it("validates inputs correctly", async () => {
    (checkUsernameExists as jest.Mock).mockResolvedValue(false);
    const { usernameInput, emailInput, passwordInput, signUpButton } = setup();

    fireEvent.changeText(usernameInput, "a");
    fireEvent.changeText(emailInput, "invalid-email");
    fireEvent.changeText(passwordInput, "123");

    await act(async () => fireEvent.press(signUpButton));

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
    const { usernameInput, emailInput, passwordInput, signUpButton } = setup();

    fireEvent.changeText(usernameInput, "abcd");
    fireEvent.changeText(emailInput, "email@gmail.com");
    fireEvent.changeText(passwordInput, "password123");

    await act(async () => fireEvent.press(signUpButton));

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

    const { usernameInput, emailInput, passwordInput, signUpButton } = setup();

    fireEvent.changeText(usernameInput, "abcd");
    fireEvent.changeText(emailInput, "email@gmail.com");
    fireEvent.changeText(passwordInput, "password123");

    await act(async () => fireEvent.press(signUpButton));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Sign-up successful!");
    });
  });

  it("shows an error if sign-up fails", async () => {
    (checkUsernameExists as jest.Mock).mockResolvedValue(false);
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: "Sign-up failed" },
    });

    const { usernameInput, emailInput, passwordInput, signUpButton } = setup();

    fireEvent.changeText(usernameInput, "abcd");
    fireEvent.changeText(emailInput, "email@gmail.com");
    fireEvent.changeText(passwordInput, "password123");

    await act(async () => fireEvent.press(signUpButton));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Sign-up failed");
    });
  });
});
