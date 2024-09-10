import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AccountSummary from "./AccountSummary";
import { useGlobalContext } from "../context/GlobalContext";
import { fetchFromEPS } from "../utils/utility";
import { EPS_END_POINTS } from "../constants/constant";

// Mock the necessary modules
jest.mock("../context/GlobalContext");
jest.mock("../utils/utility");

describe("AccountSummary Component", () => {
  const mockApi = {
    routeTracker: { route: "" },
    tagger: { tag: jest.fn() },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useGlobalContext.mockReturnValue([{ api: mockApi }]);
  });

  test("renders the AccountSummary component", async () => {
    const mockAccountDetails = {
      data: {
        directDebitSortCode: "12 34 56",
        directDebitAccountNumber: "12345678",
        totalLoanBalance: "£100,000",
        product: "Fixed Rate Mortgage",
        newInterestRate: "2.5%",
        newStartDate: "2024-10-01",
      },
    };
    fetchFromEPS.mockResolvedValue({ res: mockAccountDetails });

    render(<AccountSummary />);

    // Check that the navbar renders
    expect(screen.getByText("Account summary")).toBeInTheDocument();

    // Check that the Cancel your rate switch section renders
    expect(screen.getByText("Cancel your rate switch")).toBeInTheDocument();

    // Wait for the fetch call and check if account details are rendered
    await waitFor(() => {
      expect(screen.getByText("Primary account")).toBeInTheDocument();
      expect(screen.getByText("12 34 56")).toBeInTheDocument();
      expect(screen.getByText("12345678")).toBeInTheDocument();
      expect(screen.getByText("£100,000")).toBeInTheDocument();
      expect(screen.getByText("Fixed Rate Mortgage")).toBeInTheDocument();
      expect(screen.getByText("2.5%")).toBeInTheDocument();
      expect(screen.getByText("2024-10-01")).toBeInTheDocument();
    });
  });

  test("opens and closes the confirmation modal on button click", async () => {
    const mockAccountDetails = {
      data: {
        directDebitSortCode: "12 34 56",
        directDebitAccountNumber: "12345678",
        totalLoanBalance: "£100,000",
        product: "Fixed Rate Mortgage",
        newInterestRate: "2.5%",
        newStartDate: "2024-10-01",
      },
    };
    fetchFromEPS.mockResolvedValue({ res: mockAccountDetails });

    render(<AccountSummary />);

    // Wait for the fetch call
    await waitFor(() => {
      expect(screen.getByText("Cancel your rate switch")).toBeInTheDocument();
    });

    // Simulate opening the modal
    const cancelRateButton = screen.getByText("Cancel your rate switch");
    fireEvent.click(cancelRateButton);

    // Modal should be open
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Simulate closing the modal
    const closeButton = screen.getByText("Close");
    fireEvent.click(closeButton);

    // Modal should be closed
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  test("goes back when 'Go back' button is clicked", () => {
    render(<AccountSummary />);

    const goBackButton = screen.getByText("Go back");
    fireEvent.click(goBackButton);

    expect(mockApi.tagger.tag).toHaveBeenCalledWith("pageName_goBack");
    expect(mockApi.routeTracker.route).toBe("previousRoute"); // adjust according to the implementation
  });
});
