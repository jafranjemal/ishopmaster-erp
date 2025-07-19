const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf, errors, json } = format;
const path = require("path");

// Custom format that includes error stack traces
const errorStackFormat = format((info) => {
  if (info instanceof Error) {
    return {
      ...info,
      stack: info.stack,
      message: info.message,
    };
  }
  return info;
});

// Development format
const devFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let msg = `${timestamp} [${level}] ${message} `;
  if (stack) msg += `\n${stack}`;
  if (Object.keys(metadata).length) msg += `\n${JSON.stringify(metadata, null, 2)}`;
  return msg;
});

// Production format
const prodFormat = combine(errors({ stack: true }), json());

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
});

// Handle uncaught promise rejections
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection:", reason);
});

module.exports = logger;
