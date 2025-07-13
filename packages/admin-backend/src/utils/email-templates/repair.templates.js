const getRepairStatusUpdateTemplate = (ticket) => {
  const subjectMapping = {
    diagnosing: `Your Repair Ticket #${ticket.ticketNumber} is Being Diagnosed`,
    awaiting_customer_approval: `Action Required for Repair Ticket #${ticket.ticketNumber}`,
    in_progress: `Your Repair for Ticket #${ticket.ticketNumber} Has Begun`,
    completed_pending_pickup: `Your Device is Ready for Pickup! (Ticket #${ticket.ticketNumber})`,
  };

  const bodyMapping = {
    diagnosing: `<p>Hi ${ticket.customerId.name},</p><p>Just to let you know, our technician has started diagnosing the issue with your ${ticket.deviceDetails.model}. We will update you again shortly.</p>`,
    awaiting_customer_approval: `<p>Hi ${ticket.customerId.name},</p><p>We have completed the diagnosis for your ${ticket.deviceDetails.model}. Please contact us at your earliest convenience to approve the required work.</p>`,
    in_progress: `<p>Hi ${ticket.customerId.name},</p><p>Good news! Our technician has started the repair work on your ${ticket.deviceDetails.model}.</p>`,
    completed_pending_pickup: `<p>Hi ${ticket.customerId.name},</p><p>Your repair for the ${ticket.deviceDetails.model} (Ticket #${ticket.ticketNumber}) is complete! You can pick up your device any time during our business hours.</p>`,
  };

  const subject = subjectMapping[ticket.status];
  const html = bodyMapping[ticket.status];

  // Only return a template if the status is one we want to notify for
  if (subject && html) {
    return { subject, html };
  }
  return null;
};

module.exports = { getRepairStatusUpdateTemplate };
