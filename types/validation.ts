// Validation schemas and utility types

/**
 * Prompt validation constraints
 */
export const PROMPT_VALIDATION = {
  MIN_LENGTH: 10,
  MAX_LENGTH: 1000,
} as const;

/**
 * Content validation constraints
 */
export const CONTENT_VALIDATION = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 10000,
} as const;

/**
 * Validation rule type
 */
export type ValidationRule<T> = (value: T) => string | null;

/**
 * Form field validation state
 */
export interface FieldValidation {
  value: string;
  error: string | null;
  touched: boolean;
}

/**
 * Complete form validation state
 */
export interface FormValidationState {
  prompt: FieldValidation;
  emailContent: FieldValidation;
  emailSubject: FieldValidation;
}

/**
 * Loading states for different operations
 */
export interface LoadingStates {
  generating: boolean;
  validating: boolean;
}

/**
 * Component props interfaces
 */
export interface EmailEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export interface LoadingSpinnerProps {
  message?: string;
}

/**
 * Sanitizes user input to prevent XSS and other security issues
 * @param input - The input string to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  return (
    input
      .trim()
      // Remove null bytes and replace with space
      .replace(/\0/g, " ")
      // Remove control characters except newlines and tabs
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      // Limit consecutive spaces only (preserve newlines and tabs)
      .replace(/[ ]{2,}/g, " ")
      // Remove leading/trailing whitespace
      .trim()
  );
}

/**
 * Sanitizes prompt input for AI generation
 * @param prompt - The prompt text to sanitize
 * @returns Sanitized prompt text
 */
export function sanitizePrompt(prompt: string): string {
  if (!prompt || typeof prompt !== "string") {
    return "";
  }

  let sanitized = sanitizeInput(prompt);

  // Additional prompt-specific sanitization
  // Remove excessive punctuation
  sanitized = sanitized.replace(/[!?]{3,}/g, "!!");

  // Limit length
  if (sanitized.length > PROMPT_VALIDATION.MAX_LENGTH) {
    sanitized = sanitized.substring(0, PROMPT_VALIDATION.MAX_LENGTH);
  }

  return sanitized;
}

/**
 * Sanitizes email content
 * @param content - The email content to sanitize
 * @returns Sanitized email content
 */
export function sanitizeEmailContent(content: string): string {
  if (!content || typeof content !== "string") {
    return "";
  }

  // First normalize line breaks
  let sanitized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Then apply basic sanitization but preserve newlines
  sanitized = sanitized
    .replace(/\0/g, " ")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/[ ]{2,}/g, " ")
    .trim();

  // Limit length
  if (sanitized.length > CONTENT_VALIDATION.MAX_LENGTH) {
    sanitized = sanitized.substring(0, CONTENT_VALIDATION.MAX_LENGTH);
  }

  return sanitized;
}
