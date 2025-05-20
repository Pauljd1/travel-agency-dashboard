export const handleError = (error: unknown, context: string): string => {
  console.error(`Error in ${context}:`, error);

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
};

/**
 * Type guard to check if a value is not undefined or null
 */
export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}
