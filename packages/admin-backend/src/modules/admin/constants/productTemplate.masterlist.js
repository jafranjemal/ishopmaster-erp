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

const runMigration = () => {
  const templates = new Map()
  const attributeKeywords = new Map()
  ATTRIBUTES.forEach((attr) => {
    attr.values.forEach((val) => attributeKeywords.set(val.toUpperCase(), attr.key))
  })

  const upperCaseBrands = BRANDS.map((b) => b.name.toUpperCase())

  MIGRATED_RAW_DATA.forEach((item) => {
    let baseName = item.itemName.toUpperCase()
    const attributes = []

    attributeKeywords.forEach((key, value) => {
      if (baseName.includes(value)) {
        const originalValue = ATTRIBUTES.find((a) => a.key === key).values.find((v) => v.toUpperCase() === value)
        attributes.push({ key, value: originalValue })
        baseName = baseName.replace(value, "")
      }
    })

    baseName = baseName.replace(/-/g, " ").replace(/ +/g, " ").trim()

    if (!templates.has(baseName)) {
      const allVariantKeys = new Set(attributes.map((a) => a.key))
      templates.set(baseName, {
        baseName: baseName,
        type: item.serialized ? "serialized" : "non-serialized",
        brandName: upperCaseBrands.includes(item.brand.toUpperCase()) ? item.brand.toUpperCase() : "UNBRANDED",
        categoryName: item.category === "Spare Part" ? "Spare Parts" : "Accessories",
        attributeSetName: assignAttributeSet(Array.from(allVariantKeys)),
        variants: [],
        _allVariantKeys: allVariantKeys,
      })
    }

    const template = templates.get(baseName)
    attributes.forEach((attr) => template._allVariantKeys.add(attr.key))
    template.variants.push({
      originalItemName: item.itemName,
      barcode: item.barcode,
      itemImage: item.itemImage,
      attributes: attributes,
    })
  })

  // Final pass to update attribute sets with all keys
  Array.from(templates.values()).forEach((template) => {
    template.attributeSetName = assignAttributeSet(Array.from(template._allVariantKeys))
    delete template._allVariantKeys
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
const assignAttributeSet = (keys, defaultSet = "General Spare Part Specs") => {
  let bestMatch = { name: defaultSet, score: 0 }
  if (!keys || keys.length === 0) return bestMatch.name

  ATTRIBUTE_SET_MASTER_LIST.forEach((set) => {
    const matchCount = set.attributeKeys.filter((key) => keys.includes(key)).length
    const completeness = (matchCount / keys.length) * 100
    if (completeness > bestMatch.score) {
      bestMatch = { name: set.name, score: completeness }
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
const MIGRATED_TEMPLATES = runMigration()
const DEFAULT_DEVICES = generateDeviceTemplates()
const DEFAULT_COMPONENTS = generateComponentTemplates()
const DEFAULT_SERVICES = generateServiceTemplates()

const PRODUCT_TEMPLATE_MASTER_LIST = [...MIGRATED_TEMPLATES, ...DEFAULT_DEVICES, ...DEFAULT_COMPONENTS, ...DEFAULT_SERVICES]
module.exports = PRODUCT_TEMPLATE_MASTER_LIST
