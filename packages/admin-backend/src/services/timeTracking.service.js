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

  async stopTimer(models, { ticketId, employeeId, userId }) {
    const { LaborLog, RepairTicket, Employee } = models;

    const timer = await LaborLog.findOne({ repairTicketId: ticketId, employeeId, status: "in_progress" });
    if (!timer) throw new Error("No active timer found to stop.");

    timer.endTime = new Date();
    timer.status = "completed";
    await timer.save();

    const employee = await Employee.findById(employeeId).lean();
    const ticket = await RepairTicket.findById(ticketId);

    // Find an existing labor item for this employee on the job sheet or create a new one
    let laborItem = ticket.jobSheet.find((item) => item.itemType === "labor" && item.employeeId.equals(employeeId));

    if (laborItem) {
      laborItem.laborHours += timer.durationMinutes / 60;
    } else {
      ticket.jobSheet.push({
        itemType: "labor",
        employeeId: employeeId,
        description: `${employee.firstName}'s Labor`,
        quantity: 1, // Represents one block of labor
        laborHours: timer.durationMinutes / 60,
        laborRate: employee.compensation?.billingRate || 0,
        unitPrice: employee.compensation?.billingRate || 0,
        costPrice: employee.compensation?.payRate || 0,
      });
    }

    // Round labor hours to 2 decimal places
    if (laborItem) laborItem.laborHours = parseFloat(laborItem.laborHours.toFixed(2));

    await ticket.save();
    return { timer, ticket };
  }
}
module.exports = new TimeTrackingService();
