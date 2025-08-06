"use client";

import React, { useState, useCallback } from "react";
import { validateEmailFormat, sanitizeEmail } from "../types/validation";

interface RecipientInputProps {
  recipients: string[];
  onRecipientsChange: (recipients: string[]) => void;
  errors?: string[];
}

export default function RecipientInput({
  recipients,
  onRecipientsChange,
  errors = [],
}: RecipientInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);

      // Clear input error when user starts typing
      if (inputError) {
        setInputError(null);
      }
    },
    [inputError]
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        addRecipient();
      }
    },
    [inputValue, recipients]
  );

  const addRecipient = useCallback(() => {
    if (!inputValue.trim()) {
      return;
    }

    const sanitizedEmail = sanitizeEmail(inputValue.trim());

    if (!sanitizedEmail) {
      setInputError("Please enter a valid email address");
      return;
    }

    // Validate email format
    const validation = validateEmailFormat(sanitizedEmail);
    if (!validation.isValid) {
      setInputError(validation.error || "Invalid email address");
      return;
    }

    // Check for duplicates
    if (recipients.includes(sanitizedEmail)) {
      setInputError("This email address has already been added");
      return;
    }

    // Check maximum recipients limit
    if (recipients.length >= 50) {
      setInputError("Maximum 50 recipients allowed");
      return;
    }

    // Add the recipient
    onRecipientsChange([...recipients, sanitizedEmail]);
    setInputValue("");
    setInputError(null);
  }, [inputValue, recipients, onRecipientsChange]);

  const removeRecipient = useCallback(
    (emailToRemove: string) => {
      onRecipientsChange(recipients.filter((email) => email !== emailToRemove));
    },
    [recipients, onRecipientsChange]
  );

  const handleBlur = useCallback(() => {
    if (inputValue.trim()) {
      addRecipient();
    }
  }, [inputValue, addRecipient]);

  return (
    <div className="space-y-3">
      <label
        htmlFor="recipients"
        className="block text-sm font-medium text-gray-700"
      >
        Email Recipients
      </label>

      {/* Input field */}
      <div className="relative">
        <input
          id="recipients"
          type="email"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onBlur={handleBlur}
          placeholder="Enter email addresses (press Enter or comma to add)"
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            inputError || errors.length > 0
              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300"
          }`}
        />

        {/* Add button */}
        {inputValue.trim() && (
          <button
            type="button"
            onClick={addRecipient}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
          >
            Add
          </button>
        )}
      </div>

      {/* Input validation error */}
      {inputError && (
        <p className="text-sm text-red-600 flex items-center">
          <svg
            className="w-4 h-4 mr-1 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {inputError}
        </p>
      )}

      {/* General errors */}
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600 flex items-center">
              <svg
                className="w-4 h-4 mr-1 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </p>
          ))}
        </div>
      )}

      {/* Recipients list */}
      {recipients.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Recipients ({recipients.length}/50)
          </p>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-gray-200 rounded-md bg-gray-50">
            {recipients.map((email, index) => (
              <div
                key={`${email}-${index}`}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200"
              >
                <span className="truncate max-w-xs" title={email}>
                  {email}
                </span>
                <button
                  type="button"
                  onClick={() => removeRecipient(email)}
                  className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
                  aria-label={`Remove ${email}`}
                >
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Helper text */}
      <p className="text-xs text-gray-500">
        Enter email addresses and press Enter or comma to add them. Click the ×
        to remove recipients.
      </p>
    </div>
  );
}
