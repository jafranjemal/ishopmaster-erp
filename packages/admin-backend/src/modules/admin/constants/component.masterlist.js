// seed/masterlists/component.masterlist.js

const COMPONENT_LIST = [
  // --- ACCESSORY TYPES ---
  // brandAgnostic: false -> Creates a version for each compatible device (e.g., iPhone 15 Case, S23 Case)
  // brandAgnostic: true  -> Creates universal products from specific brands (e.g., Anker Power Bank)
  {
    name: "Silicone Case",
    categoryName: "Cases & Covers",
    brandAgnostic: false,
    attributeSetName: "Phone Case Specifications",
    type: "non-serialized",
  },
  {
    name: "Leather Case",
    categoryName: "Cases & Covers",
    brandAgnostic: false,
    attributeSetName: "Phone Case Specifications",
    type: "non-serialized",
  },
  {
    name: "Tempered Glass Screen Protector",
    categoryName: "Screen Protectors",
    brandAgnostic: false,
    attributeSetName: "Screen Protector Specs",
    type: "non-serialized",
  },
  {
    name: "Privacy Tempered Glass",
    categoryName: "Screen Protectors",
    brandAgnostic: false,
    attributeSetName: "Screen Protector Specs",
    type: "non-serialized",
  },
  {
    name: "20W USB-C Power Adapter",
    categoryName: "Chargers & Adapters",
    brandAgnostic: true,
    brands: ["Apple", "Anker", "Belkin"],
    attributeSetName: "Charger & Adapter Specs",
    type: "non-serialized",
  },
  {
    name: "USB-C to Lightning Cable",
    categoryName: "Cables",
    brandAgnostic: true,
    brands: ["Apple", "Anker"],
    attributeSetName: "Cable Specs",
    type: "non-serialized",
  },
  {
    name: "10000mAh Power Bank",
    categoryName: "Power Banks",
    brandAgnostic: true,
    brands: ["Anker", "Belkin", "ASPOR"],
    attributeSetName: "Power Bank Specifications",
    type: "serialized",
  },
  {
    name: "Wireless Earbuds",
    categoryName: "Audio",
    brandAgnostic: true,
    brands: ["Apple", "Samsung", "JBL", "Sony"],
    attributeSetName: "Earphones & Headphones Specs",
    type: "serialized",
  },

  // --- SPARE PART TYPES ---
  {
    name: "OLED Display Assembly",
    categoryName: "Displays",
    brandAgnostic: false,
    attributeSetName: "Display Screen Specs",
    type: "non-serialized",
  },
  {
    name: "LCD Display Assembly",
    categoryName: "Displays",
    brandAgnostic: false,
    attributeSetName: "Display Screen Specs",
    type: "non-serialized",
  },
  {
    name: "Replacement Battery",
    categoryName: "Batteries",
    brandAgnostic: false,
    attributeSetName: "Battery Specs",
    type: "non-serialized",
  },
  {
    name: "Replacement Back Glass",
    categoryName: "Housings & Back Glass",
    brandAgnostic: false,
    attributeSetName: "Back Glass Specs",
    type: "non-serialized",
  },
]

module.exports = COMPONENT_LIST
