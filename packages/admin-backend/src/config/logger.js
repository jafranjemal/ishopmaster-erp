const { createLogger, format, transports } = require("winston")
const { combine, timestamp, printf, errors, json } = format
const path = require("path")

// Utility: safe stringify that handles circular references
function safeStringify(obj, indent = 2) {
  const seen = new WeakSet()
  return JSON.stringify(
    obj,
    function (key, value) {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) return "[Circular]"
        seen.add(value)
      }
      return value
    },
    indent
  )
}

// Custom format to attach error stack
const errorStackFormat = format((info) => {
  if (info instanceof Error) {
    return {
      ...info,
      stack: info.stack,
      message: info.message,
    }
  }
  return info
})

// Development format
const devFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let msg = `${timestamp} [${level}] ${message}`
  if (stack) msg += `\n${stack}`
  if (Object.keys(metadata).length) {
    try {
      msg += `\n${safeStringify(metadata)}`
    } catch (err) {
      msg += `\n[Could not stringify metadata: ${err.message}]`
    }
  }
  return msg
})

// Production format
const prodFormat = combine(errors({ stack: true }), json())

const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  defaultMeta: { service: "payment-service" },
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    process.env.NODE_ENV === "production" ? prodFormat : combine(errorStackFormat(), devFormat)
  ),
  transports: [
    new transports.Console(),
    new transports.File({
      filename: path.join(__dirname, "../logs/payment-service-error.log"),
      level: "error",
    }),
    new transports.File({
      filename: path.join(__dirname, "../logs/payment-service-combined.log"),
    }),
  ],
  exceptionHandlers: [
    new transports.File({
      filename: path.join(__dirname, "../logs/payment-service-exceptions.log"),
    }),
  ],
})

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason) => {
  console.error("⚠️ Unhandled Rejection logged")
  logger.error("Unhandled Rejection:", reason)
})

// Debug startup logger info
console.log("✅ Logger initialized with level:", logger.level)
console.log("✅ Logger running in mode:", process.env.NODE_ENV)

module.exports = logger
