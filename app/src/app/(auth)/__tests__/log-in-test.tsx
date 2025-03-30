import { fireEvent, render, waitFor, act } from "@testing-library/react-native";
import LogIn from "../log-in";
import { useRouter } from "expo-router";
import { supabase } from "@utils/supabase";
import { Alert } from "react-native";

jest.useFakeTimers();
jest.spyOn(Alert, "alert").mockImplementation(() => {});

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@utils/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
    },
  },
}));

describe("LogIn Component", () => {
  let mockRouter: { push: jest.Mock };
  let signInWithPassword: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter = { push: jest.fn() };
    signInWithPassword = supabase.auth.signInWithPassword as jest.Mock;

    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it("renders correctly", () => {
    const { getByTestId, getByText } = render(<LogIn />);

    expect(getByTestId("email-input")).toBeTruthy();
    expect(getByTestId("password-input")).toBeTruthy();
    expect(getByText("Log in")).toBeTruthy();
    expect(getByText("Sign up here.")).toBeTruthy();
  });

  it("shows an alert when inputs are invalid", async () => {
    const { getByTestId, getByText } = render(<LogIn />);

    await act(async () => {
      fireEvent.changeText(getByTestId("email-input"), "invalid-email");
      fireEvent.changeText(getByTestId("password-input"), "123");
      fireEvent.press(getByText("Log in"));
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Invalid input!",
        expect.stringContaining("Invalid email"),
      );
    });
  });

  it("signs in successfully", async () => {
    signInWithPassword.mockResolvedValue({ error: null });

    const { getByTestId, getByText } = render(<LogIn />);

    fireEvent.changeText(getByTestId("email-input"), "test@example.com");
    fireEvent.changeText(getByTestId("password-input"), "validpassword");

    await act(async () => {
      fireEvent.press(getByText("Log in"));
    });

    await waitFor(() => {
      expect(Alert.alert).not.toHaveBeenCalled();
    });
  });

  it("shows an alert when login fails", async () => {
    signInWithPassword.mockResolvedValue({
      error: { message: "Invalid login credentials" },
    });

    const { getByTestId, getByText } = render(<LogIn />);

    fireEvent.changeText(getByTestId("email-input"), "test@example.com");
    fireEvent.changeText(getByTestId("password-input"), "wrongpassword");

    await act(async () => {
      fireEvent.press(getByText("Log in"));
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Login Failed", "Invalid login credentials");
    });
  });

  it("navigates to sign-up page when sign-up link is clicked", () => {
    const { getByText } = render(<LogIn />);
    fireEvent.press(getByText("Sign up here."));
    expect(mockRouter.push).toHaveBeenCalledWith("/(auth)/sign-up");
  });
});
