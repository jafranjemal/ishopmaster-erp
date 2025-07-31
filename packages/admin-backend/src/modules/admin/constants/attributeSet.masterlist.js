/**
 * The definitive, corrected master list of attribute sets for a new tenant.
 * This list has been de-duplicated, merged, and improved for a professional
 * mobile sales and repair ERP.
 */
const ATTRIBUTE_SET_MASTER_LIST = [
  // --- DEVICE SPECIFICATIONS ---
  {
    name: "Smartphone Specifications",
    attributeKeys: ["model", "color", "storage", "ram", "screen_size", "processor", "os", "battery_capacity", "connectivity"],
  },
  {
    name: "Tablet Specifications",
    attributeKeys: ["model", "color", "storage", "ram", "screen_size", "processor", "os", "connectivity"],
  },
  {
    name: "Speaker Specifications",
    attributeKeys: ["color", "connectivity", "power_rating", "battery_capacity", "water_resistance", "driver_size", "warranty"],
  },
  {
    name: "Audio Accessory Specs",
    attributeKeys: [
      "color",
      "connectivity", // Bluetooth, 3.5mm
      "battery_capacity", // Optional
      "noise_canceling", // Yes/No
      "microphone", // Yes/No
      "driver_size", // e.g., 10mm
      "water_resistance", // e.g., IPX4
      "warranty",
    ],
  },
  {
    name: "Charger Specifications",
    attributeKeys: [
      "power_rating", // e.g., 20W, 30W
      "voltage", // e.g., 5V, 9V
      "connectivity", // e.g., USB-C, Lightning
      "color",
      "warranty",
    ],
  },
  {
    name: "Earphones / Headphones",
    attributeKeys: [
      "connectivity", // e.g., Bluetooth, 3.5mm Jack
      "driver_size", // e.g., 10mm
      "noise_canceling", // e.g., Yes/No
      "microphone", // e.g., Yes/No
      "color",
      "warranty",
    ],
  },
  {
    name: "Spare Parts (Mobiles)",
    attributeKeys: [
      "model",
      "part_type", // e.g., Display, Battery, Camera Module
      "quality_type", // e.g., Original, Copy
      "condition", // e.g., New, Used
      "warranty",
    ],
  },
  {
    name: "Apple Case Specs",
    attributeKeys: [
      "model", // e.g., iPhone 15 Pro
      "material", // e.g., Silicone, Leather
      "color",
    ],
  },
  {
    name: "Apple iPhone Specs",
    attributeKeys: [
      "color",
      "storage", // e.g., 128GB
      "ram",
      "screen_size",
      "processor",
      "water_resistance",
      "warrantyPlan",
      "warranty",
    ],
  },
  {
    name: "Apple MacBook Specs",
    attributeKeys: ["color", "storage", "ram", "processor", "screen_size", "os"],
  },
  {
    name: "Apple Watch Specs",
    attributeKeys: ["model", "color", "storage", "screen_size", "connectivity", "os"],
  },
  {
    name: "Color",
    attributeKeys: ["color"],
  },
  {
    name: "Power Bank Specifications",
    attributeKeys: [
      "battery_capacity", // e.g., 10000mAh
      "power_rating", // e.g., 20W, 30W
      "connector_type", // e.g., USB-C, Lightning
      "color", // e.g., Black, White
      "material", // e.g., Aluminum, Plastic
      "weight", // ✅ Newly added
    ],
  },
  {
    name: "AirPods Specifications",
    attributeKeys: ["model", "color", "connectivity", "noise_canceling", "quality_type", "warrantyPlan"],
  },
  {
    name: "Cable Specifications",
    attributeKeys: [
      "length", // e.g., 1m, 2m
      "color", // e.g., white, black
      "connector_type", // e.g., USB-C to USB-C, USB-A to Lightning
      "power_rating", // e.g., 60W, 100W
      "material", // e.g., braided, rubber
      "quality_type",
      "warrantyPlan",
    ],
  },
  {
    name: "Phone Case Attributes",
    attributeKeys: ["color", "material"], // or just ["color"]
  },
  {
    name: "Display Attributes",
    attributeKeys: [
      "model",
      "screen_size",
      "display_type", // e.g., AMOLED, LCD
      "condition",
      "warranty",
    ],
  },
  {
    name: "Storage",
    attributeKeys: [
      "storage", // e.g., 32GB, 64GB
      "type", // e.g., microSD, USB Flash Drive
      "speed_class", // e.g., Class 10, UHS-I, USB 3.2
      "color", // Optional
      "warranty", // e.g., 1 Year, 2 Years
    ],
  },
  {
    name: "Laptop Specifications",
    attributeKeys: ["model", "color", "storage", "ram", "processor", "screen_size", "os", "connectivity", "battery_capacity"],
  },
  {
    name: "Smartwatch Specifications",
    attributeKeys: ["model", "color", "screen_size", "os", "connectivity", "material"],
  },

  // --- ACCESSORY SPECIFICATIONS ---
  {
    name: "Phone Case Specifications",
    attributeKeys: ["model", "color", "material"],
  },
  {
    name: "Screen Protector Specs",
    attributeKeys: ["model", "material", "quality_type"],
  },
  {
    name: "Charger & Adapter Specs",
    attributeKeys: ["color", "power_rating", "connectivity", "quality_type"],
  },
  {
    name: "Power Adapter Specifications",
    attributeKeys: [
      "power_rating",
      "connectivity",
      "color",
      "quality_type", // e.g., Original, Copy, C/O
      "warrantyPlan", // e.g., AppleCare+, Standard
    ],
  },
  {
    name: "Cable Specs",
    attributeKeys: ["connectivity", "quality_type", "length"],
  },
  {
    name: "Earphones & Headphones Specs",
    attributeKeys: ["color", "connectivity", "material", "quality_type"],
  },

  // --- SPARE PART SPECIFICATIONS ---
  {
    name: "Display Screen Specs",
    attributeKeys: ["model", "quality_type"],
  },
  {
    name: "Housing Attributes",
    attributeKeys: [
      "material", // e.g., glass, plastic, aluminum
      "color",
      "condition",
      "warranty",
    ],
  },
  {
    name: "Service Attributes",
    attributeKeys: [
      "service_duration", // e.g., 30 mins, 1 hour
      "warranty", // e.g., 3 months, 6 months
      "service_type", // e.g., screen replacement, battery replacement
    ],
  },
  {
    name: "Flex Cable Attributes",
    attributeKeys: [
      "model",
      "length", // e.g., 10cm, 15cm
      "connector_type", // e.g., Lightning, USB-C
      "condition",
      "warranty",
    ],
  },
  {
    name: "Battery Specs",
    attributeKeys: [
      "model",
      "quality_type",
      "capacity", // e.g., 2000mAh, 3000mAh
      "voltage", // e.g., 3.8V, 7.4V
      "condition", // New, Refurbished, Used
      "warranty",
    ],
  },
  {
    name: "Back Glass Specs",
    attributeKeys: ["model", "color"],
  },
  {
    name: "General Spare Part Specs",
    attributeKeys: ["part_type", "model", "color", "quality_type", "material"],
  },

  // --- SERVICE SPECIFICATIONS ---
  {
    name: "Repair Service Specs",
    attributeKeys: ["service_type", "model", "os"],
  },
]

module.exports = ATTRIBUTE_SET_MASTER_LIST
