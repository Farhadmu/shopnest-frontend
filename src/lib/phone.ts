import { z } from "zod";

/**
 * Bangladeshi mobile number rules.
 *
 * Single source of truth shared by the registration form (client-side) and the
 * better-auth sign-up endpoint (server-side), so a request cannot bypass the
 * browser validation.
 *
 * Accepted operator prefixes are 013-019 followed by 8 subscriber digits.
 * Separators (spaces, dashes, dots, parentheses) and an optional `+880` / `880`
 * country code are tolerated, so all of these are valid:
 *
 *   01712345678
 *   017-1234-5678
 *   +8801712345678
 *   8801712345678
 *
 * Every accepted number is normalised to the national format (`01XXXXXXXXX`)
 * that the rest of ShopNest stores.
 */

export const PHONE_REQUIRED_MESSAGE = "Please enter your phone number.";
export const PHONE_INVALID_MESSAGE = "Please enter a valid Bangladeshi phone number.";

const BD_MOBILE_PATTERN = /^01[3-9]\d{8}$/;
const SEPARATORS = /[\s\-().]/g;

/**
 * Normalises a Bangladeshi mobile number to `01XXXXXXXXX`.
 * Returns `null` when the value is not a valid Bangladeshi mobile number.
 */
export function normalizeBdMobile(value: string): string | null {
  const compact = value.replace(SEPARATORS, "").replace(/^\+?880/, "0");
  return BD_MOBILE_PATTERN.test(compact) ? compact : null;
}

export function isValidBdMobile(value: string): boolean {
  return normalizeBdMobile(value) !== null;
}

/**
 * Validates a Bangladeshi mobile number and, on success, transforms it into the
 * normalised national format. Works as a Standard Schema, which is what
 * better-auth requires for `additionalFields.*.validator.input`.
 */
export const bdMobileSchema = z
  .string()
  .trim()
  .refine((value) => value.length > 0, { message: PHONE_REQUIRED_MESSAGE })
  .refine((value) => isValidBdMobile(value), { message: PHONE_INVALID_MESSAGE })
  .transform((value) => normalizeBdMobile(value) ?? value);

export type BdMobile = z.output<typeof bdMobileSchema>;

/**
 * Returns the user-facing validation message for a phone number,
 * or `null` when the number is valid.
 */
export function getBdMobileError(value: string): string | null {
  const result = bdMobileSchema.safeParse(value);
  if (result.success) return null;
  return result.error.issues[0]?.message ?? PHONE_INVALID_MESSAGE;
}
