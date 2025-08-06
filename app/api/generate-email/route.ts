import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(request: NextRequest) {
  try {
    // Validate API key exists
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "Groq API key not configured",
        },
        { status: 500 }
      );
    }

  
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    // Parse request body
    const body = await request.json();
    const { prompt } = body;

    // Validate prompt input
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Prompt is required and must be a non-empty string",
        },
        { status: 400 }
      );
    }

    // Sanitize prompt (basic length limit)
    if (prompt.length > 2000) {
      return NextResponse.json(
        {
          success: false,
          error: "Prompt is too long. Maximum 2000 characters allowed.",
        },
        { status: 400 }
      );
    }

    // Generate email using Groq AI
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            'You are a professional email writer. Generate a well-structured, professional email based on the user\'s prompt. Include an appropriate subject line at the beginning of your response in the format "Subject: [subject line]" followed by the email body. Keep the tone professional but friendly.',
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1000,
    });

    const generatedContent = completion.choices[0]?.message?.content;

    if (!generatedContent) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to generate email content",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      email: generatedContent.trim(),
    });
  } catch (error) {
    console.error("Error generating email:", error);

    // Handle specific Groq API errors
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid API key configuration",
          },
          { status: 401 }
        );
      }

      if (error.message.includes("rate limit")) {
        return NextResponse.json(
          {
            success: false,
            error: "Rate limit exceeded. Please try again later.",
          },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error occurred while generating email",
      },
      { status: 500 }
    );
  }
}