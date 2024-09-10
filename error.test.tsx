import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useLocation, useNavigate } from "react-router-dom";
import { ErrorPage } from "./ErrorPage";
import { useGlobalContext } from "../context/GlobalContext";
import { adobeConfigYourMortgages } from "../app/analytics/config/adobeConfigYourMortgages";
import { fetchFromEPS } from "../utils/utility";
import { EPS_END_POINTS } from "../constants/constant";

// Mock necessary modules
jest.mock("react-router-dom", () => ({
  useLocation: jest.fn(),
  useNavigate: jest.fn(),
}));
jest.mock("../context/GlobalContext", () => ({
  useGlobalContext: jest.fn(),
}));
jest.mock("../utils/utility");

describe("ErrorPage Component", () => {
  const mockNavigate = jest.fn();
  const mockApi = {
    routeTracker: { route: "" },
    tagger: { tag: jest.fn() },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useLocation as jest.Mock).mockReturnValue({
      state: { message: "An error occurred during processing." },
    });
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useGlobalContext as jest.Mock).mockReturnValue([
      {
        api: mockApi,
      },
    ]);
  });

  test("renders the ErrorPage component with the correct content", () => {
    render(<ErrorPage />);

    // Check that the error message is rendered
    expect(screen.getByText("Sorry, something went wrong")).toBeInTheDocument();
    expect(
      screen.getByText("An error occurred during processing.")
    ).toBeInTheDocument();

    // Check that the error icon is rendered (you may need to customize this selector based on the Icon component's implementation)
    const errorIcon = screen.getByRole("img", { name: /error/i });
    expect(errorIcon).toBeInTheDocument();
  });

  test("handles the 'Try again' button click", async () => {
    (fetchFromEPS as jest.Mock).mockResolvedValue({ status: "success" });

    render(<ErrorPage />);

    const tryAgainButton = screen.getByText("Try again");
    fireEvent.click(tryAgainButton);

    // Check that the API call is made
    expect(fetchFromEPS).toHaveBeenCalledWith(
      EPS_END_POINTS.YES_CANCEL_RATE,
      mockApi
    );

    // Tagging should be triggered
    expect(mockApi.tagger.tag).toHaveBeenCalledWith(
      adobeConfigYourMortgages.pageNames.tryAgain
    );

    // If success, navigation should occur
    expect(mockNavigate).toHaveBeenCalledWith("/successPage", {
      state: { status: "success" },
    });
  });

  test("handles the 'Go back' button click", () => {
    render(<ErrorPage />);

    const goBackButton = screen.getByText("Go back");
    fireEvent.click(goBackButton);

    // Tagging should be triggered
    expect(mockApi.tagger.tag).toHaveBeenCalledWith(
      adobeConfigYourMortgages.pageNames.goBack
    );

    // Navigation should go back one step in history
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test("sets the route to 'error' on mount", () => {
    render(<ErrorPage />);

    // Route tracker should be set to 'error'
    expect(mockApi.routeTracker.route).toBe("error");
  });
});
