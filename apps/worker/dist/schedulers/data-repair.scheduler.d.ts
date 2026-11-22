/**
 * What: Runs recurring worker tasks with overlap protection.
 * Why: Prevents concurrent executions and supports graceful shutdown.
 */
interface SchedulerOptions {
    intervalMs: number;
    task: () => Promise<void>;
}
export declare function startDataRepairScheduler({ intervalMs, task }: SchedulerOptions): () => Promise<void>;
export {};
