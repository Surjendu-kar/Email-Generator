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

  const addRecipient = useCallback(() => {
    if (!inputValue.trim()) {
      setInputError("Please enter an email address");
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
      setInputError(validation.error || "Invalid email address format");
      return;
    }

    // Check for duplicates
    if (recipients.includes(sanitizedEmail)) {
      setInputError("This email address has already been added");
      return;
    }

    // Check maximum recipients limit
    if (recipients.length >= 50) {
      setInputError(
        "Maximum 50 recipients allowed. Please remove some recipients first."
      );
      return;
    }

    // Add the recipient
    onRecipientsChange([...recipients, sanitizedEmail]);
    setInputValue("");
    setInputError(null);
  }, [inputValue, recipients, onRecipientsChange]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);

      // Clear input error when user starts typing
      if (inputError) {
        setInputError(null);
      }

      // Real-time validation for email format (only if user has typed something substantial)
      if (value.trim().length > 3 && value.includes("@")) {
        const sanitizedEmail = sanitizeEmail(value.trim());
        if (sanitizedEmail) {
          const validation = validateEmailFormat(sanitizedEmail);
          if (!validation.isValid) {
            setInputError(validation.error || "Invalid email address format");
          } else if (recipients.includes(sanitizedEmail)) {
            setInputError("This email address has already been added");
          }
        }
      }
    },
    [inputError, recipients]
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        addRecipient();
      }
    },
    [addRecipient]
  );

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
        className="block text-sm font-semibold text-slate-700"
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
          className={`w-full px-4 py-3 pr-16 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-slate-900 placeholder-slate-500 hover:border-slate-400 ${
            inputError || errors.length > 0
              ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50"
              : "border-slate-300 bg-slate-50 focus:bg-white"
          }`}
        />

        {/* Add button */}
        {inputValue.trim() && (
          <button
            type="button"
            onClick={addRecipient}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            Add
          </button>
        )}
      </div>

      {/* Input validation error */}
      {inputError && (
        <p className="text-sm text-red-600 flex items-center bg-red-50 p-3 rounded-lg border border-red-200">
          <svg
            className="w-4 h-4 mr-2 flex-shrink-0"
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
        <div className="space-y-2">
          {errors.map((error, index) => (
            <p
              key={index}
              className="text-sm text-red-600 flex items-center bg-red-50 p-3 rounded-lg border border-red-200"
            >
              <svg
                className="w-4 h-4 mr-2 flex-shrink-0"
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
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">Recipients</p>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
              {recipients.length}/50
            </span>
          </div>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-3 border border-slate-200 rounded-xl bg-slate-50 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
            {recipients.map((email, index) => (
              <div
                key={`${email}-${index}`}
                className="inline-flex items-center px-3 py-2 rounded-lg text-sm bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border border-blue-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
              >
                <span className="truncate max-w-xs font-medium" title={email}>
                  {email}
                </span>
                <button
                  type="button"
                  onClick={() => removeRecipient(email)}
                  className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200 hover:scale-110 active:scale-95"
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
      <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200">
        💡 Enter email addresses and press{" "}
        <kbd className="px-1 py-0.5 bg-slate-200 rounded text-xs font-mono">
          Enter
        </kbd>{" "}
        or{" "}
        <kbd className="px-1 py-0.5 bg-slate-200 rounded text-xs font-mono">
          ,
        </kbd>{" "}
        to add them. Click the × to remove recipients.
      </p>
    </div>
  );
}