const eventEmitter = require("../../../config/events");
const invoiceSynthesisService = require("../../../services/invoiceSynthesis.service");
const logger = require("../../../config/logger"); // Assuming a logger exists

/**
 * This file registers all event listeners related to the Repair module.
 */
function registerRepairListeners() {
  eventEmitter.on("repair.qc_passed", async ({ models, ticket, userId, session, tenant }) => {
    try {
      logger.info(`Event 'repair.qc_passed' received for ticket ${ticket.ticketNumber}. Synthesizing invoice.`);

      // The invoice synthesis is part of the same transaction as the QC submission.
      await invoiceSynthesisService.createInvoiceFromRepair(models, { ticketId: ticket._id, userId }, session, tenant);

      logger.info(`Successfully synthesized invoice for ticket ${ticket.ticketNumber}.`);
    } catch (error) {
      // IMPORTANT: If this fails, the transaction initiated in the controller will be rolled back.
      logger.error(`Failed to synthesize invoice for ticket ${ticket.ticketNumber} after QC pass.`, {
        error: error.message,
        stack: error.stack,
      });
      // Re-throwing the error is crucial to ensure the transaction aborts.
      throw error;
    }
  });

  // ... register other repair-related listeners here in the future ...
}

module.exports = { registerRepairListeners };
