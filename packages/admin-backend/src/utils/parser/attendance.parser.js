/**
 * Translates raw data from a ZKTeco device into our standard format.
 * @param {object} rawData - The req.body from the device webhook.
 * @returns {{employeeId: string, punchType: string, timestamp: Date}}
 */
const parseZKTecoData = (rawData) => {
  // This is an example based on common ZKTeco push SDK formats.
  // The actual structure may vary.
  const employeeId = rawData.UserID;
  const timestamp = new Date(rawData.LogTime);

  // Map device's punch type to our standard types
  let punchType;
  switch (rawData.Type) {
    case "CheckIn":
      punchType = "clock_in";
      break;
    case "CheckOut":
      punchType = "clock_out";
      break;
    // Add cases for 'BreakIn', 'BreakOut', etc.
    default:
      punchType = "unknown";
  }

  if (!employeeId || !timestamp || punchType === "unknown") {
    throw new Error("Invalid or incomplete data from ZKTeco device.");
  }

  return { employeeId, punchType, timestamp };
};

module.exports = {
  parseZKTecoData,
  // In the future, we would add: parseSupremaData, parseBioMaxData, etc.
};
