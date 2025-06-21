/**
 * Master list of attribute sets (specification sheets) for new tenants.
 * Each set maps to a product category (categoryKey) and defines relevant attributes.
 */
const ATTRIBUTE_SETS = [
  {
    name: "Smartphone Specifications",
    categoryKey: "smartphones",
    attributeKeys: [
      "color",
      "storage",
      "ram",
      "screen_size",
      "processor",
      "os",
      "battery_capacity",
      "connectivity",
    ],
  },
  {
    name: "iPad Specifications",
    categoryKey: "tablets",
    attributeKeys: [
      "color",
      "storage",
      "ram",
      "screen_size",
      "processor",
      "os",
      "connectivity",
    ],
  },
  {
    name: "MacBook Specifications",
    categoryKey: "laptops",
    attributeKeys: [
      "color",
      "storage",
      "ram",
      "processor",
      "screen_size",
      "os",
      "connectivity",
      "battery_capacity",
    ],
  },
  {
    name: "iMac & Mac Mini Specifications",
    categoryKey: "desktops",
    attributeKeys: ["storage", "ram", "processor", "os", "connectivity"],
  },
  {
    name: "Watch Specifications",
    categoryKey: "apple_watch",
    attributeKeys: ["color", "screen_size", "os", "connectivity", "material"],
  },
  {
    name: "Phone Case Specifications",
    categoryKey: "cases_covers",
    attributeKeys: ["color", "material"],
  },
  {
    name: "Screen Protector Specifications",
    categoryKey: "screen_protectors",
    attributeKeys: ["screen_size", "material"],
  },
  {
    name: "Charger Specifications",
    categoryKey: "chargers",
    attributeKeys: ["power_supply", "connectivity"],
  },
  {
    name: "Earphones / Headphones",
    categoryKey: "earphones",
    attributeKeys: ["color", "connectivity", "material"],
  },
  {
    name: "Spare Parts (Mobiles)",
    categoryKey: "mobile_parts",
    attributeKeys: ["part_type", "color", "material"],
  },
  {
    name: "Spare Parts (Laptops)",
    categoryKey: "laptop_parts",
    attributeKeys: ["part_type", "screen_size", "material"],
  },
  {
    name: "Repair Services (Phones)",
    categoryKey: "phone_services",
    attributeKeys: ["service_type", "screen_size", "os"],
  },
  {
    name: "Repair Services (Laptops)",
    categoryKey: "laptop_services",
    attributeKeys: ["service_type", "screen_size", "processor", "os"],
  },
  {
    name: "Accessories",
    categoryKey: "accessories",
    attributeKeys: ["color", "connectivity", "material"],
  },
];

module.exports = ATTRIBUTE_SETS;
