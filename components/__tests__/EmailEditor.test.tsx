import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import EmailEditor from "../EmailEditor";

describe("EmailEditor", () => {
  it("renders with default placeholder", () => {
    const mockOnChange = vi.fn();
    render(<EmailEditor content="" onChange={mockOnChange} />);

    const textarea = screen.getByRole("textbox", { name: /email content/i });
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute(
      "placeholder",
      "Your AI-generated email will appear here. You can edit it before sending."
    );
  });

  it("renders with custom placeholder", () => {
    const mockOnChange = vi.fn();
    const customPlaceholder = "Custom placeholder text";

    render(
      <EmailEditor
        content=""
        onChange={mockOnChange}
        placeholder={customPlaceholder}
      />
    );

    const textarea = screen.getByRole("textbox", { name: /email content/i });
    expect(textarea).toHaveAttribute("placeholder", customPlaceholder);
  });

  it("displays provided content", () => {
    const mockOnChange = vi.fn();
    const testContent = "This is test email content";

    render(<EmailEditor content={testContent} onChange={mockOnChange} />);

    const textarea = screen.getByRole("textbox", { name: /email content/i });
    expect(textarea).toHaveValue(testContent);
  });

  it("calls onChange when content is modified", async () => {
    const mockOnChange = vi.fn();
    render(<EmailEditor content="" onChange={mockOnChange} />);

    const textarea = screen.getByRole("textbox", { name: /email content/i });
    const newContent = "New email content";

    fireEvent.change(textarea, { target: { value: newContent } });

    expect(mockOnChange).toHaveBeenCalledWith(newContent);
  });

  it("shows character count", () => {
    const mockOnChange = vi.fn();
    const testContent = "Hello world";

    render(<EmailEditor content={testContent} onChange={mockOnChange} />);

    expect(
      screen.getByText(`${testContent.length} characters`)
    ).toBeInTheDocument();
  });

  it("shows content ready indicator when content exists", () => {
    const mockOnChange = vi.fn();
    const testContent = "Some email content";

    render(<EmailEditor content={testContent} onChange={mockOnChange} />);

    expect(
      screen.getByText("Email content ready for sending")
    ).toBeInTheDocument();
  });

  it("does not show content ready indicator when content is empty", () => {
    const mockOnChange = vi.fn();

    render(<EmailEditor content="" onChange={mockOnChange} />);

    expect(
      screen.queryByText("Email content ready for sending")
    ).not.toBeInTheDocument();
  });

  it("handles tab key insertion", () => {
    const mockOnChange = vi.fn();
    render(<EmailEditor content="Hello" onChange={mockOnChange} />);

    const textarea = screen.getByRole("textbox", { name: /email content/i });

    // Set cursor position at the end
    textarea.selectionStart = 5;
    textarea.selectionEnd = 5;

    fireEvent.keyDown(textarea, { key: "Tab" });

    expect(mockOnChange).toHaveBeenCalledWith("Hello  ");
  });

  it("provides accessibility features", () => {
    const mockOnChange = vi.fn();
    render(<EmailEditor content="" onChange={mockOnChange} />);

    const textarea = screen.getByRole("textbox", { name: /email content/i });

    // Check for proper labeling
    expect(textarea).toHaveAttribute("id", "email-editor");
    expect(screen.getByLabelText("Email Content")).toBe(textarea);

    // Check for aria-describedby
    expect(textarea).toHaveAttribute("aria-describedby", "email-editor-help");
    expect(
      screen.getByText(/Edit your email content here/).closest("div")
    ).toHaveAttribute("id", "email-editor-help");
  });

  it("has proper styling classes", () => {
    const mockOnChange = vi.fn();
    render(<EmailEditor content="test" onChange={mockOnChange} />);

    const textarea = screen.getByRole("textbox", { name: /email content/i });

    // Check for responsive and styling classes
    expect(textarea).toHaveClass(
      "w-full",
      "px-4",
      "py-3",
      "border",
      "rounded-lg"
    );
    expect(textarea).toHaveClass(
      "focus:outline-none",
      "focus:ring-2",
      "focus:ring-blue-500"
    );
  });
});
