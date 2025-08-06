// Validation schemas and utility types

/**
 * Email validation schema
 */
export interface EmailValidationSchema {
  email: string;
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Prompt validation constraints
 */
export const PROMPT_VALIDATION = {
  MIN_LENGTH: 10,
  MAX_LENGTH: 1000,
} as const;

/**
 * Email validation constraints
 */
export const EMAIL_VALIDATION = {
  MAX_RECIPIENTS: 50,
  EMAIL_REGEX:
    /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
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
  recipients: FieldValidation;
  prompt: FieldValidation;
  emailContent: FieldValidation;
  emailSubject: FieldValidation;
}

/**
 * Loading states for different operations
 */
export interface LoadingStates {
  generating: boolean;
  sending: boolean;
  validating: boolean;
}

/**
 * Component props interfaces
 */
export interface RecipientInputProps {
  recipients: string[];
  onRecipientsChange: (recipients: string[]) => void;
  errors?: string[];
}

export interface EmailEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export interface LoadingSpinnerProps {
  message?: string;
}

/**
 * Email validation result interface
 */
export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates a single email address format
 * @param email - The email address to validate
 * @returns EmailValidationResult with validation status and error message
 */
export function validateEmailFormat(email: string): EmailValidationResult {
  if (!email || typeof email !== "string") {
    return {
      isValid: false,
      error: "Email address is required",
    };
  }

  const trimmedEmail = email.trim();

  if (trimmedEmail.length === 0) {
    return {
      isValid: false,
      error: "Email address cannot be empty",
    };
  }

  if (trimmedEmail.length > 254) {
    return {
      isValid: false,
      error: "Email address is too long (maximum 254 characters)",
    };
  }

  if (!EMAIL_VALIDATION.EMAIL_REGEX.test(trimmedEmail)) {
    return {
      isValid: false,
      error: "Please enter a valid email address",
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Validates multiple email addresses
 * @param emails - Array of email addresses to validate
 * @returns Array of validation results for each email
 */
export function validateEmailList(emails: string[]): EmailValidationResult[] {
  if (!Array.isArray(emails)) {
    return [
      {
        isValid: false,
        error: "Invalid email list format",
      },
    ];
  }

  if (emails.length === 0) {
    return [
      {
        isValid: false,
        error: "At least one email address is required",
      },
    ];
  }

  if (emails.length > EMAIL_VALIDATION.MAX_RECIPIENTS) {
    return [
      {
        isValid: false,
        error: `Maximum ${EMAIL_VALIDATION.MAX_RECIPIENTS} recipients allowed`,
      },
    ];
  }

  // Check for duplicates
  const uniqueEmails = new Set(
    emails.map((email) => email.trim().toLowerCase())
  );
  if (uniqueEmails.size !== emails.length) {
    return [
      {
        isValid: false,
        error: "Duplicate email addresses are not allowed",
      },
    ];
  }

  return emails.map((email) => validateEmailFormat(email));
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
 * Sanitizes email address input
 * @param email - The email address to sanitize
 * @returns Sanitized email address
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== "string") {
    return "";
  }

  return (
    email
      .trim()
      .toLowerCase()
      // Remove any characters that shouldn't be in an email
      .replace(/[^\w@.-]/g, "")
      // Remove multiple consecutive dots
      .replace(/\.{2,}/g, ".")
      // Remove dots at the beginning or end
      .replace(/^\.+|\.+$/g, "")
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
