/**
 * What: Retries a failing asynchronous operation with increasing delays.
 * Why: Tolerates temporary database or network failures and then rethrows final errors.
 */


interface RetryOptions {
  retries?: number;
  delay?: number;
  shouldRetry?: (error: unknown) => boolean;
}

export async function retry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    retries = 2,
    delay = 1000,
    shouldRetry = () => true
  } = options;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === retries || !shouldRetry(error)) {
        throw error;
      }

      const waitTime = delay * (attempt + 1);

      console.warn(
        `Attempt ${attempt + 1} failed. Retrying in ${waitTime}ms...`
      );

      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw new Error("Retry operation failed unexpectedly");
}