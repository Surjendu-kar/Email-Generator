import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import LoadingSpinner from "../LoadingSpinner";

describe("LoadingSpinner", () => {
  it("renders the loading spinner", () => {
    const { container } = render(<LoadingSpinner />);

    // Check if the spinner element is present by class
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("displays custom message when provided", () => {
    const testMessage = "Generating email...";
    render(<LoadingSpinner message={testMessage} />);

    // Check if the message is displayed
    expect(screen.getByText(testMessage)).toBeInTheDocument();
  });

  it("does not display message when not provided", () => {
    const { container } = render(<LoadingSpinner />);

    // Check that no text content is rendered when no message is provided
    expect(container.querySelector("p")).not.toBeInTheDocument();
  });

  it("applies correct CSS classes for animations", () => {
    render(<LoadingSpinner message="Loading..." />);

    // Check spinner animation classes
    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass(
      "rounded-full",
      "h-8",
      "w-8",
      "border-b-2",
      "border-blue-600"
    );

    // Check message animation classes
    const message = screen.getByText("Loading...");
    expect(message).toHaveClass(
      "animate-pulse",
      "text-sm",
      "text-gray-600",
      "text-center"
    );
  });
});
