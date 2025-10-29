import validator from 'validator'
import disposableDomains from 'disposable-email-domains'

export interface EmailValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Validates an email address with comprehensive checks including:
 * - RFC 5322 format validation
 * - Disposable email domain blocking
 * - Additional security checks
 */
export function validateEmail(email: string): EmailValidationResult {
  // Trim and lowercase the email
  const normalizedEmail = email.trim().toLowerCase()

  // Check if email is empty
  if (!normalizedEmail) {
    return {
      isValid: false,
      error: 'Email is required',
    }
  }

  // Validate email format using validator.js (RFC 5322)
  if (!validator.isEmail(normalizedEmail, {
    allow_utf8_local_part: false, // Only ASCII characters in local part
    require_tld: true, // Must have top-level domain
    allow_ip_domain: false, // Don't allow IP addresses as domain
  })) {
    return {
      isValid: false,
      error: 'Invalid email format',
    }
  }

  // Extract domain from email
  const domain = normalizedEmail.split('@')[1]

  // Check against disposable email domains
  if (disposableDomains.includes(domain)) {
    return {
      isValid: false,
      error: 'Disposable email addresses are not allowed',
    }
  }

  // Additional security checks

  // Block emails with multiple @ symbols (already caught by validator, but double-check)
  if ((normalizedEmail.match(/@/g) || []).length !== 1) {
    return {
      isValid: false,
      error: 'Invalid email format',
    }
  }

  // Block emails with suspicious patterns (e.g., too many dots)
  const localPart = normalizedEmail.split('@')[0]
  if (localPart.includes('..')) {
    return {
      isValid: false,
      error: 'Invalid email format',
    }
  }

  // Email passed all validation checks
  return {
    isValid: true,
  }
}

/**
 * Generates a secure random token for email verification
 * @param length - Length of the token (default: 32)
 * @returns A URL-safe random token
 */
export function generateVerificationToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  const randomValues = new Uint8Array(length)

  // Use crypto for secure random generation
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomValues)
  } else {
    // Fallback for Node.js environments
    const nodeCrypto = require('crypto')
    nodeCrypto.randomFillSync(randomValues)
  }

  for (let i = 0; i < length; i++) {
    token += chars[randomValues[i] % chars.length]
  }

  return token
}

/**
 * Validates a verification token format
 */
export function isValidVerificationToken(token: string): boolean {
  return /^[A-Za-z0-9]{32,}$/.test(token)
}
