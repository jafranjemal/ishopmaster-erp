const jwt = require("jsonwebtoken")
const linkGenerationService = require("./linkGeneration.service")
const Tenant = require("../modules/admin/tenants/tenant.model")

class TokenService {
  /**
   * Generates a new passwordless auth token for a specific repair ticket.
   */
  async generateForRepairTicket(models, { ticket }) {
    const { CustomerAuthToken } = models
    const expiry = new Date()
    expiry.setDate(expiry.getDate() + 7) // Token is valid for 7 days

    const authToken = await CustomerAuthToken.create({
      customerId: ticket.customerId,
      repairTicketId: ticket._id,
      expiryDate: expiry,
    })

    return authToken.token
  }
  /**
   * Generates a new, generic passwordless auth token for a customer's full account.
   */
  async generateForCustomer(models, { customerId, tenantId }) {
    const { CustomerAuthToken } = models
    const expiry = new Date()
    expiry.setMinutes(expiry.getMinutes() + 15) // A manual login link is only valid for 15 minutes

    const authToken = await CustomerAuthToken.create({
      customerId: customerId,
      // No repairTicketId is linked for a general login
      expiryDate: expiry,
    })
    console.log("tenantId in token service", tenantId)
    console.log("customerId in token service", customerId)

    const sessionToken = jwt.sign(
      { id: customerId, type: "customer", tenantId: tenantId }, // Add tenantId to the payload
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    )

    const tenant = await Tenant.findById(tenantId)

    const loginUrl = linkGenerationService.generatePortalUrl("/login", tenant, { token: authToken.token })

    // We return both the one-time token for the URL and the session token for the portal
    return { loginUrl, oneTimeToken: authToken.token, sessionToken }
    // return authToken.token;
  }
}
module.exports = new TokenService()
