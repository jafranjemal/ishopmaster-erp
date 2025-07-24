const mongoose = require("mongoose");

class TimeTrackingService {
  /**
   * Start or resume a labor timer.
   */
  async startTimer(models, { ticketId, employeeId, userId }, session = null) {
    const { LaborLog, RepairTicket } = models;

    const existingTimer = await LaborLog.findOne({
      repairTicketId: ticketId,
      employeeId,
      status: { $in: ["in_progress", "paused"] },
    }).session(session);

    console.log(existingTimer);
    if (existingTimer) {
      if (existingTimer.status === "paused") {
        // Resume logic
        existingTimer.status = "in_progress";
        existingTimer.startTime = new Date(); // Resume time
        existingTimer.endTime = null; // Clear previous end
        await existingTimer.save({ session });

        // Optional: ensure main ticket reflects active work
        await RepairTicket.findByIdAndUpdate(ticketId, { status: "repair_active" }, { session });
        return existingTimer;
      } else {
        throw new Error("An active timer is already running for you on this ticket.");
      }
    }

    // Start new timer
    const newLog = await LaborLog.create(
      [
        {
          repairTicketId: ticketId,
          employeeId,
          startTime: new Date(),
          status: "in_progress",
        },
      ],
      { session }
    );

    await RepairTicket.findByIdAndUpdate(ticketId, { status: "repair_active" }, { session });
    return newLog[0];
  }

  /**
   * Pause an in-progress timer.
   */
  async pauseTimer(models, { ticketId, employeeId }, session = null) {
    const { LaborLog } = models;
    const timer = await LaborLog.findOne({
      repairTicketId: ticketId,
      employeeId,
      status: "in_progress",
    }).session(session);

    if (!timer) throw new Error("No active timer found to pause.");

    timer.endTime = new Date();
    timer.status = "paused";

    // Duration calculation
    const diffMs = timer.endTime - timer.startTime;
    const minutes = Math.round(diffMs / 60000);
    timer.durationMinutes = (timer.durationMinutes || 0) + minutes;

    await timer.save({ session });
    return timer;
  }

  /**
   * Stop and complete a timer. Updates labor item in the ticket.
   */
  async stopTimer(models, { ticketId, employeeId }, session = null) {
    const { LaborLog, RepairTicket, Employee } = models;

    const timer = await LaborLog.findOne({
      repairTicketId: ticketId,
      employeeId,
      status: { $in: ["in_progress", "paused"] },
    }).session(session);

    if (!timer) throw new Error("No active timer found to stop.");

    const now = new Date();
    if (timer.status === "in_progress") {
      timer.endTime = now;
      const diffMs = timer.endTime - timer.startTime;
      const minutes = Math.round(diffMs / 60000);
      timer.durationMinutes = (timer.durationMinutes || 0) + minutes;
    }

    timer.status = "completed";
    await timer.save({ session });

    // Aggregate total time for this ticket and employee
    const allLogs = await LaborLog.find({
      repairTicketId: ticketId,
      employeeId,
      status: { $in: ["completed", "paused"] },
    }).session(session);

    const totalMinutes = allLogs.reduce((sum, log) => sum + (log.durationMinutes || 0), 0);
    const totalHours = parseFloat((totalMinutes / 60).toFixed(2));

    const employee = await Employee.findById(employeeId).lean();
    const ticket = await RepairTicket.findById(ticketId).session(session);

    let laborItem = ticket.jobSheet.find((item) => item.itemType === "labor" && item.employeeId.equals(employeeId));

    const billingRate = employee?.compensation?.billingRate || 0;
    const payRate = employee?.compensation?.payRate || 0;

    if (laborItem) {
      laborItem.laborHours = totalHours;
      laborItem.quantity = totalHours;
    } else {
      ticket.jobSheet.push({
        itemType: "labor",
        employeeId,
        description: `${employee.firstName}'s Labor`,
        quantity: totalHours,
        laborHours: totalHours,
        laborRate: billingRate,
        unitPrice: billingRate,
        costPrice: payRate,
      });
    }

    await ticket.save({ session });
    return { timer, ticket };
  }
}

module.exports = new TimeTrackingService();
