/**
 * Updated master list of common industry categories to be seeded for new tenants.
 * Added unique `key` fields for easier referencing and integration.
 */
const CATEGORIES = [
  // Devices
  { key: "smartphones", name: "Smartphones" },
  { key: "tablets", name: "Tablets" },
  { key: "laptops", name: "Laptops" },
  { key: "desktops", name: "Desktops" },
  { key: "monitors", name: "Monitors" },
  { key: "projectors", name: "Projectors" },

  // Accessories
  { key: "cases_covers", name: "Cases & Covers" },
  { key: "screen_protectors", name: "Screen Protectors" },
  { key: "chargers", name: "Chargers & Cables" },
  { key: "power_banks", name: "Power Banks" },
  { key: "earphones", name: "Headphones & Headsets" },
  { key: "memory_cards_storage", name: "Memory Cards & Storage" },

  // Spare Parts
  { key: "displays_screens", name: "Displays & Screens" },
  { key: "batteries", name: "Batteries" },
  { key: "motherboards", name: "Motherboards" },
  { key: "chips_ics", name: "Chips & ICs" },
  { key: "mobile_parts", name: "Mobile Spare Parts" }, // Added to match attribute sets
  { key: "laptop_parts", name: "Laptop Spare Parts" }, // Added

  // Software & Services
  { key: "operating_systems", name: "Operating Systems" },
  { key: "antivirus_software", name: "Antivirus Software" },
  { key: "installation_service", name: "Installation Service" },
  { key: "repair_service", name: "Repair Service" },
  { key: "phone_services", name: "Phone Repair Services" }, // Added
  { key: "laptop_services", name: "Laptop Repair Services" }, // Added

  // Non-Electronic
  { key: "cleaning_kits", name: "Cleaning Kits" },

  // Additional Apple ecosystem focused categories
  { key: "apple_watch", name: "Apple Watch" },
  { key: "accessories", name: "Accessories" },
];

module.exports = CATEGORIES;
