import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useLocation } from "react-router-dom";
import { SuccessPage } from "./SuccessPage";
import { useGlobalContext } from "../context/GlobalContext";
import { adobeConfigYourMortgages } from "../app/analytics/config/adobeConfigYourMortgages";
import { createCloseEvent } from "../utils/utility";

// Mock necessary modules
jest.mock("react-router-dom", () => ({
  useLocation: jest.fn(),
}));
jest.mock("../context/GlobalContext", () => ({
  useGlobalContext: jest.fn(),
}));
jest.mock("../utils/utility");

describe("SuccessPage Component", () => {
  const mockApi = {
    routeTracker: { route: "" },
    tagger: { tag: jest.fn() },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useLocation as jest.Mock).mockReturnValue({
      state: { message: "Your cancellation has been processed." },
    });
    (useGlobalContext as jest.Mock).mockReturnValue([
      {
        api: mockApi,
      },
    ]);
  });

  test("renders the SuccessPage component with the correct content", () => {
    render(<SuccessPage />);

    // Check that the success message is rendered
    expect(
      screen.getByText("We’ll send a letter to confirm your cancellation")
    ).toBeInTheDocument();

    // Check that the warning alert message from state is rendered
    expect(
      screen.getByText("Your cancellation has been processed.")
    ).toBeInTheDocument();

    // Check that the success icon is rendered (you may need to customize this selector based on the Icon component's implementation)
    const successIcon = screen.getByRole("img", { name: /success/i });
    expect(successIcon).toBeInTheDocument();
  });

  test("handles the 'Finish' button click", () => {
    render(<SuccessPage />);

    const finishButton = screen.getByText("Finish");
    fireEvent.click(finishButton);

    // Tagging should be triggered
    expect(mockApi.tagger.tag).toHaveBeenCalledWith(
      adobeConfigYourMortgages.pageNames.finish
    );

    // createCloseEvent should be called
    expect(createCloseEvent).toHaveBeenCalledWith(mockApi);
  });

  test("sets the route to 'complete' on mount", () => {
    render(<SuccessPage />);

    // Route tracker should be set to 'complete'
    expect(mockApi.routeTracker.route).toBe("complete");
  });
});
