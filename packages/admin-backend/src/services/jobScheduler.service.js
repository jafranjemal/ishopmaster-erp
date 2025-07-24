const Agenda = require("agenda");
const mongoose = require("mongoose");
const notificationService = require("./notification.service");
const { getTenantConnection, getTenantModels } = require("./database.service");

/**
 * The definitive JobSchedulerService. It uses Agenda to manage and execute
 * background jobs. It is now designed to be initialized *after* the database is connected.
 */
class JobSchedulerService {
  constructor() {
    // ✅ FIX: The constructor is now empty. It does NOT try to connect to the DB.
    this.agenda = null;
  }

  /**
   * ✅ NEW: An async initialize method. This is the new entry point.
   * This function should only be called once the Mongoose connection is ready.
   */
  async initialize() {
    // This check prevents the service from being initialized multiple times.
    if (this.agenda) {
      console.log("[JobScheduler] Already initialized.");
      return;
    }

    console.log("[JobScheduler] Initializing...");

    // This line is now safe because we know the connection is ready.
    this.agenda = new Agenda({
      mongo: mongoose.connection.client.db(),
      db: { collection: "agendaJobs" },
      processEvery: "1 minute",
    });

    this.defineJobs();
    await this.agenda.start();
    console.log("✅ Agenda job scheduler started successfully.");
  }

  /**
   * Defines all the jobs that the scheduler knows how to perform.
   */
  defineJobs() {
    if (!this.agenda) return;

    this.agenda.define("send-post-service-feedback", async (job) => {
      const { ticketId, tenantDbName } = job.attrs.data;
      console.log(`[JobRunner] Executing 'send-post-service-feedback' for ticket ${ticketId} in tenant ${tenantDbName}`);
      try {
        const tenantConnection = await getTenantConnection(tenantDbName);
        const models = getTenantModels(tenantConnection);
        const ticket = await models.RepairTicket.findById(ticketId).populate("customer", "name email").lean(); // Corrected populate field
        if (ticket) {
          // Assuming notificationService is adapted for this structure
          // await notificationService.triggerNotification(models, "repair.post_service_follow_up", { ticket, customer: ticket.customer });
        }
      } catch (error) {
        console.error(`[JobRunner] Failed to execute job for ticket ${ticketId}:`, error);
      }
    });
  }

  /**
   * Schedules a new job to run at a later time.
   */
  async scheduleJob(jobName, scheduleDate, data) {
    if (!this.agenda) {
      console.error("[JobScheduler] Cannot schedule job, scheduler not initialized.");
      return;
    }
    await this.agenda.schedule(scheduleDate, jobName, data);
    console.log(`[JobScheduler] Scheduled job '${jobName}' to run at ${scheduleDate}`);
  }
}

// Export a singleton instance. It is created but not yet initialized.
const jobSchedulerService = new JobSchedulerService();
module.exports = jobSchedulerService;
