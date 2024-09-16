import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AccountSummary from "./AccountSummary";
import { useGlobalContext } from "../context/GlobalContext";
import { fetchFromEPS, exitApplication } from "../utils/utility";
import { EPS_END_POINTS } from "../constants/constant";

// Mock the necessary modules
jest.mock("../context/GlobalContext");
jest.mock("../utils/utility");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

describe("AccountSummary Component", () => {
  const mockApi = {
    routeTracker: { route: "" },
    tagger: { tag: jest.fn() },
    webRoots: { app: "http://example.com" },
  };

  const mockAccountDetails = {
    data: {
      accountDetails: [
        {
          directDebitSortCode: "123456",
          directDebitAccountNumber: "12345678",
          totalLoanBalance: 100000,
          product: "Fixed Rate Mortgage",
          newInterestRate: 2.5,
          newStartDate: "2024-10-01",
        },
      ],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useGlobalContext.mockReturnValue([{ api: mockApi }]);
    fetchFromEPS.mockResolvedValue({ res: mockAccountDetails });
  });

  test("renders the AccountSummary component and fetches account details", async () => {
    render(
      <MemoryRouter>
        <AccountSummary />
      </MemoryRouter>
    );

    expect(screen.getByText("Account summary")).toBeInTheDocument();
    expect(screen.getByText("Cancel your rate switch")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Primary account")).toBeInTheDocument();
      expect(screen.getByText("12-34-56")).toBeInTheDocument();
      expect(screen.getByText("12345678")).toBeInTheDocument();
      expect(screen.getByText("£100,000.00")).toBeInTheDocument();
      expect(screen.getByText("Fixed Rate Mortgage")).toBeInTheDocument();
      expect(screen.getByText("2.5 %")).toBeInTheDocument();
      expect(screen.getByText("2024-10-01")).toBeInTheDocument();
    });

    expect(fetchFromEPS).toHaveBeenCalledWith(
      EPS_END_POINTS.GET_ACCOUNT_DETAILS,
      mockApi
    );
    expect(mockApi.routeTracker.route).toBe("summary");
  });

  test("opens and closes the confirmation modal", async () => {
    render(
      <MemoryRouter>
        <AccountSummary />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Cancel your rate switch")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Cancel your rate switch"));
    expect(mockApi.tagger.tag).toHaveBeenCalledWith(
      "pageName_cancelYourRateSwitch"
    );

    await waitFor(() => {
      expect(
        screen.getByText("Are you sure you want to cancel your rate switch?")
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Go back"));
    await waitFor(() => {
      expect(
        screen.queryByText("Are you sure you want to cancel your rate switch?")
      ).not.toBeInTheDocument();
    });
  });

  test("handles 'Go back' button click", () => {
    render(
      <MemoryRouter>
        <AccountSummary />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Go back"));
    expect(mockApi.tagger.tag).toHaveBeenCalledWith("pageName_goBack");
    expect(exitApplication).toHaveBeenCalled();
  });

  test("handles navigation back arrow click", () => {
    render(
      <MemoryRouter>
        <AccountSummary />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByLabelText("Back"));
    expect(mockApi.tagger.tag).toHaveBeenCalledWith("pageName_goBack");
  });

  test("displays loader while fetching account details", async () => {
    render(
      <MemoryRouter>
        <AccountSummary />
      </MemoryRouter>
    );

    expect(screen.getByText("Just a moment")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText("Just a moment")).not.toBeInTheDocument();
    });
  });

  test("navigates to error page on fetch failure", async () => {
    fetchFromEPS.mockRejectedValueOnce(new Error("Fetch failed"));
    const mockNavigate = jest.fn();
    jest
      .spyOn(require("react-router-dom"), "useNavigate")
      .mockReturnValue(mockNavigate);

    render(
      <MemoryRouter>
        <AccountSummary />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/errorPage", {
        state: { tryAgain: "accountSummary" },
      });
    });
  });
});
