import { Resend } from 'resend';
import { render } from '@react-email/render';
import VerificationEmail from '@/emails/VerificationEmail';
import WelcomeEmail from '@/emails/WelcomeEmail';
import PasswordResetEmail from '@/emails/PasswordResetEmail';
import EmailChangeNotification from '@/emails/EmailChangeNotification';
import EmailChangeVerification from '@/emails/EmailChangeVerification';
import { validateEmailConfig } from '@/lib/env';

// Validate email configuration at module load time
const emailConfig = validateEmailConfig();

// Initialize Resend client only if properly configured
const resend = emailConfig.isConfigured ? new Resend(emailConfig.apiKey!) : null;

// Email sender addresses
const NOREPLY_EMAIL = 'noreply@edgebook.ai';
const HELLO_EMAIL = 'hello@edgebook.ai';

/**
 * Send password reset email
 * Sender: noreply@edgebook.ai (transactional)
 */
export async function sendPasswordResetEmail(email: string, token: string, name?: string) {
  // Check if email service is configured
  if (!emailConfig.isConfigured || !resend) {
    console.error('Email service not configured:', emailConfig.error);
    return {
      success: false,
      error: 'Email service is not configured. Please contact support.',
    };
  }

  const resetUrl = `${emailConfig.baseUrl}/auth/reset-password?token=${token}`;

  try {
    const emailHtml = await render(
      PasswordResetEmail({
        userName: name || 'there',
        resetUrl,
      })
    );

    const { data, error } = await resend.emails.send({
      from: `EdgeBook <${NOREPLY_EMAIL}>`,
      to: email,
      subject: 'Reset Your Password - EdgeBook',
      html: emailHtml,
    });

    if (error) {
      console.error('Error sending password reset email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error };
  }
}

/**
 * Send welcome email (for OAuth users - no verification needed)
 * Sender: hello@edgebook.ai (user-facing)
 */
export async function sendWelcomeEmail(email: string, name: string) {
  // Check if email service is configured
  if (!emailConfig.isConfigured || !resend) {
    console.error('Email service not configured:', emailConfig.error);
    return {
      success: false,
      error: 'Email service is not configured. Please contact support.',
    };
  }

  try {
    const emailHtml = await render(
      WelcomeEmail({
        userName: name || 'there',
      })
    );

    const { data, error } = await resend.emails.send({
      from: `EdgeBook <${HELLO_EMAIL}>`,
      to: email,
      subject: 'Welcome to EdgeBook!',
      html: emailHtml,
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error };
  }
}

/**
 * Send verification email (for regular signups - includes welcome message)
 * Sender: noreply@edgebook.ai (transactional)
 */
export async function sendVerificationEmail(email: string, token: string, name?: string) {
  // Check if email service is configured
  if (!emailConfig.isConfigured || !resend) {
    console.error('Email service not configured:', emailConfig.error);
    return {
      success: false,
      error: 'Email service is not configured. Please contact support.',
    };
  }

  const verificationUrl = `${emailConfig.baseUrl}/auth/verify-email?token=${token}`;

  try {
    const emailHtml = await render(
      VerificationEmail({
        userName: name || 'there',
        verificationUrl,
      })
    );

    const { data, error } = await resend.emails.send({
      from: `EdgeBook <${NOREPLY_EMAIL}>`,
      to: email,
      subject: 'Welcome to EdgeBook! Please verify your email',
      html: emailHtml,
    });

    if (error) {
      console.error('Error sending verification email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error };
  }
}

/**
 * Send email change notification (to old email address)
 * Sender: noreply@edgebook.ai (transactional/security)
 */
export async function sendEmailChangeNotification(oldEmail: string, newEmail: string, name?: string) {
  // Check if email service is configured
  if (!emailConfig.isConfigured || !resend) {
    console.error('Email service not configured:', emailConfig.error);
    return {
      success: false,
      error: 'Email service is not configured. Please contact support.',
    };
  }

  try {
    const emailHtml = await render(
      EmailChangeNotification({
        userName: name || 'there',
        oldEmail,
        newEmail,
      })
    );

    const { data, error } = await resend.emails.send({
      from: `EdgeBook <${NOREPLY_EMAIL}>`,
      to: oldEmail,
      subject: 'Email Address Changed - EdgeBook',
      html: emailHtml,
    });

    if (error) {
      console.error('Error sending email change notification:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email change notification:', error);
    return { success: false, error };
  }
}

/**
 * Send email change confirmation (to new email address for verification)
 * Sender: noreply@edgebook.ai (transactional)
 */
export async function sendEmailChangeConfirmation(newEmail: string, token: string, name?: string) {
  // Check if email service is configured
  if (!emailConfig.isConfigured || !resend) {
    console.error('Email service not configured:', emailConfig.error);
    return {
      success: false,
      error: 'Email service is not configured. Please contact support.',
    };
  }

  const verificationUrl = `${emailConfig.baseUrl}/auth/verify-email?token=${token}`;

  try {
    const emailHtml = await render(
      EmailChangeVerification({
        userName: name || 'there',
        newEmail,
        verificationUrl,
      })
    );

    const { data, error } = await resend.emails.send({
      from: `EdgeBook <${NOREPLY_EMAIL}>`,
      to: newEmail,
      subject: 'Verify Your New Email Address - EdgeBook',
      html: emailHtml,
    });

    if (error) {
      console.error('Error sending email change confirmation:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email change confirmation:', error);
    return { success: false, error };
  }
}
