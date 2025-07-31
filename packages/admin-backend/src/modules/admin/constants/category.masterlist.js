/**
 * The definitive, expanded, industry-standard master list of hierarchical categories
 * for a professional mobile sales and service shop ERP.
 * This structure is designed to be parsed by a seeding script to create
 * parent-child relationships in the database.
 */
const CATEGORY_MASTER_LIST = [
  // --- TOP-LEVEL: PRODUCTS ---
  {
    name: "Products",
    description: "All physical goods sold to customers.",
    children: [
      {
        name: "Devices",
        description: "New or used electronic devices for sale.",
        children: [
          { name: "Smartphones" },
          { name: "Feature Phones" },
          { name: "Tablets & iPads" },
          { name: "Laptops & MacBooks" },
          { name: "Desktop Computers" },
          { name: "Smart Watches" },
          { name: "Gaming Consoles" },
          { name: "Drones" },
        ],
      },
      {
        name: "Accessories",
        description: "Cases, chargers, and other add-ons.",
        children: [
          { name: "Cases & Covers" },
          { name: "Memory Cards & Storage" },
          { name: "Screen Protectors (Tempered Glass & Film)" },
          { name: "Screen Protectors" },
          { name: "Chargers & Power Adapters" },
          { name: "Chargers & Cables" },
          { name: "Chargers & Adapters" },
          { name: "Cables & Converters" },
          { name: "Cables & Connectors (USB-C, Lightning, etc.)" },
          { name: "Headphones & Headsets (Wired & Wireless)" },
          { name: "Headphones & Headsets" },
          { name: "Headphones & Earbuds" },
          { name: "Power Banks" },
          { name: "Earphones" },
          { name: "Phone Cases" },
          { name: "Power Banks & Portable Chargers" },
          { name: "Memory Cards & USB Drives" },
          { name: "Car Mounts & Holders" },
          { name: "Bluetooth Speakers" },
          { name: "Styluses" },
        ],
      },
      {
        name: "Spare Parts",
        description: "Components used for internal repairs.",
        children: [
          { name: "Displays (LCD, OLED, Assemblies)" },
          { name: "Batteries" },
          { name: "Displays" },
          { name: "Motherboards / Logic Boards" },
          { name: "Cameras (Front & Back Modules)" },
          { name: "Charging Port Flex Cables" },
          { name: "Speaker & Earpiece Assemblies" },
          { name: "Microphone Assemblies" },
          { name: "Buttons (Volume, Power, Home)" },
          { name: "Back Glass & Housings" },
          { name: "SIM Trays" },
          { name: "Integrated Circuits (ICs) & Chips" },
          { name: "Laptop Keyboards" },
          { name: "Laptop Trackpads" },
          { name: "Cooling Fans" },
          { name: "Frame & Housing" },
          { name: "Glass & Lens" },
          { name: "Display Screens" },
        ],
      },
    ],
  },
  // --- TOP-LEVEL: SERVICES ---
  {
    name: "Services",
    description: "All repair, unlocking, and software services offered.",
    children: [
      {
        name: "Device Repair Services",
        children: [
          { name: "Screen Replacement" },
          { name: "Battery Replacement" },
          { name: "Charging Port Repair" },
          { name: "Charging Port Replacement" },
          { name: "Water Damage Treatment" },
          { name: "Camera Repair" },
          { name: "Speaker/Mic Repair" },
          { name: "Button Repair" },
          { name: "Back Glass Repair" },
          { name: "Ultrasonic Cleaning" },
          { name: "Laptop Repair" },
        ],
      },
      {
        name: "Advanced Repairs (Micro-soldering)",
        children: [{ name: "Motherboard/Logic Board Repair" }, { name: "Data Recovery" }, { name: "IC Replacement" }],
      },
      {
        name: "Software Services",
        children: [
          { name: "OS & Software Installation" },
          { name: "Virus & Malware Removal" },
          { name: "Device Unlocking (Network & Carrier)" },
          { name: "iCloud/FRP Lock Removal" },
        ],
      },
      {
        name: "Diagnostic Services",
        children: [
          { name: "General Troubleshooting Fee" },
          { name: "Insurance Assessment Report" },
          { name: "Standard Diagnostic Service" },
          { name: "Liquid Damage Assessment" },
        ],
      },
    ],
  },
  // --- TOP-LEVEL: MISCELLANEOUS ---
  {
    name: "Miscellaneous",
    description: "For non-standard items and services.",
    children: [{ name: "Gift Cards" }, { name: "Consumables (Cleaning Kits, etc.)" }, { name: "Trade-In Credits" }],
  },
]

module.exports = CATEGORY_MASTER_LIST
