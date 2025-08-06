# Email Setup Guide

The AI Email Sender currently uses a test email service by default. To send real emails, you need to configure a real email service.

## Current Status

- ✅ Test emails work (shows "successfully sent" but doesn't deliver real emails)
- ❌ Real email delivery not configured

## Quick Setup Options

### Option 1: Gmail (Easiest for Testing)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. **Update your `.env.local` file**:
   ```bash
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-character-app-password
   SENDER_EMAIL=your-email@gmail.com
   SENDER_NAME=Your Name
   ```

### Option 2: SendGrid (Recommended for Production)

1. **Create a SendGrid account** at https://sendgrid.com
2. **Get your API key** from the SendGrid dashboard
3. **Verify your sender email** in SendGrid
4. **Update your `.env.local` file**:
   ```bash
   EMAIL_SERVICE=sendgrid
   SENDGRID_API_KEY=your-sendgrid-api-key
   SENDER_EMAIL=your-verified-sender@yourdomain.com
   SENDER_NAME=Your Name
   ```

### Option 3: Custom SMTP

If you have your own email server or another SMTP service:

```bash
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASS=your-password
SENDER_EMAIL=your-email@yourdomain.com
SENDER_NAME=Your Name
```

### Option 4: AWS SES (For Production)

1. **Set up AWS SES** and verify your domain/email
2. **Get your AWS credentials**
3. **Update your `.env.local` file**:
   ```bash
   EMAIL_SERVICE=ses
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_REGION=us-east-1
   SENDER_EMAIL=your-verified-sender@yourdomain.com
   SENDER_NAME=Your Name
   ```

## Testing Your Setup

1. **Restart your development server** after updating `.env.local`
2. **Send a test email** through the application
3. **Check the console logs** for any error messages
4. **Check your email inbox** for the delivered email

## Troubleshooting

### Gmail Issues

- Make sure you're using an App Password, not your regular password
- Ensure 2-Factor Authentication is enabled
- Check that "Less secure app access" is not blocking the connection

### SendGrid Issues

- Verify your sender email address in SendGrid dashboard
- Check your API key permissions
- Ensure you're not in sandbox mode (if you want to send to unverified emails)

### General Issues

- Check the server console for detailed error messages
- Verify all environment variables are set correctly
- Make sure there are no typos in email addresses
- Check your email spam folder

## Current Configuration

Your current `.env.local` file should look like this (with your actual values):

```bash
# Groq AI API Configuration
GROQ_API_KEY=your-groq-api-key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email Service Configuration
EMAIL_SERVICE=gmail  # or sendgrid, smtp, ses
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
SENDER_EMAIL=your-email@gmail.com
SENDER_NAME=Your Name
```

## Security Notes

- Never commit your `.env.local` file to version control
- Use App Passwords for Gmail, not your regular password
- Keep your API keys secure
- Consider using environment-specific configurations for production

## Need Help?

If you're still having issues:

1. Check the server console for error messages
2. Verify your email service credentials
3. Test with a simple email first
4. Make sure your email service allows SMTP connections
