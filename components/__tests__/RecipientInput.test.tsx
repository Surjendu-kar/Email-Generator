import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import RecipientInput from "../RecipientInput";

describe("RecipientInput", () => {
  const mockOnRecipientsChange = vi.fn();

  beforeEach(() => {
    mockOnRecipientsChange.mockClear();
  });

  it("renders with empty recipients list", () => {
    render(
      <RecipientInput
        recipients={[]}
        onRecipientsChange={mockOnRecipientsChange}
      />
    );

    expect(screen.getByLabelText("Email Recipients")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Enter email addresses/)
    ).toBeInTheDocument();
  });

  it("adds valid email on Enter key press", async () => {
    const user = userEvent.setup();

    render(
      <RecipientInput
        recipients={[]}
        onRecipientsChange={mockOnRecipientsChange}
      />
    );

    const input = screen.getByPlaceholderText(/Enter email addresses/);
    await user.type(input, "test@example.com");
    await user.keyboard("{Enter}");

    expect(mockOnRecipientsChange).toHaveBeenCalledWith(["test@example.com"]);
  });

  it("adds valid email on comma key press", async () => {
    const user = userEvent.setup();

    render(
      <RecipientInput
        recipients={[]}
        onRecipientsChange={mockOnRecipientsChange}
      />
    );

    const input = screen.getByPlaceholderText(/Enter email addresses/);
    await user.type(input, "test@example.com,");

    expect(mockOnRecipientsChange).toHaveBeenCalledWith(["test@example.com"]);
  });

  it("shows error for invalid email format", async () => {
    const user = userEvent.setup();

    render(
      <RecipientInput
        recipients={[]}
        onRecipientsChange={mockOnRecipientsChange}
      />
    );

    const input = screen.getByPlaceholderText(/Enter email addresses/);
    await user.type(input, "invalid-email");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(
        screen.getByText(/Please enter a valid email address/)
      ).toBeInTheDocument();
    });
    expect(mockOnRecipientsChange).not.toHaveBeenCalled();
  });

  it("shows error for duplicate email", async () => {
    const user = userEvent.setup();

    render(
      <RecipientInput
        recipients={["test@example.com"]}
        onRecipientsChange={mockOnRecipientsChange}
      />
    );

    const input = screen.getByPlaceholderText(/Enter email addresses/);
    await user.type(input, "test@example.com");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(
        screen.getByText(/This email address has already been added/)
      ).toBeInTheDocument();
    });
    expect(mockOnRecipientsChange).not.toHaveBeenCalled();
  });

  it("displays existing recipients with remove buttons", () => {
    render(
      <RecipientInput
        recipients={["test1@example.com", "test2@example.com"]}
        onRecipientsChange={mockOnRecipientsChange}
      />
    );

    expect(screen.getByText("test1@example.com")).toBeInTheDocument();
    expect(screen.getByText("test2@example.com")).toBeInTheDocument();
    expect(screen.getByText("Recipients (2/50)")).toBeInTheDocument();
  });

  it("removes recipient when remove button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <RecipientInput
        recipients={["test1@example.com", "test2@example.com"]}
        onRecipientsChange={mockOnRecipientsChange}
      />
    );

    const removeButton = screen.getByLabelText("Remove test1@example.com");
    await user.click(removeButton);

    expect(mockOnRecipientsChange).toHaveBeenCalledWith(["test2@example.com"]);
  });

  it("shows Add button when input has value", async () => {
    const user = userEvent.setup();

    render(
      <RecipientInput
        recipients={[]}
        onRecipientsChange={mockOnRecipientsChange}
      />
    );

    const input = screen.getByPlaceholderText(/Enter email addresses/);
    await user.type(input, "test@example.com");

    expect(screen.getByText("Add")).toBeInTheDocument();
  });

  it("adds email when Add button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <RecipientInput
        recipients={[]}
        onRecipientsChange={mockOnRecipientsChange}
      />
    );

    const input = screen.getByPlaceholderText(/Enter email addresses/);
    await user.type(input, "test@example.com");

    const addButton = screen.getByText("Add");
    await user.click(addButton);

    expect(mockOnRecipientsChange).toHaveBeenCalledWith(["test@example.com"]);
  });

  it("displays general errors passed as props", () => {
    render(
      <RecipientInput
        recipients={[]}
        onRecipientsChange={mockOnRecipientsChange}
        errors={["General error message"]}
      />
    );

    expect(screen.getByText("General error message")).toBeInTheDocument();
  });

  it("clears input after successful email addition", async () => {
    const user = userEvent.setup();

    render(
      <RecipientInput
        recipients={[]}
        onRecipientsChange={mockOnRecipientsChange}
      />
    );

    const input = screen.getByPlaceholderText(
      /Enter email addresses/
    ) as HTMLInputElement;
    await user.type(input, "test@example.com");
    await user.keyboard("{Enter}");

    expect(input.value).toBe("");
  });
});
