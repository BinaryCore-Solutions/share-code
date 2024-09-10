import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "./ConfirmationModal";
import { fetchFromEPS } from "../utils/utility";
import { adobeConfigYourMortgages } from "../app/analytics/config/adobeConfigYourMortgages";
import { EPS_END_POINTS } from "../constants/constant";

// Mock the necessary modules
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));
jest.mock("../utils/utility");

describe("ConfirmationModal Component", () => {
  const mockApi = {
    tagger: { tag: jest.fn() },
  };
  const mockNavigate = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  test("renders the ConfirmationModal component", () => {
    const mockModalRef = { current: { open: jest.fn(), close: jest.fn() } };
    render(
      <ConfirmationModal
        modalRef={mockModalRef}
        api={mockApi}
        onClose={mockOnClose}
      />
    );

    // Check that the modal content is rendered
    expect(
      screen.getByText("Are you sure you want to cancel your rate switch?")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "You won’t be able to apply for a new rate until your cancellation is completed. This could take up to three working days."
      )
    ).toBeInTheDocument();
  });

  test("handles the 'Yes, cancel rate switch' button click", async () => {
    const mockModalRef = { current: { open: jest.fn(), close: jest.fn() } };
    const mockLoaderRef = { current: { open: jest.fn(), close: jest.fn() } };
    const mockResponse = { status: "success" };
    fetchFromEPS.mockResolvedValue({ res: mockResponse });

    render(
      <ConfirmationModal
        modalRef={mockModalRef}
        api={mockApi}
        onClose={mockOnClose}
      />
    );

    const yesCancelButton = screen.getByText("Yes, cancel rate switch");
    fireEvent.click(yesCancelButton);

    // Loader should open
    await waitFor(() => {
      expect(mockModalRef.current.open).toHaveBeenCalled();
    });

    // Mock API call
    await waitFor(() => {
      expect(fetchFromEPS).toHaveBeenCalledWith(
        EPS_END_POINTS.YES_CANCEL_RATE,
        mockApi
      );
    });

    // Loader should close after API call
    await waitFor(() => {
      expect(mockModalRef.current.close).toHaveBeenCalled();
    });

    // Navigate to success page
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/successPage", {
        state: mockResponse,
      });
    });

    // Tagging should be triggered
    expect(mockApi.tagger.tag).toHaveBeenCalledWith(
      adobeConfigYourMortgages.pageNames.yesCancelRateSwitch
    );
  });

  test("handles the 'Go back' button click", () => {
    const mockModalRef = { current: { open: jest.fn(), close: jest.fn() } };

    render(
      <ConfirmationModal
        modalRef={mockModalRef}
        api={mockApi}
        onClose={mockOnClose}
      />
    );

    const goBackButton = screen.getByText("Go back");
    fireEvent.click(goBackButton);

    // Modal should close
    expect(mockOnClose).toHaveBeenCalled();

    // Tagging should be triggered
    expect(mockApi.tagger.tag).toHaveBeenCalledWith(
      adobeConfigYourMortgages.pageNames.goBack
    );
  });

  test("handles failure response from the API call", async () => {
    const mockModalRef = { current: { open: jest.fn(), close: jest.fn() } };
    const mockLoaderRef = { current: { open: jest.fn(), close: jest.fn() } };
    const mockResponse = { status: "error" };
    fetchFromEPS.mockResolvedValue({ res: mockResponse });

    render(
      <ConfirmationModal
        modalRef={mockModalRef}
        api={mockApi}
        onClose={mockOnClose}
      />
    );

    const yesCancelButton = screen.getByText("Yes, cancel rate switch");
    fireEvent.click(yesCancelButton);

    // Loader should open
    await waitFor(() => {
      expect(mockModalRef.current.open).toHaveBeenCalled();
    });

    // Mock API call
    await waitFor(() => {
      expect(fetchFromEPS).toHaveBeenCalledWith(
        EPS_END_POINTS.YES_CANCEL_RATE,
        mockApi
      );
    });

    // Loader should close after API call
    await waitFor(() => {
      expect(mockModalRef.current.close).toHaveBeenCalled();
    });

    // Navigate to error page
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/errorPage", {
        state: mockResponse,
      });
    });

    // Tagging should be triggered
    expect(mockApi.tagger.tag).toHaveBeenCalledWith(
      adobeConfigYourMortgages.pageNames.navigate,
      { pageName: "Summary", navUrl: "Error" }
    );
  });
});
