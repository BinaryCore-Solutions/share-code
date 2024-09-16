import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import { ConfirmationModal } from "./modal";
import { fetchFromEPS } from "../utils/utility";
import { adobeConfigYourMortgages } from "../app/analytics/config/adobeConfigYourMortgages";
import { EPS_END_POINTS } from "../constants/constant";

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
  const mockModalRef = { current: { open: jest.fn(), close: jest.fn() } };

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  test("renders the ConfirmationModal component", () => {
    render(
      <ConfirmationModal
        modalRef={mockModalRef}
        api={mockApi}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText("Are you sure you want to cancel your rate switch?")).toBeInTheDocument();
    expect(screen.getByText("You won't be able to apply for a new rate until your cancellation is completed. This could take up to three working days.")).toBeInTheDocument();
    expect(screen.getByText("Yes, cancel rate switch")).toBeInTheDocument();
    expect(screen.getByText("Go back")).toBeInTheDocument();
  });

  test("handles the 'Yes, cancel rate switch' button click", async () => {
    fetchFromEPS.mockResolvedValueOnce({ isError: false });

    render(
      <ConfirmationModal
        modalRef={mockModalRef}
        api={mockApi}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByText("Yes, cancel rate switch"));

    await waitFor(() => {
      expect(fetchFromEPS).toHaveBeenCalledWith(EPS_END_POINTS.AUDIT_EVENTS, mockApi, {
        data: { attributes: [{ auditEventId: "823856" }] },
      });
      expect(fetchFromEPS).toHaveBeenCalledWith(EPS_END_POINTS.SEND_ALERT, mockApi);
      expect(mockNavigate).toHaveBeenCalledWith("/successPage");
      expect(mockApi.tagger.tag).toHaveBeenCalledWith(adobeConfigYourMortgages.pageNames.yesCancelRateSwitch);
      expect(mockApi.tagger.tag).toHaveBeenCalledWith(adobeConfigYourMortgages.pageNames.navigate, {
        pageName: "Summary",
        navUrl: "Complete",
      });
    });
  });

  test("handles API error when cancelling rate switch", async () => {
    fetchFromEPS.mockResolvedValueOnce({ isError: false }); // For audit call
    fetchFromEPS.mockResolvedValueOnce({ isError: true }); // For send alert call

    render(
      <ConfirmationModal
        modalRef={mockModalRef}
        api={mockApi}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByText("Yes, cancel rate switch"));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/errorPage", { state: { tryAgain: "confirmation" } });
      expect(mockApi.tagger.tag).toHaveBeenCalledWith(adobeConfigYourMortgages.pageNames.navigate, {
        pageName: "Summary",
        navUrl: "Error",
      });
    });
  });

  test("handles exception when cancelling rate switch", async () => {
    fetchFromEPS.mockRejectedValueOnce(new Error("API error"));

    render(
      <ConfirmationModal
        modalRef={mockModalRef}
        api={mockApi}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByText("Yes, cancel rate switch"));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/errorPage", { state: { tryAgain: "confirmation" } });
      expect(mockApi.tagger.tag).toHaveBeenCalledWith(adobeConfigYourMortgages.pageNames.navigate, {
        pageName: "Summary",
        navUrl: "Error",
      });
    });
  });

  test("handles the 'Go back' button click", () => {
    render(
      <ConfirmationModal
        modalRef={mockModalRef}
        api={mockApi}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByText("Go back"));

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockApi.tagger.tag).toHaveBeenCalledWith(adobeConfigYourMortgages.pageNames.goBack);
  });
});
