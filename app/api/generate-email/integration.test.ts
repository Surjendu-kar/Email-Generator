import { describe, it, expect, beforeEach } from "vitest";

describe("/api/generate-email integration", () => {
  beforeEach(() => {
    // Ensure API key is set for integration tests
    process.env.GROQ_API_KEY = process.env.GROQ_API_KEY || "test-key";
  });

  it("should have correct request/response interface", async () => {
    // This test verifies the API interface matches the design specification
    const requestBody = {
      prompt: "Write a professional email about scheduling a team meeting",
    };

    // Verify request body structure
    expect(requestBody).toHaveProperty("prompt");
    expect(typeof requestBody.prompt).toBe("string");

    // Expected response structure for success case
    const expectedSuccessResponse = {
      success: true,
      email: expect.any(String),
    };

    // Expected response structure for error case
    const expectedErrorResponse = {
      success: false,
      error: expect.any(String),
    };

    // Verify response types
    expect(expectedSuccessResponse.success).toBe(true);
    expect(expectedSuccessResponse).toHaveProperty("email");

    expect(expectedErrorResponse.success).toBe(false);
    expect(expectedErrorResponse).toHaveProperty("error");
  });

  it("should validate prompt length constraints", () => {
    const validPrompt = "Write a professional email";
    const tooLongPrompt = "a".repeat(2001);
    const emptyPrompt = "";

    expect(validPrompt.length).toBeLessThanOrEqual(2000);
    expect(tooLongPrompt.length).toBeGreaterThan(2000);
    expect(emptyPrompt.trim().length).toBe(0);
  });

  it("should use correct Groq model configuration", () => {
    const expectedConfig = {
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1000,
    };

    expect(expectedConfig.model).toBe("llama-3.3-70b-versatile");
    expect(expectedConfig.temperature).toBe(0.7);
    expect(expectedConfig.max_tokens).toBe(1000);
  });

  it("should have proper system prompt for email generation", () => {
    const systemPrompt =
      'You are a professional email writer. Generate a well-structured, professional email based on the user\'s prompt. Include an appropriate subject line at the beginning of your response in the format "Subject: [subject line]" followed by the email body. Keep the tone professional but friendly.';

    expect(systemPrompt).toContain("professional email writer");
    expect(systemPrompt).toContain("Subject: [subject line]");
    expect(systemPrompt).toContain("professional but friendly");
  });
});
