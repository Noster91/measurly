import { createHash } from 'node:crypto'

/**
 * Hash a value using SHA-256 for PII-safe server-side transmission.
 */
export function hashPII(value: string): string {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex')
}

/**
 * Hash an email address (normalizes before hashing).
 */
export function hashEmail(email: string): string {
  return hashPII(email.trim().toLowerCase())
}

/**
 * Hash a phone number (strips non-digit characters before hashing).
 */
export function hashPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  return hashPII(digits)
}
