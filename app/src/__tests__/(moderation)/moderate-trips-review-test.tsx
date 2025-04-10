import React from "react";
import { Alert } from "react-native";
import { render, fireEvent, waitFor } from "@testing-library/react-native";

import ModerateTripReview from "@app/(moderation)/moderate-trip-review";
import { updateModerationStatus } from "@services/moderation-service";

jest.mock("@contexts/SessionContext");
jest.mock("@services/socials-service");

jest.mock("@services/moderation-service", () => ({
  updateModerationStatus: jest.fn(() => Promise.resolve()),
}));

jest.mock("@components/VotingBar", () => () => null);

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({
    tripData: JSON.stringify({
      id: "trip-1",
      contributorId: "user-456",
      startLocation: "Start City",
      endLocation: "End City",
      startCoords: [0, 0],
      endCoords: [1, 1],
      upvotes: 5,
      downvotes: 2,
      segments: [
        {
          id: "seg-1",
          startLocation: "Loc A",
          endLocation: "Loc B",
          startCoords: [0, 0],
          endCoords: [0.5, 0.5],
          duration: 120,
          waypoints: [
            [0, 0],
            [0.5, 0.5],
          ],
          cost: 100,
        },
      ],
    }),
  }),
}));

jest.mock("@rnmapbox/maps", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    __esModule: true,
    default: { setAccessToken: jest.fn() },
    MapView: "MapView",
    // eslint-disable-next-line react/display-name
    Camera: React.forwardRef(() => null),
    ShapeSource: View,
    CircleLayer: View,
    SymbolLayer: View,
    LineLayer: View,
  };
});

jest.mock("@gorhom/bottom-sheet", () => {
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: View,
    BottomSheetView: View,
  };
});

describe("ModerateTripReview", () => {
  it("renders Trip Overview and action buttons", async () => {
    const { findByText } = render(<ModerateTripReview />);

    expect(await findByText("Trip Overview")).toBeTruthy();
    expect(await findByText("Dismiss")).toBeTruthy();
    expect(await findByText("Verify")).toBeTruthy();
  });

  it("displays the trip contributor's username", async () => {
    const { findByText } = render(<ModerateTripReview />);
    expect(await findByText("Contributed by")).toBeTruthy();
    expect(await findByText("mockuser")).toBeTruthy();
  });

  it("renders trip segment start and end locations", async () => {
    const { findByText } = render(<ModerateTripReview />);
    expect(await findByText("Loc A")).toBeTruthy();
    expect(await findByText("Loc B")).toBeTruthy();
  });

  it("triggers the correct actions when the Dismiss and Verify buttons are clicked", async () => {
    const alertMock = jest.spyOn(Alert, "alert").mockImplementation((title, message, buttons) => {
      buttons?.[1]?.onPress && buttons[1].onPress();
    });

    const { findByText } = render(<ModerateTripReview />);

    const dismissButton = await findByText("Dismiss");
    const verifyButton = await findByText("Verify");

    fireEvent.press(dismissButton);
    await waitFor(() => {
      expect(updateModerationStatus).toHaveBeenCalledWith(
        "3aa3a6d1-aef3-44c1-a02b-dc5db06f184a",
        "trip-1",
        "dismissed",
      );
    });

    fireEvent.press(verifyButton);
    await waitFor(() => {
      expect(updateModerationStatus).toHaveBeenCalledWith(
        "3aa3a6d1-aef3-44c1-a02b-dc5db06f184a",
        "trip-1",
        "verified",
      );
    });

    alertMock.mockRestore();
  });

  it("displays the trip summary information correctly", async () => {
    const { findByText } = render(<ModerateTripReview />);

    expect(await findByText("Contributed by")).toBeTruthy();
    expect(await findByText("mockuser")).toBeTruthy();

    expect(await findByText("Get On")).toBeTruthy();
    expect(await findByText("Get Off")).toBeTruthy();

    expect(await findByText("Loc A")).toBeTruthy();
    expect(await findByText("Loc B")).toBeTruthy();

    expect(await findByText("₱100.00")).toBeTruthy();

    expect(await findByText("2 min")).toBeTruthy();
  });

  it("renders the map correctly", async () => {
    const { findByTestId } = render(<ModerateTripReview />);

    const mapView = await findByTestId("map-view"); // Assuming you've added a testID to the MapView component
    expect(mapView).toBeTruthy();
  });

  it("renders start and end markers on the map", async () => {
    const { findByTestId } = render(<ModerateTripReview />);

    const startMarker = await findByTestId("start-marker");
    const endMarker = await findByTestId("end-marker");

    expect(startMarker).toBeTruthy();
    expect(endMarker).toBeTruthy();
  });

  it("renders lines on the map", async () => {
    const { findByTestId } = render(<ModerateTripReview />);

    const lineLayer = await findByTestId("directions-line-source");

    expect(lineLayer).toBeTruthy();
  });
});
