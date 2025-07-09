const mongoose = require("mongoose");

class ActivityService {
  /**
   * Creates a new activity record linked to a parent CRM document.
   */
  async createActivity(models, data, userId) {
    const { Activity } = models;
    const newActivity = await Activity.create({ ...data, createdBy: userId });
    return newActivity;
  }
}

module.exports = new ActivityService();
