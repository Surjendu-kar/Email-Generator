"use client";

import React, { useState, useCallback } from "react";
import RecipientInput from "./RecipientInput";
import EmailEditor from "./EmailEditor";
import LoadingSpinner from "./LoadingSpinner";
import { AppState, EmailGenerationResponse } from "../types";

export default function EmailComposer() {
  // Application state management
  const [state, setState] = useState<AppState>({
    recipients: [],
    prompt: "",
    generatedEmail: "",
    emailSubject: "",
    isGenerating: false,
    isSending: false,
    errors: {},
  });

  // Handle recipients change
  const handleRecipientsChange = useCallback((recipients: string[]) => {
    setState((prev) => ({
      ...prev,
      recipients,
      errors: {
        ...prev.errors,
        recipients: undefined,
      },
    }));
  }, []);

  // Handle prompt input change
  const handlePromptChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const prompt = e.target.value;
      setState((prev) => ({
        ...prev,
        prompt,
        errors: {
          ...prev.errors,
          prompt: undefined,
        },
      }));
    },
    []
  );

  // Handle generated email content change
  const handleEmailContentChange = useCallback((content: string) => {
    setState((prev) => ({
      ...prev,
      generatedEmail: content,
      errors: {
        ...prev.errors,
        email: undefined,
      },
    }));
  }, []);

  // Validate form before generating email
  const validateForm = useCallback((): boolean => {
    const errors: AppState["errors"] = {};

    // Validate prompt
    if (!state.prompt.trim()) {
      errors.prompt = "Please enter a prompt for email generation";
    } else if (state.prompt.length > 2000) {
      errors.prompt = "Prompt is too long. Maximum 2000 characters allowed.";
    }

    // Update errors
    setState((prev) => ({ ...prev, errors }));

    return Object.keys(errors).length === 0;
  }, [state.prompt]);

  // Generate email using AI
  const handleGenerateEmail = useCallback(async () => {
    // Validate form first
    if (!validateForm()) {
      return;
    }

    setState((prev) => ({
      ...prev,
      isGenerating: true,
      errors: { ...prev.errors, email: undefined },
    }));

    try {
      const response = await fetch("/api/generate-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: state.prompt.trim(),
        }),
      });

      const data: EmailGenerationResponse = await response.json();

      if (data.success && data.email) {
        // Extract subject and content from generated email
        const emailContent = data.email;
        let subject = "";
        let content = emailContent;

        // Check if the response includes a subject line
        const subjectMatch = emailContent.match(/^Subject:\s*(.+?)$/m);
        if (subjectMatch) {
          subject = subjectMatch[1].trim();
          content = emailContent.replace(/^Subject:\s*.+?$/m, "").trim();
        }

        setState((prev) => ({
          ...prev,
          generatedEmail: content,
          emailSubject: subject,
          isGenerating: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          isGenerating: false,
          errors: {
            ...prev.errors,
            email: data.error || "Failed to generate email",
          },
        }));
      }
    } catch (error) {
      console.error("Error generating email:", error);
      setState((prev) => ({
        ...prev,
        isGenerating: false,
        errors: {
          ...prev.errors,
          email:
            "Network error occurred. Please check your connection and try again.",
        },
      }));
    }
  }, [state.prompt, validateForm]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI Email Composer
        </h1>
        <p className="text-gray-600">
          Generate personalized emails using AI and send them to multiple
          recipients
        </p>
      </div>

      {/* Main form */}
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        {/* Recipients Input */}
        <RecipientInput
          recipients={state.recipients}
          onRecipientsChange={handleRecipientsChange}
          errors={state.errors.recipients ? [state.errors.recipients] : []}
        />

        {/* Prompt Input */}
        <div className="space-y-3">
          <label
            htmlFor="prompt-input"
            className="block text-sm font-medium text-gray-700"
          >
            Email Generation Prompt
          </label>
          <textarea
            id="prompt-input"
            value={state.prompt}
            onChange={handlePromptChange}
            placeholder="Describe the email you want to generate. For example: 'Write a professional follow-up email after a job interview, thanking the interviewer and expressing continued interest in the position.'"
            className={`w-full px-4 py-3 border rounded-lg shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              state.errors.prompt
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300"
            }`}
            rows={4}
            maxLength={2000}
          />

          {/* Character count */}
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Describe what kind of email you want to generate</span>
            <span>{state.prompt.length}/2000 characters</span>
          </div>

          {/* Prompt validation error */}
          {state.errors.prompt && (
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
              {state.errors.prompt}
            </p>
          )}
        </div>

        {/* Generate Email Button */}
        <div className="flex justify-center">
          <button
            onClick={handleGenerateEmail}
            disabled={state.isGenerating || !state.prompt.trim()}
            className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              state.isGenerating || !state.prompt.trim()
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-md hover:shadow-lg"
            }`}
          >
            {state.isGenerating ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating Email...
              </div>
            ) : (
              "Generate Email"
            )}
          </button>
        </div>

        {/* Loading state for email generation */}
        {state.isGenerating && (
          <div className="flex justify-center py-4">
            <LoadingSpinner message="Generating your email with AI..." />
          </div>
        )}

        {/* Email generation error */}
        {state.errors.email && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-400 mr-2 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-red-700">{state.errors.email}</p>
            </div>
          </div>
        )}

        {/* Generated Email Editor */}
        {state.generatedEmail && (
          <div className="space-y-4">
            {/* Subject line display */}
            {state.emailSubject && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email Subject
                </label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-gray-900">{state.emailSubject}</p>
                </div>
              </div>
            )}

            {/* Email content editor */}
            <EmailEditor
              content={state.generatedEmail}
              onChange={handleEmailContentChange}
              placeholder="Your AI-generated email will appear here. You can edit it before sending."
            />
          </div>
        )}
      </div>
    </div>
  );
}
