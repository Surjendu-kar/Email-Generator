"use client";

import React, { useState, useCallback } from "react";
import EmailEditor from "./EmailEditor";
import LoadingSpinner from "./LoadingSpinner";
import NotificationSystem, { useNotifications } from "./NotificationSystem";
import { EmailGenerationResponse } from "../types";

export default function EmailComposer() {
  // Application state management
  const [state, setState] = useState({
    prompt: "",
    generatedEmail: "",
    emailSubject: "",
    isGenerating: false,
    errors: {} as Record<string, string>,
  });

  // Confirmation dialog state
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);

  // Notification system
  const {
    notifications,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  } = useNotifications();

  // Form reset functionality
  const resetForm = useCallback(() => {
    setState({
      prompt: "",
      generatedEmail: "",
      emailSubject: "",
      isGenerating: false,
      errors: {},
    });
    showInfo(
      "Form Reset",
      "The form has been cleared and is ready for new composition."
    );
  }, [showInfo]);

  // Handle reset confirmation
  const handleResetConfirmation = useCallback(() => {
    setShowResetConfirmation(false);
    resetForm();
  }, [resetForm]);

  // Check if form has content that would be lost
  const hasFormContent = useCallback(() => {
    return state.prompt.trim() !== "" || state.generatedEmail.trim() !== "";
  }, [state.prompt, state.generatedEmail]);

  // Handle reset button click with confirmation
  const handleResetClick = useCallback(() => {
    if (hasFormContent()) {
      setShowResetConfirmation(true);
    } else {
      resetForm();
    }
  }, [hasFormContent, resetForm]);

  // Real-time validation for prompt
  const validatePrompt = useCallback((prompt: string): string | undefined => {
    if (!prompt.trim()) {
      return "Please enter a prompt for email generation";
    }
    if (prompt.length > 2000) {
      return "Prompt is too long. Maximum 2000 characters allowed.";
    }
    if (prompt.length < 10) {
      return "Prompt is too short. Please provide more details.";
    }
    return undefined;
  }, []);

  // Real-time validation for email content
  const validateEmailContent = useCallback(
    (content: string): string | undefined => {
      if (!content.trim()) {
        return "Please generate an email before sending";
      }
      if (content.length < 10) {
        return "Email content is too short";
      }
      return undefined;
    },
    []
  );

  // Handle prompt input change with real-time validation
  const handlePromptChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const prompt = e.target.value;

      // Real-time validation
      const promptError = validatePrompt(prompt);

      setState((prev) => ({
        ...prev,
        prompt,
        errors: {
          ...prev.errors,
          prompt: promptError,
        },
      }));
    },
    [validatePrompt]
  );

  // Handle generated email content change with real-time validation
  const handleEmailContentChange = useCallback(
    (content: string) => {
      // Real-time validation
      const emailError = validateEmailContent(content);

      setState((prev) => ({
        ...prev,
        generatedEmail: content,
        errors: {
          ...prev.errors,
          email: emailError,
        },
      }));
    },
    [validateEmailContent]
  );

  // Validate form before generating email
  const validateForm = useCallback((): boolean => {
    const errors: AppState["errors"] = {};

    // Validate prompt
    const promptError = validatePrompt(state.prompt);
    if (promptError) {
      errors.prompt = promptError;
    }

    // Update errors
    setState((prev) => ({ ...prev, errors }));

    return Object.keys(errors).length === 0;
  }, [state.prompt, validatePrompt]);

  // Generate email using AI
  const handleGenerateEmail = useCallback(async () => {
    // Validate form first
    if (!validateForm()) {
      showWarning(
        "Validation Error",
        "Please fix the form errors before generating an email."
      );
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

      if (!response.ok) {
        // Handle HTTP errors
        const errorText = await response.text();
        let errorMessage = "Failed to generate email";

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = `Server error (${response.status}): ${response.statusText}`;
        }

        setState((prev) => ({
          ...prev,
          isGenerating: false,
          errors: {
            ...prev.errors,
            email: errorMessage,
          },
        }));

        showError("Generation Failed", errorMessage);
        return;
      }

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

        showSuccess(
          "Email Generated",
          "Your AI-generated email is ready for editing and sending."
        );
      } else {
        const errorMessage = data.error || "Failed to generate email";
        setState((prev) => ({
          ...prev,
          isGenerating: false,
          errors: {
            ...prev.errors,
            email: errorMessage,
          },
        }));

        showError("Generation Failed", errorMessage);
      }
    } catch (error) {
      console.error("Error generating email:", error);
      const errorMessage =
        error instanceof Error
          ? `Network error: ${error.message}`
          : "Network error occurred. Please check your connection and try again.";

      setState((prev) => ({
        ...prev,
        isGenerating: false,
        errors: {
          ...prev.errors,
          email: errorMessage,
        },
      }));

      showError("Network Error", errorMessage);
    }
  }, [state.prompt, validateForm, showSuccess, showError, showWarning]);

  // Open Gmail with generated email content
  const handleOpenGmail = useCallback(() => {
    if (!state.generatedEmail.trim()) {
      showWarning("No Content", "Please generate an email first.");
      return;
    }

    try {
      const subject = state.emailSubject || "AI Generated Email";
      const body = state.generatedEmail.trim();

      // Open Gmail compose with pre-filled content
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;

      window.open(gmailUrl, "_blank");

      showSuccess(
        "Gmail Opened",
        "Gmail has been opened with your AI-generated email. Add recipient email addresses and send!"
      );
    } catch (error) {
      console.error("Error opening Gmail:", error);
      showError(
        "Failed to Open Gmail",
        "Could not open Gmail. Please try copying the content manually."
      );
    }
  }, [
    state.generatedEmail,
    state.emailSubject,
    showSuccess,
    showError,
    showWarning,
  ]);

  return (
    <>
      {/* Notification System */}
      <NotificationSystem
        notifications={notifications}
        onDismiss={removeNotification}
      />

      {/* Reset Confirmation Dialog */}
      {showResetConfirmation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 transform transition-all duration-300 scale-100">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Confirm Form Reset
              </h3>
            </div>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Are you sure you want to clear the form? This will remove all
              recipients, your prompt, and any generated email content. This
              action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={() => setShowResetConfirmation(false)}
                className="px-4 py-2.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 font-medium hover:scale-105 active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleResetConfirmation}
                className="px-4 py-2.5 text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 font-medium hover:scale-105 active:scale-95 shadow-lg"
              >
                Clear Form
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {/* Header with Reset Button */}
        <div className="flex justify-end relative">
          {/* Reset Button */}
          {hasFormContent() && (
            <button
              onClick={handleResetClick}
              className="px-3 py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transform hover:scale-105"
              title="Clear form"
            >
              <svg
                className="w-4 h-4 inline mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Clear Form
            </button>
          )}
        </div>

        {/* Main form */}
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
          {/* Prompt Input */}
          <div className="space-y-3">
            <label
              htmlFor="prompt-input"
              className="block text-sm font-semibold text-slate-700"
            >
              Email Generation Prompt
            </label>
            <textarea
              id="prompt-input"
              value={state.prompt}
              onChange={handlePromptChange}
              placeholder="Describe the email you want to generate. For example: 'Write a professional follow-up email after a job interview, thanking the interviewer and expressing continued interest in the position.'"
              className={`w-full px-4 py-3 border rounded-xl shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-slate-900 placeholder-slate-500 hover:border-slate-400 ${
                state.errors.prompt
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50"
                  : "border-slate-300 bg-slate-50 focus:bg-white"
              }`}
              rows={4}
              maxLength={2000}
            />

            {/* Character count */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-xs text-slate-500">
              <span>Describe what kind of email you want to generate</span>
              <span className="font-medium">
                {state.prompt.length}/2000 characters
              </span>
            </div>

            {/* Prompt validation error */}
            {state.errors.prompt && (
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
                {state.errors.prompt}
              </p>
            )}
          </div>

          {/* Generate Email Button */}
          <div className="flex justify-center">
            <button
              onClick={handleGenerateEmail}
              disabled={state.isGenerating || !state.prompt.trim()}
              className={`px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform ${
                state.isGenerating || !state.prompt.trim()
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 active:from-blue-800 active:to-blue-900 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
              }`}
            >
              {state.isGenerating ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  <span className="hidden sm:inline">Generating Email...</span>
                  <span className="sm:hidden">Generating...</span>
                </div>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 inline mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Generate Email
                </>
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
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-red-400 mr-3 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Generation Error
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    {state.errors.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Generated Email Editor */}
          {state.generatedEmail && (
            <div className="space-y-4">
              {/* Subject line display */}
              {state.emailSubject && (
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700">
                    Email Subject
                  </label>
                  <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-xl shadow-sm">
                    <p className="text-slate-900 font-medium">
                      {state.emailSubject}
                    </p>
                  </div>
                </div>
              )}

              {/* Email content editor */}
              <EmailEditor
                content={state.generatedEmail}
                onChange={handleEmailContentChange}
                placeholder="Your AI-generated email will appear here. You can edit it before sending."
              />

              {/* Open Gmail Button */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleOpenGmail}
                  disabled={!state.generatedEmail.trim()}
                  className={`px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transform ${
                    !state.generatedEmail.trim()
                      ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 active:from-red-800 active:to-red-900 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                  }`}
                >
                  <img
                    src="/Gmail.svg"
                    alt="Gmail"
                    className="w-5 h-5 inline mr-2 filter brightness-0 invert"
                  />
                  <span>Open in Gmail</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
