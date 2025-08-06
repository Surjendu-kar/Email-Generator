// Core interfaces for the AI Email Sender application

/**
 * Request interface for email generation API
 */
export interface EmailGenerationRequest {
  prompt: string;
}

/**
 * Request interface for email sending API
 */
export interface EmailSendRequest {
  recipients: string[];
  subject: string;
  content: string;
}

/**
 * Main application state interface
 */
export interface AppState {
  recipients: string[];
  prompt: string;
  generatedEmail: string;
  emailSubject: string;
  isGenerating: boolean;
  isSending: boolean;
  errors: {
    recipients?: string;
    prompt?: string;
    email?: string;
    sending?: string;
  };
}

/**
 * Success response interface for API endpoints
 */
export interface SuccessResponse<T = any> {
  success: true;
  data?: T;
}

/**
 * Error response interface for API endpoints
 */
export interface ErrorResponse {
  success: false;
  error: string;
  details?: string;
}

/**
 * Union type for all API responses
 */
export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

/**
 * Email generation API response
 */
export interface EmailGenerationResponse {
  success: boolean;
  email?: string;
  error?: string;
}

/**
 * Email sending API response
 */
export interface EmailSendResponse {
  success: boolean;
  sentCount?: number;
  failedRecipients?: string[];
  error?: string;
}

/**
 * Validation error interface
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Form validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}
