import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import Contribute from "@app/(tabs)/contribute";

describe("Contribute Screen", () => {
  it("renders the header correctly", async () => {
    const { getByText } = render(<Contribute />);
    await waitFor(() => {
      expect(getByText("Contribute a route")).toBeTruthy();
    });
  });

  it("renders two options with the correct titles and descriptions", async () => {
    const { getByText } = render(<Contribute />);
    await waitFor(() => {
      // Check the first option
      expect(getByText("Add custom trip")).toBeTruthy();
      expect(
        getByText("Help users discover ways to get from starting point to their destination!"),
      ).toBeTruthy();

      // Check the second option
      expect(getByText("Pin tricycle TODA stops")).toBeTruthy();
      expect(getByText("Let others know where tricycles are stationed!")).toBeTruthy();
    });
  });
});
