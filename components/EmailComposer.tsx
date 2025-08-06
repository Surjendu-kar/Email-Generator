"use client";

import React, { useState, useCallback } from "react";
import RecipientInput from "./RecipientInput";
import EmailEditor from "./EmailEditor";
import LoadingSpinner from "./LoadingSpinner";
import NotificationSystem, { useNotifications } from "./NotificationSystem";
import { AppState, EmailGenerationResponse, EmailSendResponse } from "../types";

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

  // Notification system
  const {
    notifications,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  } = useNotifications();

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

  // Real-time validation for recipients
  const validateRecipients = useCallback(
    (recipients: string[]): string | undefined => {
      if (recipients.length === 0) {
        return "Please add at least one recipient";
      }
      if (recipients.length > 50) {
        return "Maximum 50 recipients allowed";
      }
      return undefined;
    },
    []
  );

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

  // Handle recipients change with real-time validation
  const handleRecipientsChange = useCallback(
    (recipients: string[]) => {
      // Real-time validation
      const recipientsError = validateRecipients(recipients);

      setState((prev) => ({
        ...prev,
        recipients,
        errors: {
          ...prev.errors,
          recipients: recipientsError,
        },
      }));
    },
    [validateRecipients]
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

  // Validate form before sending email
  const validateSendForm = useCallback((): boolean => {
    const errors: AppState["errors"] = {};

    // Validate recipients
    const recipientsError = validateRecipients(state.recipients);
    if (recipientsError) {
      errors.recipients = recipientsError;
    }

    // Validate email content
    const emailError = validateEmailContent(state.generatedEmail);
    if (emailError) {
      errors.email = emailError;
    }

    // Update errors
    setState((prev) => ({ ...prev, errors }));

    return Object.keys(errors).length === 0;
  }, [
    state.recipients,
    state.generatedEmail,
    validateRecipients,
    validateEmailContent,
  ]);

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

  // Send email to recipients
  const handleSendEmail = useCallback(async () => {
    // Validate form first
    if (!validateSendForm()) {
      showWarning(
        "Validation Error",
        "Please fix the form errors before sending the email."
      );
      return;
    }

    setState((prev) => ({
      ...prev,
      isSending: true,
      errors: { ...prev.errors, sending: undefined },
    }));

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipients: state.recipients,
          subject: state.emailSubject || "AI Generated Email",
          content: state.generatedEmail.trim(),
        }),
      });

      if (!response.ok) {
        // Handle HTTP errors
        const errorText = await response.text();
        let errorMessage = "Failed to send email";

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = `Server error (${response.status}): ${response.statusText}`;
        }

        setState((prev) => ({
          ...prev,
          isSending: false,
          errors: {
            ...prev.errors,
            sending: errorMessage,
          },
        }));

        showError("Send Failed", errorMessage);
        return;
      }

      const data: EmailSendResponse = await response.json();

      if (data.success) {
        // Handle successful sending
        const recipientCount = data.sentCount || 0;
        const failedCount = data.failedRecipients?.length || 0;

        if (failedCount > 0) {
          // Partial success
          const successMessage = `Email sent to ${recipientCount} recipient${
            recipientCount === 1 ? "" : "s"
          }`;
          const failureMessage = `Failed to send to ${failedCount} recipient${
            failedCount === 1 ? "" : "s"
          }: ${data.failedRecipients?.join(", ")}`;

          showWarning(
            "Partially Successful",
            `${successMessage}. ${failureMessage}`
          );

          setState((prev) => ({
            ...prev,
            isSending: false,
            errors: {
              ...prev.errors,
              sending: `Partially successful: ${data.error}`,
            },
          }));
        } else {
          // Complete success
          const successMessage = `Email successfully sent to ${recipientCount} recipient${
            recipientCount === 1 ? "" : "s"
          }!`;

          showSuccess("Email Sent", successMessage);

          // Clear form after successful sending
          setState((prev) => ({
            ...prev,
            recipients: [],
            prompt: "",
            generatedEmail: "",
            emailSubject: "",
            isSending: false,
            errors: {},
          }));
        }
      } else {
        const errorMessage = data.error || "Failed to send email";
        setState((prev) => ({
          ...prev,
          isSending: false,
          errors: {
            ...prev.errors,
            sending: errorMessage,
          },
        }));

        showError("Send Failed", errorMessage);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      const errorMessage =
        error instanceof Error
          ? `Network error: ${error.message}`
          : "Network error occurred. Please check your connection and try again.";

      setState((prev) => ({
        ...prev,
        isSending: false,
        errors: {
          ...prev.errors,
          sending: errorMessage,
        },
      }));

      showError("Network Error", errorMessage);
    }
  }, [
    state.recipients,
    state.generatedEmail,
    state.emailSubject,
    validateSendForm,
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

              {/* Send Email Button */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleSendEmail}
                  disabled={
                    state.isSending ||
                    state.recipients.length === 0 ||
                    !state.generatedEmail.trim()
                  }
                  className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                    state.isSending ||
                    state.recipients.length === 0 ||
                    !state.generatedEmail.trim()
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700 active:bg-green-800 shadow-md hover:shadow-lg"
                  }`}
                >
                  {state.isSending ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending Email...
                    </div>
                  ) : (
                    `Send Email to ${state.recipients.length} recipient${
                      state.recipients.length === 1 ? "" : "s"
                    }`
                  )}
                </button>
              </div>

              {/* Loading state for email sending */}
              {state.isSending && (
                <div className="flex justify-center py-4">
                  <LoadingSpinner message="Sending your email..." />
                </div>
              )}
            </div>
          )}

          {/* Email sending status messages */}
          {state.errors.sending && (
            <div
              className={`border rounded-lg p-4 ${
                state.errors.sending.startsWith("✓")
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center">
                <svg
                  className={`w-5 h-5 mr-2 flex-shrink-0 ${
                    state.errors.sending.startsWith("✓")
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  {state.errors.sending.startsWith("✓") ? (
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  ) : (
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  )}
                </svg>
                <p
                  className={`text-sm ${
                    state.errors.sending.startsWith("✓")
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  {state.errors.sending}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
