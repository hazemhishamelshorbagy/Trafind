/**
 * What: Runs a data-repair task on an interval and guards against overlap.
 * Why: Provides recurring maintenance while supporting graceful in-progress shutdown.
 */
interface SchedulerOptions {
    intervalMs: number;
    task: () => Promise<void>;
}
export declare function startDataRepairScheduler({ intervalMs, task }: SchedulerOptions): () => Promise<void>;
export {};
