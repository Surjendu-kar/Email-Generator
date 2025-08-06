import { describe, it, expect } from "vitest";
import {
  validateEmailFormat,
  validateEmailList,
  sanitizeInput,
  sanitizeEmail,
  sanitizePrompt,
  sanitizeEmailContent,
  EMAIL_VALIDATION,
  PROMPT_VALIDATION,
  CONTENT_VALIDATION,
} from "./validation";

describe("validateEmailFormat", () => {
  it("should validate correct email addresses", () => {
    const validEmails = [
      "test@example.com",
      "user.name@domain.co.uk",
      "user+tag@example.org",
      "firstname.lastname@company.com",
      "email@123.123.123.123", // IP address (technically valid)
      "user_name@example-domain.com",
    ];

    validEmails.forEach((email) => {
      const result = validateEmailFormat(email);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should reject invalid email addresses", () => {
    const invalidEmails = [
      "invalid-email",
      "@example.com",
      "user@",
      "user..name@example.com",
      "user@.com",
      "user@com",
      ".user@example.com",
      "user@example.",
      "user name@example.com", // space in local part
      "user@ex ample.com", // space in domain
      "",
    ];

    invalidEmails.forEach((email) => {
      const result = validateEmailFormat(email);

      expect(result.isValid, `Email "${email}" should be invalid`).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  it("should handle null and undefined inputs", () => {
    expect(validateEmailFormat(null as any).isValid).toBe(false);
    expect(validateEmailFormat(undefined as any).isValid).toBe(false);
    expect(validateEmailFormat("").isValid).toBe(false);
  });

  it("should reject emails that are too long", () => {
    const longEmail = "a".repeat(250) + "@example.com";
    const result = validateEmailFormat(longEmail);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("too long");
  });

  it("should trim whitespace from emails", () => {
    const result = validateEmailFormat("  test@example.com  ");
    expect(result.isValid).toBe(true);
  });
});

describe("validateEmailList", () => {
  it("should validate a list of valid emails", () => {
    const emails = [
      "test1@example.com",
      "test2@example.com",
      "test3@example.com",
    ];
    const results = validateEmailList(emails);

    expect(results).toHaveLength(3);
    results.forEach((result) => {
      expect(result.isValid).toBe(true);
    });
  });

  it("should reject empty email list", () => {
    const results = validateEmailList([]);
    expect(results).toHaveLength(1);
    expect(results[0].isValid).toBe(false);
    expect(results[0].error).toContain("At least one email");
  });

  it("should reject non-array input", () => {
    const results = validateEmailList("not-an-array" as any);
    expect(results).toHaveLength(1);
    expect(results[0].isValid).toBe(false);
    expect(results[0].error).toContain("Invalid email list format");
  });

  it("should reject too many recipients", () => {
    const manyEmails = Array.from(
      { length: EMAIL_VALIDATION.MAX_RECIPIENTS + 1 },
      (_, i) => `test${i}@example.com`
    );
    const results = validateEmailList(manyEmails);

    expect(results).toHaveLength(1);
    expect(results[0].isValid).toBe(false);
    expect(results[0].error).toContain("Maximum");
  });

  it("should detect duplicate emails", () => {
    const emails = [
      "test@example.com",
      "test@example.com",
      "other@example.com",
    ];
    const results = validateEmailList(emails);

    expect(results).toHaveLength(1);
    expect(results[0].isValid).toBe(false);
    expect(results[0].error).toContain("Duplicate");
  });

  it("should detect case-insensitive duplicates", () => {
    const emails = ["Test@Example.com", "test@example.com"];
    const results = validateEmailList(emails);

    expect(results).toHaveLength(1);
    expect(results[0].isValid).toBe(false);
    expect(results[0].error).toContain("Duplicate");
  });

  it("should return individual validation results for mixed valid/invalid emails", () => {
    const emails = [
      "valid@example.com",
      "invalid-email",
      "another@example.com",
    ];
    const results = validateEmailList(emails);

    expect(results).toHaveLength(3);
    expect(results[0].isValid).toBe(true);
    expect(results[1].isValid).toBe(false);
    expect(results[2].isValid).toBe(true);
  });
});

describe("sanitizeInput", () => {
  it("should remove null bytes", () => {
    const input = "test\0string";
    const result = sanitizeInput(input);
    expect(result).toBe("test string");
  });

  it("should remove control characters except newlines and tabs", () => {
    const input = "test\x01\x02string\n\ttab";
    const result = sanitizeInput(input);
    expect(result).toBe("teststring\n\ttab");
  });

  it("should limit consecutive whitespace", () => {
    const input = "test    multiple   spaces";
    const result = sanitizeInput(input);
    expect(result).toBe("test multiple spaces");
  });

  it("should trim leading and trailing whitespace", () => {
    const input = "   test string   ";
    const result = sanitizeInput(input);
    expect(result).toBe("test string");
  });

  it("should handle null and undefined inputs", () => {
    expect(sanitizeInput(null as any)).toBe("");
    expect(sanitizeInput(undefined as any)).toBe("");
    expect(sanitizeInput("")).toBe("");
  });

  it("should handle non-string inputs", () => {
    expect(sanitizeInput(123 as any)).toBe("");
    expect(sanitizeInput({} as any)).toBe("");
  });
});

describe("sanitizeEmail", () => {
  it("should convert to lowercase", () => {
    const result = sanitizeEmail("Test@Example.COM");
    expect(result).toBe("test@example.com");
  });

  it("should remove invalid characters", () => {
    const result = sanitizeEmail("test<>@exam!ple.com");
    expect(result).toBe("test@example.com");
  });

  it("should remove multiple consecutive dots", () => {
    const result = sanitizeEmail("test@example...com");
    expect(result).toBe("test@example.com");
  });

  it("should remove leading and trailing dots", () => {
    const result = sanitizeEmail(".test@example.com.");
    expect(result).toBe("test@example.com");
  });

  it("should handle null and undefined inputs", () => {
    expect(sanitizeEmail(null as any)).toBe("");
    expect(sanitizeEmail(undefined as any)).toBe("");
  });

  it("should trim whitespace", () => {
    const result = sanitizeEmail("  test@example.com  ");
    expect(result).toBe("test@example.com");
  });
});

describe("sanitizePrompt", () => {
  it("should sanitize basic input", () => {
    const input = "  Write an email about meeting!!!???  ";
    const result = sanitizePrompt(input);
    expect(result).toBe("Write an email about meeting!!");
  });

  it("should limit excessive punctuation", () => {
    const input = "Help me write an email!!!!!????";
    const result = sanitizePrompt(input);
    expect(result).toBe("Help me write an email!!");
  });

  it("should limit length to maximum", () => {
    const longInput = "a".repeat(PROMPT_VALIDATION.MAX_LENGTH + 100);
    const result = sanitizePrompt(longInput);
    expect(result.length).toBe(PROMPT_VALIDATION.MAX_LENGTH);
  });

  it("should handle null and undefined inputs", () => {
    expect(sanitizePrompt(null as any)).toBe("");
    expect(sanitizePrompt(undefined as any)).toBe("");
  });

  it("should preserve normal punctuation", () => {
    const input = "Write an email about the meeting. Make it professional!";
    const result = sanitizePrompt(input);
    expect(result).toBe(
      "Write an email about the meeting. Make it professional!"
    );
  });
});

describe("sanitizeEmailContent", () => {
  it("should normalize line breaks", () => {
    const input = "Line 1\r\nLine 2\rLine 3\nLine 4";
    const result = sanitizeEmailContent(input);
    expect(result).toBe("Line 1\nLine 2\nLine 3\nLine 4");
  });

  it("should limit length to maximum", () => {
    const longInput = "a".repeat(CONTENT_VALIDATION.MAX_LENGTH + 100);
    const result = sanitizeEmailContent(longInput);
    expect(result.length).toBe(CONTENT_VALIDATION.MAX_LENGTH);
  });

  it("should handle null and undefined inputs", () => {
    expect(sanitizeEmailContent(null as any)).toBe("");
    expect(sanitizeEmailContent(undefined as any)).toBe("");
  });

  it("should preserve formatting while sanitizing", () => {
    const input =
      "Dear John,\n\nThis is a test email.\n\nBest regards,\nSender";
    const result = sanitizeEmailContent(input);
    expect(result).toBe(
      "Dear John,\n\nThis is a test email.\n\nBest regards,\nSender"
    );
  });

  it("should remove control characters but preserve newlines", () => {
    const input = "Test\x01content\nwith\x02newlines";
    const result = sanitizeEmailContent(input);
    expect(result).toBe("Testcontent\nwithnewlines");
  });
});
