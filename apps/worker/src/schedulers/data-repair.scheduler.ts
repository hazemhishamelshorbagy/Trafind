/**
 * What: Runs recurring worker tasks with overlap protection.
 * Why: Prevents concurrent executions and supports graceful shutdown.
 */

interface SchedulerOptions {
  intervalMs: number;
  task: () => Promise<void>;
}

export function startDataRepairScheduler({
  intervalMs,
  task
}: SchedulerOptions): () => Promise<void> {
  if (!Number.isFinite(intervalMs) || intervalMs <= 0) {
    throw new Error("Scheduler interval must be a positive number");
  }

  let isRunning = false;
  let isStopping = false;

  let currentTask: Promise<void> | undefined;
  let stopPromise: Promise<void> | undefined;

  async function execute(): Promise<void> {
    if (isStopping) {
      return;
    }

    if (isRunning) {
      console.log("[Worker Scheduler] Previous cycle is still running. Skipping...");
      return;
    }

    isRunning = true;

    const taskPromise = (async () => {
      try {
        console.log("[Worker Scheduler] Starting a new cycle.");

        await task();

        console.log("[Worker Scheduler] Cycle completed successfully.");
      } catch (error) {
        console.error("[Worker Scheduler] Cycle failed:", error);
      } finally {
        isRunning = false;
        currentTask = undefined;
      }
    })();

    currentTask = taskPromise;

    await taskPromise;
  }

  // Run the first cycle immediately.
  void execute();

  // Schedule subsequent cycles.
  const timer = setInterval(() => {
    void execute();
  }, intervalMs);

  async function stop(): Promise<void> {
    if (stopPromise) {
      return stopPromise;
    }

    isStopping = true;

    clearInterval(timer);

    console.log("[Worker Scheduler] Stopping...");

    stopPromise = (async () => {
      if (currentTask) {
        console.log("[Worker Scheduler] Waiting for current cycle...");

        await currentTask;
      }

      console.log("[Worker Scheduler] Stopped.");
    })();

    return stopPromise;
  }

  return stop;
}