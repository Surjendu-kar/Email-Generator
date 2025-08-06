import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

// Mock nodemailer
const mockSendMail = vi.fn();
const mockVerify = vi.fn();

vi.mock("nodemailer", () => ({
  default: {
    createTransporter: vi.fn(() => ({
      sendMail: mockSendMail,
      verify: mockVerify,
    })),
  },
}));

// Helper function to create mock NextRequest
function createMockRequest(body: any): NextRequest {
  return new NextRequest("http://localhost:3000/api/send-email", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

describe("/api/send-email", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerify.mockResolvedValue(true);
    mockSendMail.mockResolvedValue({ messageId: "test-message-id" });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Input Validation", () => {
    it("should return 400 when recipients is missing", async () => {
      const request = createMockRequest({
        subject: "Test Subject",
        content: "Test content",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Recipients are required");
    });

    it("should return 400 when recipients is empty array", async () => {
      const request = createMockRequest({
        recipients: [],
        subject: "Test Subject",
        content: "Test content",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Recipients are required");
    });

    it("should return 400 when subject is missing", async () => {
      const request = createMockRequest({
        recipients: ["test@example.com"],
        content: "Test content",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Subject is required");
    });

    it("should return 400 when content is missing", async () => {
      const request = createMockRequest({
        recipients: ["test@example.com"],
        subject: "Test Subject",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Content is required");
    });

    it("should return 400 when subject is empty string", async () => {
      const request = createMockRequest({
        recipients: ["test@example.com"],
        subject: "   ",
        content: "Test content",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Subject is required");
    });

    it("should return 400 when content is empty string", async () => {
      const request = createMockRequest({
        recipients: ["test@example.com"],
        subject: "Test Subject",
        content: "   ",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Content is required");
    });
  });

  describe("Email Validation", () => {
    it("should return 400 for invalid email addresses", async () => {
      const request = createMockRequest({
        recipients: ["invalid-email", "another-invalid"],
        subject: "Test Subject",
        content: "Test content",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Invalid email addresses");
      expect(data.failedRecipients).toEqual([
        "invalid-email",
        "another-invalid",
      ]);
    });

    it("should return 400 for mixed valid and invalid emails", async () => {
      const request = createMockRequest({
        recipients: [
          "valid@example.com",
          "invalid-email",
          "also-valid@test.com",
          "bad-email",
        ],
        subject: "Test Subject",
        content: "Test content",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Invalid email addresses");
      expect(data.failedRecipients).toEqual(["invalid-email", "bad-email"]);
    });

    it("should accept valid email addresses", async () => {
      const request = createMockRequest({
        recipients: [
          "test@example.com",
          "user@domain.co.uk",
          "name.surname@company.org",
        ],
        subject: "Test Subject",
        content: "Test content",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.sentCount).toBe(3);
    });
  });

  describe("Email Sending", () => {
    it("should successfully send email to single recipient", async () => {
      const request = createMockRequest({
        recipients: ["test@example.com"],
        subject: "Test Subject",
        content: "Test content",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.sentCount).toBe(1);
      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledWith({
        from: '"AI Email Sender" <noreply@example.com>',
        to: "test@example.com",
        subject: "Test Subject",
        text: "Test content",
        html: "Test content",
      });
    });

    it("should successfully send email to multiple recipients", async () => {
      const request = createMockRequest({
        recipients: [
          "test1@example.com",
          "test2@example.com",
          "test3@example.com",
        ],
        subject: "Test Subject",
        content: "Test content",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.sentCount).toBe(3);
      expect(mockSendMail).toHaveBeenCalledTimes(3);
    });

    it("should handle content with line breaks", async () => {
      const content = "Line 1\nLine 2\nLine 3";
      const request = createMockRequest({
        recipients: ["test@example.com"],
        subject: "Test Subject",
        content,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockSendMail).toHaveBeenCalledWith({
        from: '"AI Email Sender" <noreply@example.com>',
        to: "test@example.com",
        subject: "Test Subject",
        text: content,
        html: "Line 1<br>Line 2<br>Line 3",
      });
    });

    it("should sanitize malicious content", async () => {
      const maliciousContent =
        "Hello <script>alert('xss')</script> World <iframe src='evil.com'></iframe>";
      const request = createMockRequest({
        recipients: ["test@example.com"],
        subject: "Test <script>alert('xss')</script> Subject",
        content: maliciousContent,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockSendMail).toHaveBeenCalledWith({
        from: '"AI Email Sender" <noreply@example.com>',
        to: "test@example.com",
        subject: "Test  Subject",
        text: "Hello  World",
        html: "Hello  World",
      });
    });
  });

  describe("Error Handling", () => {
    it("should return 500 when transporter verification fails", async () => {
      mockVerify.mockRejectedValue(new Error("SMTP connection failed"));

      const request = createMockRequest({
        recipients: ["test@example.com"],
        subject: "Test Subject",
        content: "Test content",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Email service configuration error");
    });

    it("should return 500 when all emails fail to send", async () => {
      mockSendMail.mockRejectedValue(new Error("SMTP send failed"));

      const request = createMockRequest({
        recipients: ["test1@example.com", "test2@example.com"],
        subject: "Test Subject",
        content: "Test content",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Failed to send emails to any recipients");
      expect(data.sentCount).toBe(0);
      expect(data.failedRecipients).toEqual([
        "test1@example.com",
        "test2@example.com",
      ]);
    });

    it("should return 207 when some emails fail to send", async () => {
      mockSendMail
        .mockResolvedValueOnce({ messageId: "success-1" })
        .mockRejectedValueOnce(new Error("SMTP send failed"))
        .mockResolvedValueOnce({ messageId: "success-2" });

      const request = createMockRequest({
        recipients: [
          "success1@example.com",
          "fail@example.com",
          "success2@example.com",
        ],
        subject: "Test Subject",
        content: "Test content",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(207);
      expect(data.success).toBe(true);
      expect(data.sentCount).toBe(2);
      expect(data.failedRecipients).toEqual(["fail@example.com"]);
      expect(data.error).toContain("Partially successful");
    });

    it("should return 400 for invalid JSON", async () => {
      const request = new NextRequest("http://localhost:3000/api/send-email", {
        method: "POST",
        body: "invalid json",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid JSON in request body");
    });

    it("should handle unexpected errors gracefully", async () => {
      // Mock an unexpected error during JSON parsing
      const request = new NextRequest("http://localhost:3000/api/send-email", {
        method: "POST",
        body: '{"recipients": ["test@example.com"], "subject": "Test", "content": "Test"}',
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Mock JSON parsing to throw an error
      vi.spyOn(request, "json").mockRejectedValue(
        new Error("Unexpected error")
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe(
        "Internal server error occurred while sending emails"
      );
    });
  });

  describe("Edge Cases", () => {
    it("should trim whitespace from email addresses", async () => {
      const request = createMockRequest({
        recipients: ["  test@example.com  ", " user@domain.com "],
        subject: "Test Subject",
        content: "Test content",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "test@example.com",
        })
      );
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "user@domain.com",
        })
      );
    });

    it("should handle empty content after sanitization", async () => {
      const request = createMockRequest({
        recipients: ["test@example.com"],
        subject: "Test Subject",
        content: "<script>alert('only script')</script>",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Content is required");
    });

    it("should handle recipients array with non-string values", async () => {
      const request = createMockRequest({
        recipients: [
          "test@example.com",
          null,
          undefined,
          123,
          "valid@example.com",
        ],
        subject: "Test Subject",
        content: "Test content",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Invalid email addresses");
    });
  });
});
