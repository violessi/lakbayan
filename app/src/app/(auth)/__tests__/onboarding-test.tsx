import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import Onboarding from "../onboarding";
import { router } from "expo-router";
import { Dimensions } from "react-native";

jest.mock("expo-router", () => ({
  router: { replace: jest.fn() },
}));

jest.spyOn(Dimensions, "get").mockReturnValue({
  width: 400,
  height: 800,
  scale: 1,
  fontScale: 1,
});

describe("Onboarding Component", () => {
  it("renders correctly", () => {
    const { getByText } = render(<Onboarding />);
    expect(getByText("Navigating the Unknown?")).toBeTruthy();
    expect(getByText("Find Your Way")).toBeTruthy();
    expect(getByText("Powered by Commuters")).toBeTruthy();
    expect(getByText("Let’s Get Moving!"));
  });

  it("navigates to login when Skip is pressed", () => {
    const { getByText } = render(<Onboarding />);
    fireEvent.press(getByText("Skip"));
    expect(router.replace).toHaveBeenCalledWith("/(auth)/log-in");
  });

  it("goes to the next slide when Next is pressed", async () => {
    const { getByText, getByTestId } = render(<Onboarding />);

    const flatList = getByTestId("onboarding-flatlist");

    fireEvent.press(getByText("Next"));
    await waitFor(() => expect(flatList.props.data[1].title).toBe("Find Your Way"));

    fireEvent.press(getByText("Next"));
    await waitFor(() => expect(flatList.props.data[2].title).toBe("Powered by Commuters"));
  });

  it("goes to the next slide when the screen is swiped", async () => {
    const { getByTestId, getByText } = render(<Onboarding />);

    const flatList = await waitFor(() => getByTestId("onboarding-flatlist"));

    expect(getByText("Navigating the Unknown?")).toBeTruthy();

    // Simulate swipe
    fireEvent.scroll(flatList, {
      nativeEvent: {
        contentOffset: { x: 400, y: 0 },
        layoutMeasurement: { width: 400, height: 800 },
        contentSize: { width: 1600, height: 800 }, // Total width for 4 slides
      },
    });

    await waitFor(() => expect(getByText("Find Your Way")).toBeTruthy());

    // Simulate swipe
    fireEvent.scroll(flatList, {
      nativeEvent: {
        contentOffset: { x: 800, y: 0 },
        layoutMeasurement: { width: 400, height: 800 },
        contentSize: { width: 1600, height: 800 },
      },
    });

    await waitFor(() => expect(getByText("Powered by Commuters")).toBeTruthy());
  });

  it("navigates to login when Get Started is pressed", async () => {
    const { getByText } = render(<Onboarding />);

    fireEvent.press(getByText("Next"));
    fireEvent.press(getByText("Next"));
    fireEvent.press(getByText("Next"));

    // Ensure the "Get Started" button is actually present
    const getStartedButton = await waitFor(() => getByText("Get Started"));
    fireEvent.press(getStartedButton);

    expect(router.replace).toHaveBeenCalledWith("/(auth)/log-in");
  });
});
