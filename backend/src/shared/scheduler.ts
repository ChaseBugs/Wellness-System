import { env } from "../config/env.js";
import type { ScheduledJob, WellnessModule } from "../modules/module.js";
import logger, { EMOJIS } from "../utils/logger.js";

/**
 * Runs every module's jobs on a fixed tick in this process. A job that is still running when the next
 * tick comes is skipped for that tick. With several server instances each would run the jobs, which is
 * safe because jobs are idempotent (they claim work in the database) but wasteful; run one instance
 * with SCHEDULER_ENABLED=true in that setup.
 */
export function startScheduler(modules: WellnessModule[]): () => void {
  const jobs = modules.flatMap((module) => (module.jobs ?? []).map((job) => ({ module: module.name, job })));
  if (!env.schedulerEnabled || jobs.length === 0) return () => undefined;

  const running = new Set<string>();
  const runJob = async (module: string, job: ScheduledJob) => {
    const key = `${module}:${job.name}`;
    if (running.has(key)) return;
    running.add(key);
    try {
      const result = await job.run(new Date());
      logger.debugWithEmoji(EMOJIS.NOTIFICATION, `Job ${key} finished`, "SCHEDULER", { result });
    } catch (error) {
      logger.errorWithEmoji(EMOJIS.ERROR, `Job ${key} failed`, "SCHEDULER", {
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      running.delete(key);
    }
  };
  const tick = () => jobs.forEach(({ module, job }) => void runJob(module, job));

  logger.infoWithEmoji(EMOJIS.STARTUP, "Scheduler started", "SCHEDULER", {
    intervalSeconds: env.schedulerIntervalSeconds,
    jobs: jobs.map(({ module, job }) => `${module}:${job.name}`)
  });
  const timer = setInterval(tick, env.schedulerIntervalSeconds * 1000);
  timer.unref();
  return () => clearInterval(timer);
}
