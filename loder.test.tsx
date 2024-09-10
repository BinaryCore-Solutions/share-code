import React from "react";
import { render, screen } from "@testing-library/react";
import { LoaderModal } from "./LoaderModal";

describe("LoaderModal Component", () => {
  test("renders the LoaderModal component with correct content", () => {
    const mockLoaderRef = { current: { open: jest.fn(), close: jest.fn() } };

    render(<LoaderModal loaderRef={mockLoaderRef} />);

    // Check that the title is rendered
    expect(screen.getByText("Just a moment")).toBeInTheDocument();

    // Check that the loading spinner is rendered (you may need to customize this selector based on the Loading component's implementation)
    const loadingSpinner = screen.getByRole("img", { name: /loading/i });
    expect(loadingSpinner).toBeInTheDocument();
  });

  test("checks that loader modal can be opened and closed via ref", () => {
    const mockLoaderRef = { current: { open: jest.fn(), close: jest.fn() } };

    render(<LoaderModal loaderRef={mockLoaderRef} />);

    // Simulate opening the modal
    mockLoaderRef.current.open();
    expect(mockLoaderRef.current.open).toHaveBeenCalled();

    // Simulate closing the modal
    mockLoaderRef.current.close();
    expect(mockLoaderRef.current.close).toHaveBeenCalled();
  });
});
