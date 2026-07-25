/**
 * Utility functions for ID conversion and validation
 */

/**
 * Converts ID to string, handling both string and number types
 */
export function idToString(id: string | number | undefined | null): string {
  if (id === undefined || id === null) {
    return '';
  }
  return String(id);
}

/**
 * Converts ID to number, handling both string and number types
 */
export function idToNumber(id: string | number | undefined | null): number | null {
  if (id === undefined || id === null) {
    return null;
  }
  const num = typeof id === 'string' ? parseInt(id, 10) : id;
  return isNaN(num) ? null : num;
}

/**
 * Checks if ID is a valid number (not temporary ID like "program-123")
 */
export function isValidId(id: string | number | undefined | null): boolean {
  if (id === undefined || id === null) {
    return false;
  }
  const idStr = String(id);
  return !idStr.startsWith('program-') && !idStr.startsWith('business-') && !isNaN(Number(idStr));
}

/**
 * Normalizes ID for comparison (converts to string)
 */
export function normalizeId(id: string | number | undefined | null): string {
  return idToString(id);
}
