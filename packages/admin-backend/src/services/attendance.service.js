const mongoose = require("mongoose");

/**
 * The AttendanceService handles the core business logic for processing
 * standardized employee punch events from any source.
 */
class AttendanceService {
  /**
   * Processes a single, standardized attendance punch event.
   * This is the core logic for the time clock system.
   * Assumes it is being called from within a transaction.
   * @param {object} models - The tenant's compiled models.
   * @param {object} data - The standardized punch data.
   * @param {string} data.employeeId - The ID of the employee.
   * @param {string} data.punchType - The type of punch ('clock_in', 'clock_out', etc.).
   * @param {Date} data.timestamp - The time of the punch.
   */
  async processPunch(models, { employeeId, punchType, timestamp }) {
    const { Attendance } = models;

    // Find the last open attendance record for this employee
    const activeSession = await Attendance.findOne({
      employeeId: new mongoose.Types.ObjectId(employeeId),
      checkOutTime: null,
    }).sort({ checkInTime: -1 });

    switch (punchType) {
      case "clock_in":
        if (activeSession) {
          throw new Error(
            `Employee is already clocked in since ${activeSession.checkInTime.toLocaleTimeString()}.`
          );
        }
        const employee = await models.Employee.findById(employeeId);
        if (!employee) throw new Error("Employee not found.");

        const newSession = await Attendance.create([
          {
            employeeId,
            branchId: employee.branchId,
            checkInTime: timestamp,
          },
        ]);
        return newSession[0];

      case "clock_out":
        if (!activeSession) {
          throw new Error("Cannot clock out. No active session found for this employee.");
        }
        activeSession.checkOutTime = timestamp;
        await activeSession.save();
        return activeSession;

      // In the future, we would add logic for breaks here.
      // case 'break_start':
      //     if (!activeSession) throw new Error('Must be clocked in to start a break.');
      //     // Logic to push a new break object to a 'breaks' array on the Attendance model
      //     break;

      // case 'break_end':
      //     if (!activeSession) throw new Error('Must be clocked in to end a break.');
      //     // Logic to find the open break and set its end time
      //     break;

      default:
        throw new Error(`Unknown punch type: ${punchType}`);
    }
  }
}

module.exports = new AttendanceService();
