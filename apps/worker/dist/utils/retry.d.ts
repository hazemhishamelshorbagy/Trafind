/**
 * What: Retries a failing asynchronous operation with increasing delays.
 * Why: Tolerates temporary database or network failures and then rethrows final errors.
 */
interface RetryOptions {
    retries?: number;
    delay?: number;
    shouldRetry?: (error: unknown) => boolean;
}
export declare function retry<T>(operation: () => Promise<T>, options?: RetryOptions): Promise<T>;
export {};
