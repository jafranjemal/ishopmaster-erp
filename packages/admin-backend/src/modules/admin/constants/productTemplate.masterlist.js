const { writeFile } = require("fs")
// seed/masterlists/productTemplate.masterlist.js

const DEVICE_LIST = require("./device.masterlist")
const BRANDS = require("./brand.masterlist")
const COMPONENT_LIST = require("./component.masterlist")
const MIGRATED_RAW_DATA = require("./migration.rawdata") // Assuming your data is in this file
const CATEGORY_MASTER_LIST = require("./category.masterlist")
const ATTRIBUTE_SET_MASTER_LIST = require("./attributeSet.masterlist")
const ATTRIBUTES = require("./attribute.masterlist")

// 1. Build a map: serviceName → serviceGroupName
const servicesNode = CATEGORY_MASTER_LIST.find((node) => node.name === "Services")
const serviceMap = {}

// for each subgroup under Services…
servicesNode.children.forEach((group) => {
  const groupName = group.name // e.g. "Device Repair Services"
  ;(group.children || []).forEach((svc) => {
    serviceMap[svc.name] = groupName
  })
})

// 2. Our 120 detailed service list (as before)
// 1. Hard-coded array of the 120 service names
const SERVICE_NAMES = [
  // Quick-Fix Micro-Repairs (20)
  "Glass-Only Touch Repair",
  "Frame Straightening & Dent Removal",
  "Micro-Soldered Connector Cleaning",
  "Speaker Dust & Debris Removal",
  "Button Membrane Replacement",
  "Camera Lens Glass Replacement",
  "Flash Module Cell Repair",
  "Vibration Motor Cleaning",
  "SIM Tray Slot Cleaning",
  "Micro-Port Reflow (Charging/Data Flex)",
  "Earpiece Mesh Replacement",
  "Proximity Sensor Cleaning",
  "Ambient Light Sensor Cleaning",
  "Lightning Port Dust Clear",
  "Microphone Mesh Replacement",
  "Mini-Flex Cable Re-seal",
  "Nano-Coating Application",
  "Housing Surface Polish",
  "Speaker Grill Re-seal",
  "Home Button Flex Re-seat",

  // Mid-Level Hardware Swaps (20)
  "Screen Assembly Replacement (LCD)",
  "Screen Assembly Replacement (OLED)",
  "Battery Pack Replacement",
  "Back Glass Replacement",
  "Rear Camera Module Swap",
  "Front Camera Module Swap",
  "Speaker Module Replacement",
  "Microphone Module Replacement",
  "Earpiece Module Replacement",
  "Button (Power/Volume) Replacement",
  "Charging Port Assembly Replacement",
  "SIM Tray Replacement",
  "Vibration Motor Replacement",
  "Housing / Frame Assembly Swap",
  "Proximity & Ambient Sensor Assembly",
  "Flash / Torch Module Replacement",
  "Wi-Fi Antenna Flex Replacement",
  "Bluetooth Antenna Flex Replacement",
  "GPS Antenna Flex Replacement",
  "NFC Coil Replacement",

  // Water & Corrosion Treatment (10)
  "Water Damage Cleaning",
  "Corrosion Neutralization Treatment",
  "Ultrasonic Board Cleaning",
  "Port-by-Port Reseal & Waterproofing",
  "Nano-Coating Reapplication",
  "Liquid-Damage Full Diagnostic",
  "Face ID Water Damage Repair",
  "Data Recovery from Liquid-Damaged Boards",
  "Salt-Air Corrosion Mitigation",
  "Post-Repair Waterproof Test",

  // Software, Locks & Activation (20)
  "iOS Update & Restore",
  "Error-Specific Recovery (4013/4014/9)",
  "Carrier Network SIM-Unlock",
  "IMEI/MEID Repair & Re-Programming",
  "Baseband Reflash & Recovery",
  "Activation Lock / MDM Bypass",
  "iTunes Error Repair Service",
  "Jailbreak & Custom Firmware",
  "Data Backup & Transfer",
  "Complete Factory Reset & Diagnostics",
  "App Performance Optimization",
  "Security Patch Installation",
  "Profile & Certificate Management",
  "VPN / Enterprise Config Setup",
  "iCloud Sync Troubleshooting",
  "Mail / Contacts Restore",
  "Screen Time & Restrictions Reset",
  "Touch ID/Face ID Re-enroll Service",
  "OTA Update Issue Fix",
  "Firmware Downgrade Service",

  // Board-Level / Microsoldering (30)
  "Charging IC (U2/Tristar/Tigris) Repair",
  "PMIC (Power Management IC) Repair",
  "Audio IC Repair",
  "Baseband IC Repair",
  "CPU Reballing / Reflow",
  "NAND Flash Repair / Upgrade",
  "Touch Controller IC Repair",
  "Backlight IC Filter Repair",
  "Display Connector Trace Repair",
  "Camera Connector Trace Repair",
  "Battery Connector Repair",
  "Wi-Fi / Bluetooth RF IC Repair",
  "Cellular RF / Network IC Repair",
  "TrueDepth / Face ID Module Board Rework",
  "Dot Projector Flex Microsoldering",
  "Mesh-Layer PCB Trace Repair",
  "Capacitor & Resistor-Level Replacement",
  "Backlight Circuit Microsoldering",
  "Solder Mask Touch-Up",
  "Board-to-Board Bridge Repair",
  "Micro-BGA IC Replacement",
  "Logic Board Short-Circuit Trace Repair",
  "Power-Consumption IC Calibration",
  "Ultrasonic BGA Ball Replacement",
  "EMI/RFI Filter IC Replacement",
  "Microcontroller IC Swap",
  "PCB Layer-Stack Re-lamination",
  "Flex Cable End-Reflow",
  "NFC / RFID Coil Microsoldering",
  "Pressure-Sensor IC Repair",

  // Premium Diagnostics & Specialty (20)
  "Standard Diagnostic Service",
  "Thermal Imaging Diagnostics",
  "Power-Consumption Profiling",
  "Short-Circuit Tracing Service",
  "Motherboard Multilayer Fault Analysis",
  "Boot Loop & Stuck-On-Logo Recovery",
  "Battery Health Calibration & Certification",
  "Pre-Repair Benchmarking Report",
  "Post-Repair Performance Report",
  "Overheating Issue Diagnosis",
  "Signal-Strength Calibration",
  "GPS-Error Diagnostics",
  "Liquid-Ingress Depth Analysis",
  "Salt-Air Corrosion Report",
  "Data Recovery from Dead Boards",
  "Firmware Integrity Verification",
  "Acoustic Diagnostics (Speaker/Mic)",
  "Camera Sensor Alignment Check",
  "EMI/RFI Noise Profiling",
  "Insurance Assessment & Quotation",
]

// 3. Grab all Apple models
const allIphoneNames = DEVICE_LIST.filter((d) => d.brandName === "Apple").map((d) => d.name)

// 4. Generator helper
const generate = (models, serviceName, categoryName) =>
  models.map((model) => ({
    baseName: `${model} ${serviceName}`.toUpperCase(),
    type: "service",
    brandName: "Apple",
    categoryName,
    deviceName: model,
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Service Revenue",
    cogsAccountName: "Cost of Goods Sold",
  }))

// 5. Build all templates, using serviceMap lookup
const generateServiceTemplates = () => {
  return SERVICE_NAMES.flatMap((svc) => {
    const category = serviceMap[svc] || "Device Repair Services"
    return generate(allIphoneNames, svc, category)
  })
}

// Usage
// const allServiceTemplates = generateServiceTemplates();
// console.log(`Generated ${allServiceTemplates.length} service templates`);

// ======================================================================
// MIGRATION ENGINE
// ======================================================================

const runMigrations = (rawData, attributeList) => {
  const templates = new Map()
  const attributeKeywords = new Map()
  attributeList.forEach((attr) => {
    attr.values.forEach((val) => {
      attributeKeywords.set(val.toUpperCase(), attr.key)
    })
  })

  rawData.forEach((item) => {
    let baseName = item.itemName.toUpperCase()
    const attributes = []

    // Extract attributes
    attributeKeywords.forEach((key, value) => {
      if (baseName.includes(value)) {
        attributes.push({ key, value: attributeList.find((a) => a.key === key).values.find((v) => v.toUpperCase() === value) })
        baseName = baseName.replace(value, "").trim()
      }
    })

    // Clean up baseName
    baseName = baseName.replace(/-/g, " ").replace(/ +/g, " ").trim()

    if (!templates.has(baseName)) {
      templates.set(baseName, {
        baseName: baseName,
        type: item.serialized ? "serialized" : "non-serialized",
        brandName: BRANDS.some((b) => b.name.toUpperCase() === item.brand.toUpperCase()) ? item.brand.toUpperCase() : "UNBRANDED",
        categoryName: item.category === "Spare Part" ? "Spare Parts" : "Accessories",
        attributeSetName: "TBD", // Placeholder
        variants: [],
      })
    }

    templates.get(baseName).variants.push({
      originalItemName: item.itemName,
      barcode: item.barcode,
      itemImage: item.itemImage,
      attributes: attributes,
    })
  })

  return Array.from(templates.values())
}

// Enhanced model mapping including XS
const extraModelMappings = {
  XS: { key: "model", value: "iPhone XS" },
  PRO: { key: "model", value: "iPhone Pro" },
  MAX: { key: "model", value: "iPhone Max" },
  PLUS: { key: "model", value: "iPhone Plus" },
  "X/XS": {
    key: "model",
    value: ["iPhone X", "iPhone XS"],
    split: true,
  },
  "12/12 PRO": {
    key: "model",
    value: ["iPhone 12", "iPhone 12 Pro"],
    split: true,
  },
  "13/13 PRO": {
    key: "model",
    value: ["iPhone 13", "iPhone 13 Pro"],
    split: true,
  },
  "14/14 PRO": {
    key: "model",
    value: ["iPhone 14", "iPhone 14 Pro"],
    split: true,
  },
  "15/15 PRO": {
    key: "model",
    value: ["iPhone 15", "iPhone 15 Pro"],
    split: true,
  },
}

// Brand normalization mapping
const brandMapping = {
  APL: "Apple",
  "APL CILICONE CASE": "Apple",
  "APL SILICONE": "Apple",
  APPL: "Apple",
  APLLE: "Apple",
  APLE: "Apple",
  MACAPL: "Apple",
  "IPHONE PARTS": "Apple",
  VDENMENV: "Vdenmenv",
  "G+OCA PRO": "G+OCA PRO",
  CELEBRAT: "Celebrate",
  ZAT: "ZAT",
  SPIGEN: "Spigen",
  Redington: "Redington",
  Xmart: "Xmart",
  "ATB KING KONG": "ATB King Kong",
  "Crystal Case": "Crystal Case",
  RECCI: "Recci",
}

const warrantyPlanMap = {
  "APPLE CARE": "Apple Care",
  "APPLE CARE+": "AppleCare+",
  "SAMSUNG CARE": "Samsung Care",
  "SAMSUNG CARE+": "Samsung Care+",
  CARE: "Standard Warranty",
}

const qualityTypeMap = {
  "C/O": "Copy",
  COPY: "Copy",
  CLONE: "Clone",
  AAA: "AAA",
  AA: "AA",
  A: "A",
  ORIGINAL: "Original",
  "OEM PULLED": "OEM Pulled",
  REFURBISHED: "Refurbished",
}
const plugTypeMap = {
  "3-PIN": "3-pin",
  "2-PIN": "2-pin",
  "UK PLUG": "UK Plug",
  "US PLUG": "US Plug",
  "EU PLUG": "EU Plug",
}

const protectedTerms = new Set([
  "ADAPTER",
  "CHARGER",
  "CABLE",
  "LIGHTNING",
  "POWER",
  "CARRY",
  "OVER",
  "TO",
  "CASE",
  "BATTERY",
  "GLASS",
  "SCREEN",
  "DISPLAY",
  "HOUSING",
  "ASSEMBLY",
  "CELL",
  "PACK",
  "DOCK",
  "EARBUDS",
  "HEADPHONES",
  "EARPHONES",
  "HANDSFREE",
  "STEREO",
  "WIRELESS",
  "PROTECTIVE",
  "LEATHER",
  "SILICONE",
  "TEMPERED",
  "PRIVACY",
  "CLEAR",
  "CHARGING",
  "BANK",
  "POWER BANK",
  "PORTABLE",
  "TOUCH",
  "LENS",
  "CAMERA",
  "MAGS",
  "MAGSAFE",
  "USB",
  "USB-C",
  "TYPE-C",
  "MICRO USB",
  "LIGHTNING CABLE",
  "POWER ADAPTER",
  "CHARGING CABLE",
  "FAST CHARGING",
  "DATA CABLE",
  "CARRY OVER",
])

const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const runMigrationss = () => {
  const templates = new Map()

  // Create attribute map with original values
  const attributeMap = new Map()

  // Populate from ATTRIBUTES
  ATTRIBUTES.forEach((attr) => {
    attr.values.forEach((val) => {
      const upperVal = val.toUpperCase()
      attributeMap.set(upperVal, {
        key: attr.key,
        originalValue: val,
      })
    })
  })

  // Add special model mappings
  Object.entries(extraModelMappings).forEach(([shortForm, mapping]) => {
    attributeMap.set(shortForm.toUpperCase(), {
      key: mapping.key,
      originalValue: mapping.value,
      split: mapping.split,
    })
  })

  // Add warranty plans
  Object.entries(warrantyPlanMap).forEach(([term, value]) => {
    attributeMap.set(term.toUpperCase(), {
      key: "warrantyPlan",
      originalValue: value,
    })
  })

  // Add quality types
  Object.entries(qualityTypeMap).forEach(([term, value]) => {
    attributeMap.set(term.toUpperCase(), {
      key: "quality_type",
      originalValue: value,
    })
  })

  // Add plug types
  Object.entries(plugTypeMap).forEach(([term, value]) => {
    attributeMap.set(term.toUpperCase(), {
      key: "plug_type",
      originalValue: value,
    })
  })

  // Get sorted values (longest first)
  const sortedValues = Array.from(attributeMap.keys()).sort((a, b) => b.length - a.length)

  // Get all brand names in uppercase
  const brandNames = BRANDS.map((b) => b.name.toUpperCase())

  MIGRATED_RAW_DATA.forEach((item) => {
    let baseName = item.itemName.toUpperCase()
    const attributes = []
    let brand = item.brand.toUpperCase()

    // Normalize brand
    if (brandMapping[brand]) {
      brand = brandMapping[brand].toUpperCase()
    } else {
      // Find best match
      const matchedBrand = Object.entries(brandMapping).find(([key]) => brand.includes(key) || brand.includes("APPLE"))
      if (matchedBrand) brand = matchedBrand[1].toUpperCase()
    }

    // Ensure brand is valid
    if (!brandNames.includes(brand)) {
      brand = "UNBRANDED"
    } else {
      // Get properly cased brand name
      brand = BRANDS.find((b) => b.name.toUpperCase() === brand).name
    }

    // Process attribute removal with word boundaries
    for (const value of sortedValues) {
      const mapping = attributeMap.get(value)
      const regex = new RegExp(`\\b${escapeRegExp(value)}\\b`, "g")

      if (regex.test(baseName)) {
        baseName = baseName.replace(regex, "")

        if (mapping.split) {
          // Handle split values (multiple models)
          mapping.originalValue.forEach((val) => {
            attributes.push({ key: mapping.key, value: val })
          })
        } else {
          attributes.push({
            key: mapping.key,
            value: mapping.originalValue,
          })
        }
      }
    }

    // Auto-set quality_type for Apple Care products
    const hasAppleCare = attributes.some((a) => a.key === "warrantyPlan" && a.value.includes("Apple Care"))

    if (hasAppleCare && !attributes.some((a) => a.key === "quality_type")) {
      attributes.push({
        key: "quality_type",
        value: "Original",
      })
    }

    // Special handling for technical specifications
    baseName = baseName
      .replace(/\b(\d+\.\d+[A-Z]?)\b/g, " $1 ") // Preserve specs like 3.1A
      .replace(/\b(\d+[A-Z]?)\s?W\b/gi, "$1W") // Preserve wattage
      .replace(/\b(USB-[A-Z])\b/gi, "$1") // Preserve USB-C
      .replace(/\s+/g, " ") // Collapse spaces
      .replace(/\s*[\/.,]\s*/g, " ") // Handle separators
      .replace(/\b(ADAPTER|CHARGER|CABLE)\b/gi, "") // Remove product type markers
      .trim()

    // Final cleanup of brand references
    const brandRemovalRegex = new RegExp(`\\b(${Object.keys(brandMapping).join("|")})\\b`, "gi")
    baseName = baseName.replace(brandRemovalRegex, "").trim()

    // Create template key (brand + baseName)
    const templateKey = `${brand}|${baseName}`

    if (!templates.has(templateKey)) {
      templates.set(templateKey, {
        baseName: baseName,
        type: item.serialized ? "serialized" : "non-serialized",
        brandName: brand,
        categoryName: item.category === "Spare Part" ? "Spare Parts" : "Accessories",
        attributeSetName: "General Specifications", // Temporary
        assetAccountName: "Inventory Asset",
        revenueAccountName: "Sales Revenue",
        cogsAccountName: "Cost of Goods Sold",
        variants: [],
        _allAttributeKeys: new Set(),
      })
    }

    const template = templates.get(templateKey)
    attributes.forEach((attr) => {
      template._allAttributeKeys.add(attr.key)
    })

    template.variants.push({
      originalItemName: item.itemName,
      barcode: item.barcode,
      itemImage: item.itemImage,
      attributes: attributes,
    })
  })

  // Assign attribute sets based on collected keys
  templates.forEach((template) => {
    const keys = Array.from(template._allAttributeKeys)
    template.attributeSetName = assignAttributeSet(keys)
    delete template._allAttributeKeys
  })

  return Array.from(templates.values())
}

const runMigration = () => {
  const templates = new Map()
  const attributeMap = new Map()

  // Create attribute map with original values
  ATTRIBUTES.forEach((attr) => {
    attr.values.forEach((val) => {
      const upperVal = val.toUpperCase()
      attributeMap.set(upperVal, {
        key: attr.key,
        originalValue: val,
      })
    })
  })

  // Add special model mappings
  Object.entries(extraModelMappings).forEach(([shortForm, mapping]) => {
    attributeMap.set(shortForm.toUpperCase(), {
      key: mapping.key,
      originalValue: mapping.value,
      split: mapping.split,
    })
  })

  // Add warranty plans
  Object.entries(warrantyPlanMap).forEach(([term, value]) => {
    attributeMap.set(term.toUpperCase(), {
      key: "warrantyPlan",
      originalValue: value,
    })
  })

  // Add quality types
  Object.entries(qualityTypeMap).forEach(([term, value]) => {
    attributeMap.set(term.toUpperCase(), {
      key: "quality_type",
      originalValue: value,
    })
  })

  // Add plug types
  Object.entries(plugTypeMap).forEach(([term, value]) => {
    attributeMap.set(term.toUpperCase(), {
      key: "plug_type",
      originalValue: value,
    })
  })

  // Get sorted values (longest first)
  const sortedValues = Array.from(attributeMap.keys()).sort((a, b) => b.length - a.length)

  // Get all brand names in uppercase
  const brandNames = BRANDS.map((b) => b.name.toUpperCase())

  // Critical product descriptors to preserve
  const protectedTerms = new Set([
    "ADAPTER",
    "CHARGER",
    "CABLE",
    "LIGHTNING",
    "POWER",
    "CARRY",
    "OVER",
    "TO",
    "CASE",
    "BATTERY",
    "GLASS",
    "SCREEN",
    "DISPLAY",
    "HOUSING",
    "ASSEMBLY",
    "CELL",
    "PACK",
    "DOCK",
    "EARBUDS",
    "HEADPHONES",
    "EARPHONES",
    "HANDSFREE",
    "STEREO",
    "WIRELESS",
    "PROTECTIVE",
    "LEATHER",
    "SILICONE",
    "TEMPERED",
    "PRIVACY",
    "CLEAR",
    "CHARGING",
    "BANK",
    "POWER BANK",
    "PORTABLE",
    "TOUCH",
    "LENS",
    "CAMERA",
    "MAGS",
    "MAGSAFE",
    "USB",
    "USB-C",
    "TYPE-C",
    "MICRO USB",
    "LIGHTNING CABLE",
    "POWER ADAPTER",
    "CHARGING CABLE",
    "FAST CHARGING",
    "DATA CABLE",
    "CARRY OVER",
  ])

  // Regex patterns to preserve technical specs
  const specPattern = /(\d+\.\d+[A-Z]?|\d+[A-Z]?W|\d+[A-Z]?[mAh]|\d+m)/i

  MIGRATED_RAW_DATA.forEach((item) => {
    let baseName = item.itemName.toUpperCase()
    const attributes = []
    let brand = item.brand.toUpperCase()

    // 1. Normalize brand
    if (brandMapping[brand]) {
      brand = brandMapping[brand]
    } else {
      // Find best match in brandMapping
      const matchedBrand = Object.entries(brandMapping).find(([key]) => brand.includes(key.toUpperCase()))
      brand = matchedBrand ? matchedBrand[1] : brand
    }

    // Ensure brand is valid
    if (!brandNames.includes(brand.toUpperCase())) {
      brand = "UNBRANDED"
    } else {
      // Get properly cased brand name
      brand = BRANDS.find((b) => b.name.toUpperCase() === brand.toUpperCase()).name
    }

    // 2. Remove brand name from baseName to prevent duplication
    const brandRegex = new RegExp(`\\b${escapeRegExp(brand.toUpperCase())}\\b`, "gi")
    baseName = baseName.replace(brandRegex, "").trim()

    // 3. Process attribute removal
    for (const value of sortedValues) {
      const mapping = attributeMap.get(value)
      if (!mapping) continue

      const regex = new RegExp(`\\b${escapeRegExp(value)}\\b`, "g")

      if (regex.test(baseName)) {
        // Check if term should be protected
        const isProtected = protectedTerms.has(value) || specPattern.test(value) || /[A-Z]\d{3}/.test(value) // Product codes like A620

        // Only remove non-protected terms
        if (!isProtected) {
          baseName = baseName.replace(regex, "")
        }

        // Always add to attributes
        if (mapping.split) {
          mapping.originalValue.forEach((val) => {
            attributes.push({ key: mapping.key, value: val })
          })
        } else {
          attributes.push({
            key: mapping.key,
            value: mapping.originalValue,
          })
        }
      }
    }

    // 4. Reconstruct baseName
    baseName = baseName
      .replace(/\s{2,}/g, " ") // Collapse multiple spaces
      .replace(/(^[-,]\s*)|(\s*[-,]$)/g, "") // Trim edge commas/dashes
      .replace(/^-\s*/, "") // Remove leading dash
      .trim()

    // 5. Fallback if name is destroyed
    if (!baseName || baseName.split(/\s+/).length < 2) {
      const meaningfulPart = item.itemName
        .replace(brandRegex, "")
        .split(",")[0] // Use first segment
        .replace(/(APPLE|SAMSUNG|GENERIC|REDINGTON)/i, "")
        .trim()

      baseName = meaningfulPart.length > 3 ? meaningfulPart.toUpperCase() : item.itemName.toUpperCase().replace(brandRegex, "").trim()
    }

    // 6. Ensure brand presence and proper formatting
    let finalBaseName = `${brand.toUpperCase()} - ${baseName}`

    // Fix double dash cases
    finalBaseName = finalBaseName
      .replace(/\s{2,}/g, " ")
      .replace(/(\w)-\s-/g, "$1-") // Fix "APPLE - - POWER"
      .replace(/\s-\s/g, "-") // Fix "APPLE - POWER"
      .replace(/(\w)-(\w)/g, "$1 $2") // Restore space in compound terms

    // 7. Handle special "TO" connector case
    if (baseName === "TO" && item.itemName.includes(" to ")) {
      const connectorParts = item.itemName.split(" to ")
      if (connectorParts.length > 1) {
        finalBaseName = `${brand.toUpperCase()} - ${connectorParts[0].toUpperCase()} TO ${connectorParts[1].toUpperCase()}`
      }
    }

    // Create template key (brand + baseName)
    const templateKey = `${brand}|${baseName}`

    if (!templates.has(templateKey)) {
      templates.set(templateKey, {
        baseName: finalBaseName,
        type: item.serialized ? "serialized" : "non-serialized",
        brandName: brand,
        categoryName: item.category === "Spare Part" ? "Spare Parts" : "Accessories",
        attributeSetName: "General Specifications", // Temporary
        assetAccountName: "Inventory Asset",
        revenueAccountName: "Sales Revenue",
        cogsAccountName: "Cost of Goods Sold",
        variants: [],
        _allAttributeKeys: new Set(),
      })
    }

    const template = templates.get(templateKey)
    attributes.forEach((attr) => {
      template._allAttributeKeys.add(attr.key)
    })

    template.variants.push({
      originalItemName: item.itemName,
      barcode: item.barcode,
      itemImage: item.itemImage,
      attributes: attributes,
    })
  })

  // Assign attribute sets based on collected keys
  templates.forEach((template) => {
    const keys = Array.from(template._allAttributeKeys)
    template.attributeSetName = assignAttributeSet(keys)
    delete template._allAttributeKeys
  })

  return Array.from(templates.values())
}

// ======================================================================
// DYNAMIC GENERATION ENGINES
// ======================================================================

// ======================================================================
// ATTRIBUTE SET LINKING ENGINE
// ======================================================================

/**
 * Finds the best-fitting AttributeSet for a given list of attribute keys.
 * @param {string[]} extractedKeys - An array of attribute keys found for a template.
 * @returns {string} The name of the best-matching AttributeSet.
 */

/**
 * Finds the best-fitting AttributeSet for a given list of attribute keys.
 * Enhanced with priority matching and minimum threshold requirements.
 *
 * @param {string[]} extractedKeys - Array of attribute keys found for a template
 * @param {string} defaultSet - Default set name if no good match found
 * @returns {string} Name of the best-matching AttributeSet
 */
const assignAttributeSet = (keys, defaultSet = "General Spare Part Specs") => {
  if (!keys || keys.length === 0) return defaultSet

  // Priority matching for special cases first
  const priorityMatches = {
    iPhone: ["model", "color", "storage", "quality_type"],
    Charger: ["power_rating", "connector_type"],
    Cable: ["length", "connector_type"],
    Display: ["display_type", "screen_size"],
    Battery: ["battery_capacity", "voltage"],
  }

  // Check priority matches
  for (const [type, requiredKeys] of Object.entries(priorityMatches)) {
    if (requiredKeys.every((k) => keys.includes(k))) {
      if (type === "iPhone") return "iPhone Specifications"
      if (type === "Charger") return "Charger & Adapter Specs"
      if (type === "Cable") return "Cable Specifications"
      if (type === "Display") return "Display Specifications"
      if (type === "Battery") return "Battery Specifications"
    }
  }

  // Find best match based on coverage score
  let bestMatch = { name: defaultSet, score: 0 }
  const MIN_SCORE_THRESHOLD = 40 // Minimum match percentage to accept

  ATTRIBUTE_SET_MASTER_LIST.forEach((set) => {
    const matchingKeys = set.attributeKeys.filter((key) => keys.includes(key))
    const coverageScore = (matchingKeys.length / set.attributeKeys.length) * 100
    const relevanceScore = (matchingKeys.length / keys.length) * 100
    const totalScore = (coverageScore + relevanceScore) / 2

    if (totalScore > bestMatch.score && totalScore > MIN_SCORE_THRESHOLD) {
      bestMatch = { name: set.name, score: totalScore }
    }
  })

  return bestMatch.name
}

const generateDeviceTemplates = () =>
  DEVICE_LIST.map((device) => ({
    baseName: device.name.toUpperCase(),
    type: "serialized",
    brandName: device.brandName.toUpperCase(),
    categoryName: device.categoryName,
    attributeSetName: assignAttributeSet(["model", "color", "storage", "ram"], "Smartphone Specifications"),
    deviceName: device.name,
    assetAccountName: "Inventory Asset",
    revenueAccountName: "Sales Revenue",
    cogsAccountName: "Cost of Goods Sold",
  }))

const generateComponentTemplates = () =>
  COMPONENT_LIST.flatMap((component) => {
    if (component.brandAgnostic) {
      return component.brands.map((brandName) => ({
        baseName: `${brandName} ${component.name}`.toUpperCase(),
        type: component.type,
        brandName: brandName.toUpperCase(),
        categoryName: component.categoryName,
        attributeSetName: component.attributeSetName,
        deviceName: null,
        assetAccountName: "Inventory Asset",
        revenueAccountName: "Sales Revenue",
        cogsAccountName: "Cost of Goods Sold",
      }))
    } else {
      return DEVICE_LIST.map((device) => ({
        baseName: `${component.name} for ${device.name}`.toUpperCase(),
        type: component.type,
        brandName: "UNBRANDED",
        categoryName: component.categoryName,
        attributeSetName: component.attributeSetName,
        deviceName: device.name,
        assetAccountName: "Inventory Asset",
        revenueAccountName: "Sales Revenue",
        cogsAccountName: "Cost of Goods Sold",
      }))
    }
  })

const generateServiceTemplatesa = () => {
  const allIphoneNames = DEVICE_LIST.filter((d) => d.brandName === "Apple").map((d) => d.name)
  const batteryModels = ["iPhone 14 Pro", "iPhone 13", "iPhone 12", "iPhone 11"]
  const generate = (models, service, category) =>
    models.map((model) => ({
      baseName: `${model} ${service}`.toUpperCase(),
      type: "service",
      brandName: "UNBRANDED",
      categoryName: category,
      deviceName: model,
      assetAccountName: "Inventory Asset",
      revenueAccountName: "Service Revenue",
      cogsAccountName: "Cost of Goods Sold",
    }))

  const screenServices = generate(allIphoneNames, "Screen Replacement", "Screen Replacement")
  const batteryServices = generate(batteryModels, "Battery Replacement", "Battery Replacement")

  return [...screenServices, ...batteryServices]
}

// ======================================================================
// FINAL ASSEMBLY
// ======================================================================
// NOTE: I am using a placeholder for MIGRATED_RAW_DATA
// In your project, you would replace this with the actual data.
// ======================================================================
// 4. FINAL ASSEMBLY
// ======================================================================
//const MIGRATED_TEMPLATES = runMigration()
const DEFAULT_DEVICES = generateDeviceTemplates()
const DEFAULT_COMPONENTS = generateComponentTemplates()
const DEFAULT_SERVICES = generateServiceTemplates()

//console.log("MIGRATED_TEMPLATES ", MIGRATED_TEMPLATES)
//const pretty = JSON.stringify(MIGRATED_TEMPLATES, null, 2)
//const fs = require("fs")
//const path = require("path")
const MIGRATED_TEMPLATES = require("./MIGRATED_TEMPLATES")

//const dest = path.resolve(__dirname, "MIGRATED_TEMPLATES.json")

// fs.writeFile(dest, pretty, "utf8", (err) => {
//   if (err) throw err
//   console.log("Masterlist saved at:", dest)
// })

const PRODUCT_TEMPLATE_MASTER_LIST = [...MIGRATED_TEMPLATES, ...DEFAULT_DEVICES, ...DEFAULT_COMPONENTS, ...DEFAULT_SERVICES]
module.exports = PRODUCT_TEMPLATE_MASTER_LIST
