const handlebars = require("handlebars")
const { get } = require("lodash")
/**
 * Registers all custom handlebars helpers for the ERP.
 * This function should be called once when the application initializes
 * or before any template rendering occurs.
 */
function registerHandlebarsHelpersOld() {
  // --- Definitive Fix #1: Register the missing 'eq' helper ---
  handlebars.registerHelper("eq", function (a, b) {
    return a === b
  })

  handlebars.registerHelper("get", function (obj, path) {
    return get(obj, path, "")
  })

  handlebars.registerHelper("formatCurrency", function (amount) {
    // This can be made more robust by passing in the tenant's currency code
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "LKR" }).format(amount || 0)
  })

  handlebars.registerHelper("formatDate", function (date) {
    if (!date) return ""
    return new Date(date).toLocaleDateString("en-GB") // Example format: DD/MM/YYYY
  })

  console.log("✅ Custom handlebars helpers registered.")
}

function registerHandlebarsHelpers() {
  // Equality helper

  handlebars.registerHelper("renderTemplate", function (templateString) {
    try {
      // Use the main handlebars instance to compile and render
      const template = handlebars.compile(templateString)
      return template(this)
    } catch (error) {
      console.error("Template rendering error:", error)
      return "Error rendering template"
    }
  })

  handlebars.registerHelper("lookupProperty", function (obj, path) {
    return path.split(".").reduce((o, p) => (o && o[p] !== undefined ? o[p] : ""), obj)
  })

  handlebars.registerHelper("getArrayProperty", function (obj, path) {
    const result = path.split(".").reduce((o, p) => (o && o[p] !== undefined ? o[p] : []), obj)
    return Array.isArray(result) ? result : [result]
  })

  handlebars.registerHelper("formatValue", function (value, format) {
    if (value === undefined || value === null) return ""

    if (format === "currency") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
      }).format(value)
    }

    if (format === "date") {
      return new Date(value).toLocaleDateString()
    }

    return value
  })

  handlebars.registerHelper("eq", function (a, b, options) {
    // Inline call: only 2 real args → return boolean
    if (arguments.length < 4) {
      return a === b
    }
    // Block call: options.fn and options.inverse exist
    return a === b ? options.fn(this) : options.inverse(this)
  })

  // Lookup helper for special cases
  handlebars.registerHelper("lookup", function (path, key) {
    return path.includes(key)
  })

  // Get value from object
  handlebars.registerHelper("get", function (obj, path) {
    return _.get(obj, path, "")
  })

  // Currency formatting
  handlebars.registerHelper("formatCurrency", function (amount) {
    if (amount === undefined || amount === null) return "Rs. 0.00"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "LKR",
    }).format(amount)
  })

  // Date formatting
  handlebars.registerHelper("formatDate", function (date) {
    if (!date) return ""
    return new Date(date).toLocaleDateString("en-GB")
  })

  handlebars.registerHelper("ifEquals", (a, b, opts) => (a === b ? opts.fn(this) : opts.inverse(this)))

  handlebars.registerHelper("rateOrUnit", (item) => {
    return item.itemType === "labor"
      ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(item.laborRate || item.unitPrice)
      : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(item.unitPrice)
  })

  handlebars.registerHelper("lineTotal", (item) => {
    const total = item.itemType === "labor" ? item.quantity * item.laborRate : item.quantity * item.unitPrice
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(total)
  })

  console.log("✅ Custom handlebars helpers registered.")
}

module.exports = { registerHandlebarsHelpers }
