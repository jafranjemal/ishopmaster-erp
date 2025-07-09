const mongoose = require("mongoose");

class LeadService {
  /**
   * Converts a qualified lead into a Customer and an Opportunity.
   * Assumes it is being called from within a transaction.
   */
  async convertLead(models, { leadId, userId }) {
    const { Lead, Customer, Opportunity } = models;

    const lead = await Lead.findById(leadId);
    if (!lead) throw new Error("Lead not found.");
    if (lead.status === "qualified") throw new Error("This lead has already been qualified.");

    // 1. Find or Create a Customer
    let customer;
    if (lead.email) {
      customer = await Customer.findOne({ email: lead.email });
    }
    if (!customer && lead.phone) {
      customer = await Customer.findOne({ phone: lead.phone });
    }
    if (!customer) {
      customer = (
        await Customer.create([
          {
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            // address would be mapped here if available on the lead
          },
        ])
      )[0];
    }

    // 2. Create an Opportunity
    const [opportunity] = await Opportunity.create([
      {
        name: `Opportunity for ${lead.name}` + (lead.company ? ` (${lead.company})` : ""),
        accountId: customer._id,
        amount: 0, // Salesperson will update this
        stage: "Qualification",
        expectedCloseDate: new Date(new Date().setDate(new Date().getDate() + 30)), // Default 30 days
        assignedTo: userId,
        sourceLeadId: lead._id, // Link back to the original lead
      },
    ]);

    // 3. Update the Lead's status
    lead.status = "qualified";
    await lead.save();

    return { customer, opportunity };
  }
}

module.exports = new LeadService();
