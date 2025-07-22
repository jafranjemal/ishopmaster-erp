const mongoose = require("mongoose");

class TimeTrackingService {
  async startTimer(models, { ticketId, employeeId, userId }) {
    const { LaborLog, RepairTicket } = models;

    const existingTimer = await LaborLog.findOne({ repairTicketId: ticketId, employeeId, status: "in_progress" });
    if (existingTimer) throw new Error("An active timer already exists for you on this ticket.");

    const newLog = await LaborLog.create({
      repairTicketId: ticketId,
      employeeId: employeeId,
      startTime: new Date(),
      status: "in_progress",
    });

    // Optionally, update the main ticket status
    await RepairTicket.findByIdAndUpdate(ticketId, { status: "repair_active" });

    return newLog;
  }

  async pauseTimer(models, { ticketId, employeeId }, session) {
    const { LaborLog } = models;
    const timer = await LaborLog.findOne({ repairTicketId: ticketId, employeeId, status: "in_progress" }).session(session);
    if (!timer) throw new Error("No active timer found to pause.");

    timer.endTime = new Date();
    timer.status = "paused";
    await timer.save({ session });
    return timer;
  }

  async stopTimer(models, { ticketId, employeeId }, session) {
    const { LaborLog, RepairTicket, Employee } = models;
    const timer = await LaborLog.findOne({ repairTicketId: ticketId, employeeId, status: "in_progress" }).session(session);
    if (!timer) throw new Error("No active timer found to stop.");

    timer.endTime = new Date();
    timer.status = "completed";
    await timer.save({ session });

    const allLogsForJob = await LaborLog.find({ repairTicketId: ticketId, employeeId, status: "completed" }).session(session);
    const totalMinutes = allLogsForJob.reduce((sum, log) => sum + log.durationMinutes, 0);
    const totalHours = parseFloat((totalMinutes / 60).toFixed(2));

    const employee = await Employee.findById(employeeId).lean();
    const ticket = await RepairTicket.findById(ticketId).session(session);

    let laborItem = ticket.jobSheet.find((item) => item.itemType === "labor" && item.employeeId.equals(employeeId));
    if (laborItem) {
      laborItem.laborHours = totalHours;
      laborItem.quantity = totalHours; // Sync quantity with hours for consistency
    } else {
      ticket.jobSheet.push({
        itemType: "labor",
        employeeId: employeeId,
        description: `${employee.firstName}'s Labor`,
        quantity: totalHours,
        laborHours: totalHours,
        laborRate: employee.compensation?.billingRate || 0,
        unitPrice: employee.compensation?.billingRate || 0,
        costPrice: employee.compensation?.payRate || 0,
      });
    }

    await ticket.save({ session });
    return { timer, ticket };
  }
}
module.exports = new TimeTrackingService();
