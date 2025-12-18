import { PublicKey } from '@solana/web3.js';

/**
 * Validates if a string is a valid Solana wallet address
 */
export function isValidSolanaAddress(address: string | null | undefined): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }

  // Basic length check (Solana addresses are 32-44 characters in base58)
  if (address.length < 32 || address.length > 44) {
    return false;
  }

  // Check for valid base58 characters
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
  if (!base58Regex.test(address)) {
    return false;
  }

  try {
    // Try to create a PublicKey - this validates the address format
    const pubkey = new PublicKey(address);
    // Check if it's on the ed25519 curve (valid Solana address)
    return PublicKey.isOnCurve(pubkey.toBytes());
  } catch {
    return false;
  }
}

/**
 * Validates and sanitizes a wallet address
 * Returns null if invalid, trimmed address if valid
 */
export function sanitizeWalletAddress(address: string | null | undefined): string | null {
  if (!address) {
    return null;
  }

  const trimmed = address.trim();

  if (!isValidSolanaAddress(trimmed)) {
    return null;
  }

  return trimmed;
}

/**
 * Validates pagination parameters
 */
export function validatePagination(
  limit: string | null | undefined,
  offset: string | null | undefined
): { limit: number; offset: number } {
  const DEFAULT_LIMIT = 20;
  const MAX_LIMIT = 500;
  const MIN_LIMIT = 1;

  let parsedLimit = parseInt(limit || String(DEFAULT_LIMIT), 10);
  let parsedOffset = parseInt(offset || '0', 10);

  // Validate limit
  if (isNaN(parsedLimit) || parsedLimit < MIN_LIMIT) {
    parsedLimit = DEFAULT_LIMIT;
  } else if (parsedLimit > MAX_LIMIT) {
    parsedLimit = MAX_LIMIT;
  }

  // Validate offset
  if (isNaN(parsedOffset) || parsedOffset < 0) {
    parsedOffset = 0;
  }

  return { limit: parsedLimit, offset: parsedOffset };
}

/**
 * Validates sort parameters
 */
export function validateSortParams(
  sortBy: string | null | undefined,
  direction: string | null | undefined,
  allowedFields: string[] = ['marketCap', 'price', 'volume', 'change24h']
): { sortBy: string; direction: 'asc' | 'desc' } {
  const DEFAULT_SORT = 'marketCap';
  const DEFAULT_DIRECTION = 'desc';

  let validSortBy = DEFAULT_SORT;
  let validDirection: 'asc' | 'desc' = DEFAULT_DIRECTION;

  if (sortBy && allowedFields.includes(sortBy)) {
    validSortBy = sortBy;
  }

  if (direction === 'asc' || direction === 'desc') {
    validDirection = direction;
  }

  return { sortBy: validSortBy, direction: validDirection };
}

/**
 * Sanitizes search input to prevent injection
 */
export function sanitizeSearchInput(search: string | null | undefined): string {
  if (!search || typeof search !== 'string') {
    return '';
  }

  // Remove potentially dangerous characters, keep alphanumeric and common symbols
  return search
    .trim()
    .slice(0, 100) // Limit length
    .replace(/[<>\"'`;\\]/g, ''); // Remove dangerous characters
}

/**
 * Validates alert condition type
 */
export function validateAlertCondition(condition: string | null | undefined): 'above' | 'below' | null {
  if (condition === 'above' || condition === 'below') {
    return condition;
  }
  return null;
}

/**
 * Validates price value
 */
export function validatePrice(price: number | string | null | undefined): number | null {
  if (price === null || price === undefined) {
    return null;
  }

  const parsed = typeof price === 'string' ? parseFloat(price) : price;

  if (isNaN(parsed) || parsed < 0 || !isFinite(parsed)) {
    return null;
  }

  return parsed;
}
