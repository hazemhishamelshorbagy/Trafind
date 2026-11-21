/**
 * What: Runs a data-repair task on an interval and guards against overlap.
 * Why: Provides recurring maintenance while supporting graceful in-progress shutdown.
 */
interface SchedulerOptions {
  intervalMs: number;
  task: () => Promise<void>;
}

export function startDataRepairScheduler({
  intervalMs,
  task
}: SchedulerOptions) {
  let isRunning = false;
  let isStopping = false;
  let currentTask: Promise<void> | undefined;

  async function execute() {
    if (isStopping) {
      return;
    }

    if (isRunning) {
      console.log("Previous repair is still running. Skipping...");
      return;
    }

    isRunning = true;

    currentTask = (async () => {
      try {
        console.log("Data repair scheduler started a new cycle.");
        await task();
      } catch (error) {
        console.error("Data repair scheduler failed:", error);
      } finally {
        isRunning = false;
        currentTask = undefined;
      }
    })();

    await currentTask;
  }

  void execute();

  const timer = setInterval(() => {
    void execute();
  }, intervalMs);

  return async function stop(): Promise<void> {
    if (isStopping) {
      await currentTask;
      return;
    }

    isStopping = true;

    clearInterval(timer);

    console.log("Data repair scheduler stopping...");

    if (currentTask) {
      console.log("Waiting for the current repair to finish...");
      await currentTask;
    }

    console.log("Data repair scheduler stopped.");
  };
}