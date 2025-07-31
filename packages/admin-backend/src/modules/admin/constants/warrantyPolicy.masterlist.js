const warrantyPolicyList = [
  {
    name: "1-Year Standard Manufacturer Warranty",
    description:
      "Covers manufacturer defects and hardware failures for one year from the date of purchase. Does not cover accidental damage.",
    durationValue: 1,
    durationUnit: "years",
    isActive: true,
  },
  {
    name: "90-Day Service & Repair Warranty",
    description: "Guarantees parts and labor for any service or repair performed by our technicians for 90 days.",
    durationValue: 90,
    durationUnit: "days",
    isActive: true,
  },
  {
    name: "6-Month Refurbished Product Warranty",
    description: "A limited warranty covering functional defects on pre-owned and refurbished products for six months.",
    durationValue: 6,
    durationUnit: "months",
    isActive: true,
  },
  {
    name: "30-Day Accessory Warranty",
    description: "Covers defects for accessories like chargers, cables, and cases for 30 days from the purchase date.",
    durationValue: 30,
    durationUnit: "days",
    isActive: true,
  },
  {
    name: "2-Year Extended Protection Plan",
    description: "An optional extended warranty that covers hardware failures and includes one instance of accidental damage protection.",
    durationValue: 2,
    durationUnit: "years",
    isActive: true,
  },
  {
    name: "No Warranty (As-Is)",
    description: "This item is sold as-is and does not include any warranty coverage.",
    durationValue: 0,
    durationUnit: "days",
    isActive: false,
  },
]

module.exports = warrantyPolicyList
