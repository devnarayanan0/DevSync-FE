import cron, { ScheduledTask } from 'node-cron';
import { getDb } from './DatabaseService';
import { SyncService } from './SyncService';

export class SyncSchedulerService {
  private static scheduledJobs = new Map<string, ScheduledTask>();

  static initSchedules() {
    console.log('[SyncSchedulerService] Initializing scheduled synchronization pipelines...');
    try {
      const db = getDb();
      const requests = db.prepare('SELECT id, name, schedule, status FROM sync_requests').all() as any[];

      this.clearAllSchedules();

      for (const req of requests) {
        if (req.status !== 'paused' && req.status !== 'failed') {
          this.scheduleRequest(req);
        }
      }
    } catch (err) {
      console.error('[SyncSchedulerService] Failed to initialize schedules:', err);
    }
  }

  static scheduleRequest(req: any) {
    if (this.scheduledJobs.has(req.id)) {
      this.unscheduleRequest(req.id);
    }

    const cronExp = this.getCronExpression(req.schedule);
    if (!cronExp) {
      console.log(`[SyncSchedulerService] Request [${req.name}] has manual/no schedule configured: ${req.schedule}`);
      return;
    }

    console.log(`[SyncSchedulerService] Scheduling pipeline [${req.name}] with schedule: "${req.schedule}" (${cronExp})`);

    try {
      const job = cron.schedule(cronExp, async () => {
        console.log(`[SyncSchedulerService] Scheduled trigger fired for: [${req.name}]`);
        await SyncService.runSync(req.id);
      });

      this.scheduledJobs.set(req.id, job);
    } catch (err) {
      console.error(`[SyncSchedulerService] Failed to schedule pipeline [${req.name}]:`, err);
    }
  }

  static unscheduleRequest(requestId: string) {
    const job = this.scheduledJobs.get(requestId);
    if (job) {
      job.stop();
      this.scheduledJobs.delete(requestId);
      console.log(`[SyncSchedulerService] Cancelled scheduled job for pipeline: ${requestId}`);
    }
  }

  static clearAllSchedules() {
    for (const [id, job] of this.scheduledJobs.entries()) {
      job.stop();
    }
    this.scheduledJobs.clear();
    console.log('[SyncSchedulerService] Cleared all scheduled cron instances.');
  }

  // Convert human-readable client settings schedule into cron syntax
  private static getCronExpression(scheduleStr: string): string | null {
    if (!scheduleStr) return null;

    const lower = scheduleStr.toLowerCase();

    if (lower.includes('30 minutes')) {
      return '*/30 * * * *';
    }
    if (lower.includes('6 hours')) {
      return '0 */6 * * *';
    }
    if (lower.includes('12 hours')) {
      return '0 */12 * * *';
    }
    if (lower.includes('daily') && lower.includes('02:00 am')) {
      return '0 2 * * *';
    }
    if (lower.includes('weekly') || lower.includes('sunday')) {
      return '0 0 * * 0';
    }

    // Default matching for general formats
    if (lower.includes('every hour')) {
      return '0 * * * *';
    }

    return null;
  }
}
