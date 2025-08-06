import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import EmailComposer from "../EmailComposer";

// Mock the fetch function
global.fetch = vi.fn();

describe("EmailComposer Form Reset", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show clear form button when form has content", () => {
    render(<EmailComposer />);

    // Add some content to the form
    const promptInput = screen.getByLabelText("Email Generation Prompt");
    fireEvent.change(promptInput, { target: { value: "Test prompt" } });

    // Clear form button should appear
    expect(screen.getByTitle("Clear form")).toBeInTheDocument();
  });

  it("should not show clear form button when form is empty", () => {
    render(<EmailComposer />);

    // Clear form button should not appear when form is empty
    expect(screen.queryByTitle("Clear form")).not.toBeInTheDocument();
  });

  it("should show confirmation dialog when clicking clear form with content", () => {
    render(<EmailComposer />);

    // Add some content to the form
    const promptInput = screen.getByLabelText("Email Generation Prompt");
    fireEvent.change(promptInput, { target: { value: "Test prompt" } });

    // Click clear form button
    const clearButton = screen.getByTitle("Clear form");
    fireEvent.click(clearButton);

    // Confirmation dialog should appear
    expect(screen.getByText("Confirm Form Reset")).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to clear the form/)
    ).toBeInTheDocument();
  });

  it("should cancel reset when clicking cancel", () => {
    render(<EmailComposer />);

    // Add some content to the form
    const promptInput = screen.getByLabelText("Email Generation Prompt");
    fireEvent.change(promptInput, { target: { value: "Test prompt" } });

    // Click clear form button
    const clearButton = screen.getByTitle("Clear form");
    fireEvent.click(clearButton);

    // Click cancel in dialog
    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    // Form should still have content
    expect(promptInput).toHaveValue("Test prompt");

    // Dialog should disappear
    expect(screen.queryByText("Confirm Form Reset")).not.toBeInTheDocument();
  });
});
