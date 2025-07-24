const defaultLabelTemplates = [
  // ====================================================================
  // 1. Standard Product Price Tag (for Rolls)
  // Purpose: A compact, professional price tag for individual items.
  // ====================================================================
  {
    name: "Standard Product Price Tag (40mm x 25mm)",
    description: "A standard retail price tag for small to medium products, designed for rolls.",
    paperType: "roll",
    paperSize: "custom",
    labelWidth: 40,
    labelHeight: 25,
    isDefault: true,
    content: [
      {
        id: "el_price_tag_1",
        type: "text",
        dataField: "variantName",
        x: 2,
        y: 2,
        width: 36,
        height: 8,
        fontSize: 8,
        fontWeight: "bold",
        fontFamily: "Arial",
        align: "left",
      },
      {
        id: "el_price_tag_2",
        type: "text",
        dataField: "sellingPrice",
        x: 2,
        y: 10,
        width: 36,
        height: 7,
        fontSize: 12,
        fontWeight: "bold",
        fontFamily: "Arial",
        align: "right",
      },
      {
        id: "el_price_tag_3",
        type: "barcode",
        dataField: "sku",
        x: 2,
        y: 18,
        width: 36,
        height: 5,
        barDensity: 1,
      },
    ],
  },

  // ====================================================================
  // 2. Internal Inventory Asset Tag (for Warehousing)
  // Purpose: A clear, scannable label for internal stock management.
  // ====================================================================
  {
    name: "Internal Inventory Asset Tag (50mm x 25mm)",
    description: "For tracking items in the warehouse. Features a large SKU and a QR code for quick lookups.",
    paperType: "roll",
    paperSize: "custom",
    labelWidth: 50,
    labelHeight: 25,
    content: [
      {
        id: "el_asset_tag_1",
        type: "text",
        dataField: "sku",
        x: 2,
        y: 2,
        width: 30,
        height: 8,
        fontSize: 10,
        fontWeight: "bold",
        fontFamily: "OCR-B",
        align: "left",
      },
      {
        id: "el_asset_tag_2",
        type: "text",
        dataField: "variantName",
        x: 2,
        y: 11,
        width: 30,
        height: 12,
        fontSize: 7,
        fontWeight: "normal",
        fontFamily: "Arial",
        align: "left",
      },
      {
        id: "el_asset_tag_3",
        type: "qrcode",
        dataField: "sku", // QR code encodes the SKU for scanner apps
        x: 34,
        y: 2,
        width: 14,
        height: 14,
      },
    ],
  },

  // ====================================================================
  // 3. Customer Repair Intake Tag
  // Purpose: The critical tag attached to a customer's device upon service intake.
  // ====================================================================
  {
    name: "Customer Repair Intake Tag (76mm x 38mm)",
    description: "A detailed tag for service items, including customer details and a scannable ticket ID.",
    paperType: "roll",
    paperSize: "custom",
    labelWidth: 76,
    labelHeight: 38,
    content: [
      {
        id: "el_repair_tag_1",
        type: "text",
        text: "{{tenant.companyName}}", // This uses a special placeholder for the tenant's name
        x: 2,
        y: 2,
        width: 72,
        height: 6,
        fontSize: 10,
        fontWeight: "bold",
        fontFamily: "Arial",
        align: "center",
      },
      {
        id: "el_repair_tag_2",
        type: "barcode",
        dataField: "ticket.ticketId",
        x: 13,
        y: 9,
        width: 50,
        height: 10,
        barDensity: 1.5,
      },
      {
        id: "el_repair_tag_3",
        type: "text",
        dataField: "customer.name",
        x: 2,
        y: 22,
        width: 40,
        height: 5,
        fontSize: 9,
        fontWeight: "bold",
        fontFamily: "Arial",
        align: "left",
      },
      {
        id: "el_repair_tag_4",
        type: "text",
        dataField: "device.name",
        x: 2,
        y: 28,
        width: 40,
        height: 8,
        fontSize: 8,
        fontWeight: "normal",
        fontFamily: "Arial",
        align: "left",
      },
      {
        id: "el_repair_tag_5",
        type: "qrcode",
        dataField: "ticket.portalUrl", // QR code links to the customer portal tracking page
        x: 56,
        y: 20,
        width: 18,
        height: 18,
      },
    ],
  },

  // ====================================================================
  // 4. A4 Sheet of Multi-Purpose Labels
  // Purpose: A standard template for printing multiple small labels on a single A4 sheet.
  // ====================================================================
  {
    name: "A4 Sheet - Multi-Purpose Labels (38x21mm, 65 per page)",
    description: "A standard Avery-style template for printing 65 small labels on an A4 sheet.",
    paperType: "sheet",
    paperSize: "A4",
    labelWidth: 38.1,
    labelHeight: 21.2,
    columns: 5,
    rows: 13,
    horizontalGap: 2.5,
    verticalGap: 0,
    marginTop: 10.7,
    marginLeft: 4.65,
    content: [
      {
        id: "el_a4_tag_1",
        type: "text",
        dataField: "variantName",
        x: 1,
        y: 1,
        width: 36.1,
        height: 10,
        fontSize: 7,
        fontWeight: "normal",
        fontFamily: "Arial",
        align: "center",
      },
      {
        id: "el_a4_tag_2",
        type: "barcode",
        dataField: "sku",
        x: 1,
        y: 12,
        width: 36.1,
        height: 8.2,
        barDensity: 0.8,
      },
    ],
  },
];

module.exports = defaultLabelTemplates;
