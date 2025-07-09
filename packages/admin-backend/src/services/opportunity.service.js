const mongoose = require("mongoose");

class OpportunityService {
  /**
   * Creates a new opportunity.
   */
  async createOpportunity(models, data, userId) {
    const { Opportunity } = models;
    const newOpportunity = await Opportunity.create({ ...data, assignedTo: userId });
    return newOpportunity;
  }

  /**
   * Updates an opportunity's stage in the sales pipeline.
   * Now requires a lossReason if the stage is 'Closed-Lost'.
   */
  async updateStage(models, { opportunityId, newStage, lossReason }) {
    const { Opportunity } = models;

    // --- THE DEFINITIVE FIX: VALIDATION LOGIC ---
    if (newStage === "Closed-Lost" && !lossReason) {
      throw new Error("A reason is required when marking an opportunity as Closed-Lost.");
    }
    // --- END OF FIX ---

    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      throw new Error("Opportunity not found.");
    }

    opportunity.stage = newStage;
    if (lossReason) {
      opportunity.lossReason = lossReason;
    }

    await opportunity.save();
    return opportunity;
  }
}

module.exports = new OpportunityService();
