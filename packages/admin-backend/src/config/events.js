const { EventEmitter2 } = require("eventemitter2");

/**
 * The definitive, central event emitter for the entire application.
 * This singleton instance acts as the "digital nervous system" or "paging system",
 * allowing different services to communicate asynchronously without being tightly coupled.
 *
 * We configure it with wildcards enabled for flexible event listening.
 */
const eventEmitter = new EventEmitter2({
  wildcard: true, // e.g., listen for 'repair.*' to catch all repair events
  delimiter: ".", // Use dots for event namespacing, e.g., 'repair.status_changed'
  maxListeners: 20, // Default is 10, increase for a larger application
});

module.exports = eventEmitter;
