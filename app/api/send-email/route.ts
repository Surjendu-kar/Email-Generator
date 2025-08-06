import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { EmailSendRequest, EmailSendResponse } from "@/types";

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Create nodemailer transporter with support for real email services
const createTransporter = async () => {
  // Check if real email service is configured
  const emailService = process.env.EMAIL_SERVICE; // 'gmail', 'sendgrid', 'smtp', or 'test'
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;

  // Gmail configuration
  if (emailService === "gmail" && emailUser && emailPass) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass, // Use App Password, not regular password
      },
    });
  }

  // SendGrid configuration
  if (emailService === "sendgrid" && process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      port: 587,
      secure: false,
      auth: {
        user: "apikey",
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  }

  // Custom SMTP configuration
  if (emailService === "smtp" && smtpHost && emailUser && emailPass) {
    return nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort || "587"),
      secure: smtpPort === "465", // true for 465, false for other ports
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  }

  // AWS SES configuration
  if (
    emailService === "ses" &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY
  ) {
    return nodemailer.createTransport({
      host: `email-smtp.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com`,
      port: 587,
      secure: false,
      auth: {
        user: process.env.AWS_ACCESS_KEY_ID,
        pass: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  // Fallback to test/development mode
  console.warn("No real email service configured. Using test mode.");
  console.warn(
    "To send real emails, configure EMAIL_SERVICE environment variable."
  );

  try {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (error) {
    // Final fallback to mock transporter
    console.warn("Could not create test account, using mock transporter");
    return {
      verify: async () => true,
      sendMail: async (mailOptions: any) => {
        console.log("Mock email sent:", {
          from: mailOptions.from,
          to: mailOptions.to,
          subject: mailOptions.subject,
          text: mailOptions.text,
        });
        return { messageId: `mock-${Date.now()}` };
      },
    };
  }
};

/**
 * Validates email addresses
 */
function validateEmails(emails: string[]): {
  valid: string[];
  invalid: string[];
} {
  const valid: string[] = [];
  const invalid: string[] = [];

  emails.forEach((email) => {
    // Handle non-string values
    if (typeof email !== "string") {
      invalid.push(String(email));
      return;
    }

    const trimmedEmail = email.trim();
    if (EMAIL_REGEX.test(trimmedEmail)) {
      valid.push(trimmedEmail);
    } else {
      invalid.push(trimmedEmail);
    }
  });

  return { valid, invalid };
}

/**
 * Sanitizes email content to prevent injection
 */
function sanitizeContent(content: string): string {
  // Basic sanitization - remove potentially dangerous content
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: EmailSendRequest = await request.json();
    const { recipients, subject, content } = body;

    // Validate required fields
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Recipients are required and must be a non-empty array",
        } as EmailSendResponse,
        { status: 400 }
      );
    }

    if (
      !subject ||
      typeof subject !== "string" ||
      subject.trim().length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Subject is required and must be a non-empty string",
        } as EmailSendResponse,
        { status: 400 }
      );
    }

    if (
      !content ||
      typeof content !== "string" ||
      content.trim().length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Content is required and must be a non-empty string",
        } as EmailSendResponse,
        { status: 400 }
      );
    }

    // Validate email addresses
    const { valid: validEmails, invalid: invalidEmails } =
      validateEmails(recipients);

    if (invalidEmails.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid email addresses: ${invalidEmails.join(", ")}`,
          failedRecipients: invalidEmails,
        } as EmailSendResponse,
        { status: 400 }
      );
    }

    if (validEmails.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid email addresses provided",
        } as EmailSendResponse,
        { status: 400 }
      );
    }

    // Sanitize content
    const sanitizedSubject = sanitizeContent(subject);
    const sanitizedContent = sanitizeContent(content);

    // Validate content after sanitization
    if (sanitizedSubject.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Subject is required and must be a non-empty string",
        } as EmailSendResponse,
        { status: 400 }
      );
    }

    if (sanitizedContent.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Content is required and must be a non-empty string",
        } as EmailSendResponse,
        { status: 400 }
      );
    }

    // Create transporter
    const transporter = await createTransporter();

    // Verify transporter configuration
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error("Email transporter verification failed:", verifyError);
      return NextResponse.json(
        {
          success: false,
          error: "Email service configuration error",
        } as EmailSendResponse,
        { status: 500 }
      );
    }

    // Send emails to all recipients
    const failedRecipients: string[] = [];
    let sentCount = 0;

    for (const recipient of validEmails) {
      try {
        const senderEmail =
          process.env.SENDER_EMAIL ||
          process.env.EMAIL_USER ||
          '"AI Email Sender" <noreply@example.com>';
        const senderName = process.env.SENDER_NAME || "AI Email Sender";

        const result = await transporter.sendMail({
          from: `"${senderName}" <${senderEmail}>`,
          to: recipient,
          subject: sanitizedSubject,
          text: sanitizedContent,
          html: sanitizedContent.replace(/\n/g, "<br>"),
        });

        // Log the preview URL for test emails
        if (
          result.messageId &&
          typeof result.messageId === "string" &&
          result.messageId.includes("ethereal")
        ) {
          console.log(`Preview URL: ${nodemailer.getTestMessageUrl(result)}`);
          console.log(
            `Note: This is a test email. To send real emails, configure EMAIL_SERVICE in .env.local`
          );
        }

        sentCount++;
      } catch (sendError) {
        console.error(`Failed to send email to ${recipient}:`, sendError);
        failedRecipients.push(recipient);
      }
    }

    // Determine response based on results
    if (sentCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to send emails to any recipients",
          failedRecipients,
          sentCount: 0,
        } as EmailSendResponse,
        { status: 500 }
      );
    }

    if (failedRecipients.length > 0) {
      return NextResponse.json(
        {
          success: true,
          sentCount,
          failedRecipients,
          error: `Partially successful: failed to send to ${failedRecipients.length} recipients`,
        } as EmailSendResponse,
        { status: 207 } // Multi-status
      );
    }

    // Complete success
    return NextResponse.json({
      success: true,
      sentCount,
    } as EmailSendResponse);
  } catch (error) {
    console.error("Error sending emails:", error);

    // Handle specific errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON in request body",
        } as EmailSendResponse,
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error occurred while sending emails",
      } as EmailSendResponse,
      { status: 500 }
    );
  }
}
