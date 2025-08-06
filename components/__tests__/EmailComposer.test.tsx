import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EmailComposer from "../EmailComposer";

// Mock the child components
vi.mock("../RecipientInput", () => ({
  default: ({ recipients, onRecipientsChange, errors }: any) => (
    <div data-testid="recipient-input">
      <input
        data-testid="recipients"
        value={recipients.join(",")}
        onChange={(e) =>
          onRecipientsChange(e.target.value.split(",").filter(Boolean))
        }
      />
      {errors?.length > 0 && (
        <div data-testid="recipient-errors">{errors[0]}</div>
      )}
    </div>
  ),
}));

vi.mock("../EmailEditor", () => ({
  default: ({ content, onChange }: any) => (
    <div data-testid="email-editor">
      <textarea
        data-testid="email-content"
        value={content}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  ),
}));

vi.mock("../LoadingSpinner", () => ({
  default: ({ message }: any) => (
    <div data-testid="loading-spinner">{message}</div>
  ),
}));

// Mock fetch
global.fetch = vi.fn();

describe("EmailComposer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the main components", () => {
    render(<EmailComposer />);

    expect(screen.getByText("AI Email Composer")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Generate personalized emails using AI and send them to multiple recipients"
      )
    ).toBeInTheDocument();
    expect(screen.getByTestId("recipient-input")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Email Generation Prompt")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Generate Email" })
    ).toBeInTheDocument();
  });

  it("updates prompt when user types", () => {
    render(<EmailComposer />);

    const promptInput = screen.getByLabelText("Email Generation Prompt");
    fireEvent.change(promptInput, { target: { value: "Test prompt" } });

    expect(promptInput).toHaveValue("Test prompt");
  });

  it("shows character count for prompt", () => {
    render(<EmailComposer />);

    const promptInput = screen.getByLabelText("Email Generation Prompt");
    fireEvent.change(promptInput, { target: { value: "Test" } });

    expect(screen.getByText("4/2000 characters")).toBeInTheDocument();
  });

  it("disables generate button when prompt is empty", () => {
    render(<EmailComposer />);

    const generateButton = screen.getByRole("button", {
      name: "Generate Email",
    });
    expect(generateButton).toBeDisabled();
  });

  it("enables generate button when prompt is provided", () => {
    render(<EmailComposer />);

    const promptInput = screen.getByLabelText("Email Generation Prompt");
    fireEvent.change(promptInput, { target: { value: "Test prompt" } });

    const generateButton = screen.getByRole("button", {
      name: "Generate Email",
    });
    expect(generateButton).not.toBeDisabled();
  });

  it("prevents generation when prompt is empty or whitespace", () => {
    render(<EmailComposer />);

    const promptInput = screen.getByLabelText("Email Generation Prompt");
    fireEvent.change(promptInput, { target: { value: "   " } }); // Only whitespace

    const generateButton = screen.getByRole("button", {
      name: "Generate Email",
    });

    // Button should be disabled for empty/whitespace prompt
    expect(generateButton).toBeDisabled();
  });

  it("shows validation error for prompt that is too long", async () => {
    render(<EmailComposer />);

    const longPrompt = "a".repeat(2001);
    const promptInput = screen.getByLabelText("Email Generation Prompt");
    fireEvent.change(promptInput, { target: { value: longPrompt } });

    const generateButton = screen.getByRole("button", {
      name: "Generate Email",
    });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(
        screen.getByText("Prompt is too long. Maximum 2000 characters allowed.")
      ).toBeInTheDocument();
    });
  });

  it("calls API and shows loading state when generating email", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        success: true,
        email: "Subject: Test Subject\n\nTest email content",
      }),
    } as Response);

    render(<EmailComposer />);

    const promptInput = screen.getByLabelText("Email Generation Prompt");
    fireEvent.change(promptInput, { target: { value: "Test prompt" } });

    const generateButton = screen.getByRole("button", {
      name: "Generate Email",
    });
    fireEvent.click(generateButton);

    // Check loading state
    expect(screen.getByText("Generating Email...")).toBeInTheDocument();
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/generate-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: "Test prompt",
        }),
      });
    });
  });

  it("displays generated email content after successful generation", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        success: true,
        email: "Subject: Test Subject\n\nTest email content",
      }),
    } as Response);

    render(<EmailComposer />);

    const promptInput = screen.getByLabelText("Email Generation Prompt");
    fireEvent.change(promptInput, { target: { value: "Test prompt" } });

    const generateButton = screen.getByRole("button", {
      name: "Generate Email",
    });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText("Test Subject")).toBeInTheDocument();
      expect(screen.getByTestId("email-editor")).toBeInTheDocument();
    });
  });

  it("shows error message when API call fails", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ success: false, error: "API error occurred" }),
    } as Response);

    render(<EmailComposer />);

    const promptInput = screen.getByLabelText("Email Generation Prompt");
    fireEvent.change(promptInput, { target: { value: "Test prompt" } });

    const generateButton = screen.getByRole("button", {
      name: "Generate Email",
    });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText("API error occurred")).toBeInTheDocument();
    });
  });

  it("shows network error when fetch fails", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<EmailComposer />);

    const promptInput = screen.getByLabelText("Email Generation Prompt");
    fireEvent.change(promptInput, { target: { value: "Test prompt" } });

    const generateButton = screen.getByRole("button", {
      name: "Generate Email",
    });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          "Network error occurred. Please check your connection and try again."
        )
      ).toBeInTheDocument();
    });
  });

  it("handles email content without subject line", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        success: true,
        email: "Just email content without subject",
      }),
    } as Response);

    render(<EmailComposer />);

    const promptInput = screen.getByLabelText("Email Generation Prompt");
    fireEvent.change(promptInput, { target: { value: "Test prompt" } });

    const generateButton = screen.getByRole("button", {
      name: "Generate Email",
    });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByTestId("email-editor")).toBeInTheDocument();
      // Should not show subject section
      expect(screen.queryByText("Email Subject")).not.toBeInTheDocument();
    });
  });
});
