const defaultQc = [
  {
    name: "Standard Intake Diagnostic QC",
    description: "Initial checks for any device booked in for a standard diagnostic or repair assessment.",
    processStage: "Intake",

    items: [
      { task: "Document customer's reported fault" },
      { task: "Note external cosmetic condition (dents, scratches, cracks)" },
      { task: "Verify device powers on (if possible)" },
      { task: "Check for signs of liquid damage (LCI indicators)" },
      { task: "Confirm Find My iPhone/Account Lock status" },
    ],
    isActive: true,
  },
  {
    name: "Liquid Damage Intake QC",
    description: "Specialized intake checklist for devices with suspected liquid damage.",
    processStage: "Intake",

    items: [
      { task: "Do not attempt to power on the device" },
      { task: "Ask customer about the type of liquid and time of exposure" },
      { task: "Check LCI indicators in SIM tray and charging port" },
      { task: "Note any visible corrosion on external ports" },
    ],
    isActive: true,
  },
  {
    name: "Screen Replacement Final QC",
    description: "Post-repair checks applicable to all phone screen replacements (iPhone and Samsung).",
    processStage: "Post-Repair",

    items: [
      { task: "Ensure screen is perfectly flush with the frame" },
      { task: "Test touch response across the entire screen, including corners" },
      { task: "Check for dead pixels, backlight bleed, or discoloration" },
      { task: "Verify True Tone, Auto-Brightness, and ProMotion (if applicable)" },
      { task: "Test Face ID / Touch ID / Front Camera / Proximity Sensor functionality" },
    ],
    isActive: true,
  },
  {
    name: "Battery Replacement Final QC",
    description: "Post-repair checks for all battery replacements.",
    processStage: "Post-Repair",

    items: [
      { task: "Confirm Battery Health is 100% in Settings" },
      { task: "Check for any 'non-genuine part' warnings" },
      { task: "Verify device is charging correctly via cable" },
      { task: "Ensure device is properly sealed with new adhesive" },
    ],
    isActive: true,
  },
  {
    name: "Logic Board Repair Final QC",
    description: "Comprehensive check for all advanced motherboard-level repairs (IC, shorts, etc.).",
    processStage: "Post-Repair",

    items: [
      { task: "Run full diagnostic software test" },
      { task: "Monitor device temperature under load for 15 minutes" },
      { task: "Test Wi-Fi, Bluetooth, and Cellular signal strength" },
      { task: "Make a test call to check all microphones and speakers" },
      { task: "Perform a full charge/discharge cycle" },
    ],
    isActive: true,
  },
  {
    name: "Software Service Final QC",
    description: "Final checks for data transfers, backups, and software updates.",
    processStage: "Post-Repair",

    items: [
      { task: "Verify data transfer is complete and customer data is accessible" },
      { task: "Confirm OS is updated to the specified version" },
      { task: "Ensure no customer accounts (iCloud/Google) are left signed in" },
      { task: "For lock removals, confirm device is accessible with proof of ownership on file" },
    ],
    isActive: true,
  },
]

module.exports = defaultQc
