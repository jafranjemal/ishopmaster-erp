/**
 * The definitive, central service for generating all frontend URLs.
 * It correctly constructs path-based, tenant-aware URLs.
 */
class LinkGenerationService {
  /**
   * Generates a tenant-aware URL for the customer portal.
   * @param {string} path - The path within the portal (e.g., '/login', '/quotes/:id').
   * @param {object} tenant - The tenant object, must have a 'subdomain' property.
   * @param {object} [queryParams={}] - An object of query parameters.
   * @returns {string} The final, correctly formatted URL.
   */
  generatePortalUrl(path, tenant, queryParams = {}) {
    const baseUrl = process.env.FRONTEND_PORTAL_BASE_URL
    if (!baseUrl) {
      console.error("FATAL ERROR: FRONTEND_PORTAL_BASE_URL is not defined in .env file.")
      throw new Error("Server configuration error: Portal URL is not defined.")
    }

    // --- Definitive Fix #1: Always use a path-based structure ---
    const finalUrl = `${baseUrl}/portal/${tenant.subdomain}${path}`

    const url = new URL(finalUrl)
    Object.entries(queryParams).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })

    return url.toString()
  }
}

module.exports = new LinkGenerationService()
