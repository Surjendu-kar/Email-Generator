// Test file to verify type imports work correctly
import type {
  EmailGenerationRequest,
  EmailSendRequest,
  AppState,
  ErrorResponse,
  EmailGenerationResponse,
  EmailSendResponse,
} from "./index";

import type {
  EmailValidationSchema,
  RecipientInputProps,
  EmailEditorProps,
  LoadingSpinnerProps,
} from "./validation";

// Test that interfaces can be used
const testEmailGenRequest: EmailGenerationRequest = {
  prompt: "Test prompt",
};

const testEmailSendRequest: EmailSendRequest = {
  recipients: ["test@example.com"],
  subject: "Test Subject",
  content: "Test Content",
};

const testAppState: AppState = {
  recipients: [],
  prompt: "",
  generatedEmail: "",
  emailSubject: "",
  isGenerating: false,
  isSending: false,
  errors: {},
};

// Export to prevent unused variable warnings
export { testEmailGenRequest, testEmailSendRequest, testAppState };
