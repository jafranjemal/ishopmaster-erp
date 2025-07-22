const mongoose = require("mongoose");

/**
 * The TechnicianAssignmentService handles all business logic related to
 * assigning and managing technicians for repair tickets.
 */
class TechnicianAssignmentService {
  /**
   * Assigns a technician to a specific repair ticket.
   * @param {object} models - The tenant's compiled models.
   * @param {string} ticketId - The ID of the repair ticket.
   * @param {string} employeeId - The ID of the employee to assign.
   * @returns {Promise<object>} The updated repair ticket.
   */
  async assignTechnician(models, { ticketId, employeeId }) {
    const { RepairTicket, Employee } = models;

    // Fetch the repair ticket first
    const ticket = await RepairTicket.findById(ticketId);
    if (!ticket) throw new Error("Repair ticket not found.");

    // ✅ If no employeeId provided or it's an empty string, unassign the ticket
    if (!employeeId || employeeId.trim() === "") {
      ticket.assignedTo = undefined; // Or null
      // Optionally update status here if needed
      await ticket.save();
      return ticket;
    }

    // Fetch the employee if ID is present
    const employee = await Employee.findById(employeeId).populate("jobPositionId").lean();
    if (!employee) throw new Error("Employee not found.");

    // ✅ Validate that the employee has a 'technician' jobPositionId
    if (
      !employee.jobPositionId ||
      !String(employee.jobPositionId?.title || "")
        .toLowerCase()
        .includes("technician")
    ) {
      throw new Error(`Cannot assign. Employee ${employee.name} is not a registered technician.`);
    }

    // Assign the technician
    ticket.assignedTo = employeeId;
    await ticket.save();

    return ticket;
  }

  /**
   * Reassigns a repair ticket to a new technician.
   */
  async reassignTechnician(models, { ticketId, newEmployeeId }) {
    // This method can reuse the assignTechnician logic for simplicity and consistency.
    return this.assignTechnician(models, { ticketId, employeeId: newEmployeeId });
  }

  /**
   * Fetches the current workload (active tickets) for a specific technician.
   * @param {object} models - The tenant's compiled models.
   * @param {string} employeeId - The ID of the employee.
   * @returns {Promise<Array>} An array of active repair tickets.
   */
  async getTechnicianWorkload(models, { employeeId }) {
    const { RepairTicket } = models;

    const activeTickets = await RepairTicket.find({
      assignedTo: employeeId,
      status: { $nin: ["closed", "cancelled"] }, // Exclude final states
    })
      .populate("customerId", "name")
      .populate("assets") // Assuming 'assets' is a ref to the Asset model
      .sort({ createdAt: -1 });

    return activeTickets;
  }
}

// Export a singleton instance so the same service is used across the app
module.exports = new TechnicianAssignmentService();
