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

    // 1. Fetch both documents in parallel for efficiency
    const [ticket, employee] = await Promise.all([
      RepairTicket.findById(ticketId),
      Employee.findById(employeeId).populate("designation").lean(),
    ]);

    if (!ticket) throw new Error("Repair ticket not found.");
    if (!employee) throw new Error("Employee not found.");

    console.log("employee ", employee);
    console.log("employee.designation ", employee.designation);
    console.log("employee.designation.title ", employee.designation.title);
    // 2. CRITICAL VALIDATION: Ensure the employee is a technician
    if (
      !employee.designation ||
      !String(employee.designation?.title)?.toLowerCase().includes("technician")
    ) {
      throw new Error(`Cannot assign. Employee ${employee.name} is not a registered technician.`);
    }

    // 3. Update the ticket and save
    ticket.assignedTo = employeeId;
    // Optionally, update the status if the business rule requires it
    // ticket.status = 'diagnosing';

    await ticket.save();

    // In a future chapter, we would create an audit log entry here.

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
