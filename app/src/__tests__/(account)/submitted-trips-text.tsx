import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import { useRouter } from "expo-router";

import SubmittedTrips from "@app/(account)/submitted-trips";
import { useSubmittedTrips } from "@hooks/use-submitted-trips";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@contexts/SessionContext", () => ({
  useSession: () => ({
    user: {
      id: "mock-user-id",
    },
  }),
}));

jest.mock("@hooks/use-submitted-trips");

describe("SubmittedTrips Screen", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it("renders correctly", () => {
    (useSubmittedTrips as jest.Mock).mockReturnValue({
      submittedTrips: [],
      loading: true,
    });
    const { getByText } = render(<SubmittedTrips />);
    expect(getByText("Submitted Trips")).toBeTruthy();
  });

  it("renders a loading state", async () => {
    (useSubmittedTrips as jest.Mock).mockReturnValue({
      submittedTrips: [],
      loading: true,
    });

    const { getByTestId } = render(<SubmittedTrips />);
    await waitFor(() => {
      expect(getByTestId("activity-indicator")).toBeTruthy();
    });
  });

  it("renders empty state when no submitted trips", async () => {
    (useSubmittedTrips as jest.Mock).mockReturnValue({
      submittedTrips: [],
      loading: false,
    });

    const { getByText } = render(<SubmittedTrips />);
    await waitFor(() => {
      expect(getByText("No submitted trips")).toBeTruthy();
    });
  });

  it("renders submitted trips when available", async () => {
    (useSubmittedTrips as jest.Mock).mockReturnValue({
      loading: false,
      submittedTrips: [
        {
          id: "trip-1",
          startLocation: "UP",
          endLocation: "SM",
          segments: [],
        },
      ],
    });

    const { getByText } = render(<SubmittedTrips />);
    await waitFor(() => {
      expect(getByText("UP to SM")).toBeTruthy();
    });
  });
});
