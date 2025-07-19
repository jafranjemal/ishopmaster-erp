const client = require("prom-client");
const responseTime = require("response-time");

// Create a Registry which registers the metrics
const register = new client.Registry();

// Enable the collection of default metrics
client.collectDefaultMetrics({
  app: "payment-service",
  prefix: "payment_",
  timeout: 10000,
  register,
});

// Define custom metrics
const paymentProcessingTime = new client.Histogram({
  name: "payment_processing_time_seconds",
  help: "Time taken to process payments",
  labelNames: ["method", "status"],
  buckets: [0.1, 0.5, 1, 2, 5, 10], // in seconds
});

const paymentSuccessCounter = new client.Counter({
  name: "payment_success_total",
  help: "Total number of successful payments",
  labelNames: ["method"],
});

const paymentFailureCounter = new client.Counter({
  name: "payment_failure_total",
  help: "Total number of failed payments",
  labelNames: ["method", "error_code"],
});

// Register custom metrics
register.registerMetric(paymentProcessingTime);
register.registerMetric(paymentSuccessCounter);
register.registerMetric(paymentFailureCounter);

// Middleware to track HTTP response times
const metricsMiddleware = responseTime((req, res, time) => {
  if (req?.route?.path) {
    const routePath = req.route.path;
    paymentProcessingTime.labels(routePath, res.statusCode.toString()).observe(time / 1000); // Convert to seconds
  }
});

module.exports = {
  register,
  metricsMiddleware,
  timing: (name, value, labels = {}) => {
    paymentProcessingTime.labels(labels).observe(value);
  },
  increment: (name, labels = {}) => {
    if (name === "payment.processing.success") {
      paymentSuccessCounter.labels(labels).inc();
    } else if (name === "payment.processing.failure") {
      paymentFailureCounter.labels(labels).inc();
    }
  },
  histogram: (name, value, labels = {}) => {
    paymentProcessingTime.labels(labels).observe(value);
  },
};
