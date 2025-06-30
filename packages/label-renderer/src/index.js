import bwipjs from "bwip-js";

import { createCanvas, registerFont } from "canvas";

// --- Debugging & Isomorphic Setup ---
const DEBUG_MODE = true; // Set to false in production to disable logs
const logDebug = (...args) => DEBUG_MODE && console.log("[LabelRenderer]", ...args);
const logError = (...args) => console.error("[LabelRenderer:ERROR]", ...args);

let canvas = null;
let ctx = null;
const IS_BROWSER = typeof window !== "undefined" && typeof window.document !== "undefined";

logDebug(`Environment detected: ${IS_BROWSER ? "Browser" : "Node.js"}`);

/**
 * This function initializes the canvas context. It's synchronous in the browser
 * but asynchronous on the backend due to dynamic imports.
 * @returns {Promise<CanvasRenderingContext2D|null>}
 */
async function initializeCanvas() {
  if (IS_BROWSER) {
    // In the browser, the setup is instant.
    canvas = window.document.createElement("canvas");
    return canvas.getContext("2d");
  } else {
    // On the backend, we must dynamically import Node.js-specific modules.
    try {
      const { createCanvas, registerFont } = await import("canvas");
      const path = await import("path");

      canvas = createCanvas(200, 200);
      const nodeCtx = canvas.getContext("2d");

      // `__dirname` is not available in ES Modules. A common pattern is to use import.meta.url.
      const { fileURLToPath } = await import("url");
      const currentDir = path.dirname(fileURLToPath(import.meta.url));

      // The path is now relative to the current file's directory.
      const fontPath = path.join(currentDir, "..", "assets", "fonts");

      console.log(`[LabelRenderer] Backend mode: Registering fonts from path: ${fontPath}`);
      registerFont(path.join(fontPath, "RobotoCondensed-Regular.ttf"), { family: "Roboto Condensed" });
      registerFont(path.join(fontPath, "RobotoCondensed-Bold.ttf"), { family: "Roboto Condensed", weight: "bold" });
      registerFont(path.join(fontPath, "OCR-BK.otf"), { family: "OCR-B" });

      return nodeCtx;
    } catch (e) {
      console.error("[LabelRenderer:ERROR] Node.js canvas context or font registration failed:", e);
      return null;
    }
  }
}

// Create a promise that resolves with the canvas context.
// All rendering functions will await this promise to ensure setup is complete.
const initPromise = initializeCanvas().then((context) => {
  ctx = context;
  return ctx;
});

/**
 * An optimized, isomorphic function to measure a block of text, handling word wrapping.
 */
async function measureTextBlock(text, fontSizePt, fontWeight, fontFamily, maxWidthMm, maxHeightMm) {
  await initPromise; // Ensure canvas is ready
  if (!ctx) {
    logDebug(`MeasureTextBlock CTX not found\n`);
    return { lines: [text], fits: false };
  }

  const words = text.split(" ");
  ctx.font = `${fontWeight} ${fontSizePt}pt "${fontFamily}"`;
  const lineHeightMm = (fontSizePt * 0.85 * 1.333) / 3.7795;
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidthMm = ctx.measureText(testLine).width / 3.7795;
    if (testWidthMm <= maxWidthMm) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
      if (ctx.measureText(currentLine).width / 3.7795 > maxWidthMm) {
        logDebug(`Auto-fit fail: Word "${word}" at ${fontSizePt}pt is wider than the container.`);
        return { lines, fits: false };
      }
    }
  }
  if (currentLine) lines.push(currentLine);

  const totalHeightMm = lines.length * lineHeightMm;
  const fits = totalHeightMm <= maxHeightMm;
  logDebug(
    `Measuring Text: "${text.substring(0, 20)}..." at ${fontSizePt}pt. Calculated height: ${totalHeightMm.toFixed(
      2
    )}mm. Fits in ${maxHeightMm.toFixed(2)}mm? ${fits}`
  );

  return { lines, fits };
}

function measureTextBlockOld(text, fontSizePt, fontWeight, fontFamily, maxWidthMm) {
  if (!ctx) return { lines: [text], requiredHeight: 5, requiredWidth: 20 };
  const words = text.split(" ");
  ctx.font = `${fontWeight} ${fontSizePt}pt "${fontFamily}"`;
  const lineHeightMm = (fontSizePt * 1.2 * 1.333) / 3.7795;
  const lines = [];
  let currentLine = "";
  let widestLine = 0;

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    const testWidthMm = metrics.width / 3.7795;
    if (testWidthMm <= maxWidthMm && !testLine.includes("\n")) {
      currentLine = testLine;
      if (testWidthMm > widestLine) widestLine = testWidthMm;
    } else {
      if (currentLine) lines.push(currentLine);
      const wordMetrics = ctx.measureText(word);
      if (wordMetrics.width / 3.7795 > widestLine) widestLine = wordMetrics.width / 3.7795;
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  return { lines, requiredHeight: lines.length * lineHeightMm, requiredWidth: widestLine };
}

export const getFieldData = (fieldPath, data, baseCurrencyCode = "USD") => {
  if (!fieldPath || !data) return "";
  const value = fieldPath.split(".").reduce((o, i) => (o ? o[i] : ""), data);
  if (value === null || value === undefined || value === "") return "";

  if (fieldPath === "sellingPrice") {
    const price = Number(value);
    if (!isNaN(price)) {
      try {
        const formattedPrice = new Intl.NumberFormat(undefined, {
          style: "currency",
          currency: baseCurrencyCode,
        }).format(price);
        logDebug(`Formatting currency for field '${fieldPath}'. Input: ${value}, Output: ${formattedPrice}`);
        return formattedPrice;
      } catch (e) {
        logDebug(`ERROR formatting currency: Invalid code '${baseCurrencyCode}'.`);
        return `${baseCurrencyCode} ${price.toFixed(2)}`;
      }
    }
  }
  return value;
};

export async function generateCodeSvg(element, itemData) {
  const textToEncode = getFieldData(element.dataField, itemData) || "NO-DATA";
  logDebug(`Generating barcode for element '${element.id}' with text: "${textToEncode}"`);
  if (textToEncode === "NO-DATA") {
    const errorSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="30" viewBox="0 0 100 30"><text x="50" y="20" font-family="Arial" font-size="10" fill="red" text-anchor="middle">NO DATA</text></svg>`;
    const base64 = IS_BROWSER ? btoa(errorSvg) : Buffer.from(errorSvg).toString("base64");
    return `data:image/svg+xml;base64,${base64}`;
  }
  try {
    let svg = await bwipjs.toSVG({
      bcid: element.type === "qrcode" ? "qrcode" : "code128",
      text: textToEncode,
      scale: element.barDensity || 1,
      height: 10,
      includetext: true,
      textfont: "OCR-B",
      textsize: 10,
      textxalign: "center",
    });
    svg = svg.replace("<svg ", '<svg preserveAspectRatio="none" ');
    const base64 = IS_BROWSER ? btoa(unescape(encodeURIComponent(svg))) : Buffer.from(svg).toString("base64");
    return `data:image/svg+xml;base64,${base64}`;
  } catch (e) {
    logDebug(`ERROR generating barcode for element '${element.id}':`, e.message);
    const errorSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="30" viewBox="0 0 100 30"><text x="50" y="20" font-family="Arial" font-size="12" fill="red" text-anchor="middle">ERROR</text></svg>`;
    const base64 = IS_BROWSER ? btoa(errorSvg) : Buffer.from(errorSvg).toString("base64");
    return `data:image/svg+xml;base64,${base64}`;
  }
}

async function renderElementOld(element, itemData, calculatedLayout, zIndex = 1, baseCurrencyCode = "USD") {
  const { x, y, width, height } = calculatedLayout;
  logDebug(
    `\nRendering element '${element.dataField}' (${element.type}) at [x: ${x.toFixed(2)}, y: ${y.toFixed(2)}, w: ${width.toFixed(
      2
    )}, h: ${height.toFixed(2)}]`
  );

  let elementStyle = `
      position: absolute; left: ${x}mm; top: ${y}mm; width: ${width}mm; height: ${height}mm;
      z-index: ${zIndex}; color: black; font-weight: ${element.fontWeight || "normal"};
      font-family: 'OCR-B','Arial Narrow', sans-serif;
      font-size: ${element.fontSize || 8}pt; line-height: 0.85; box-sizing: border-box;
      text-align: center; display: flex; align-items: center; justify-content: ${element.align || "center"};
  `;
  let innerHtml = "";

  if (element.type === "text") {
    let fontSize = element.fontSize || 10;
    const fontFamily = "OCR-B";
    const fontWeight = element.fontWeight || "normal";
    const rawText = getFieldData(element.dataField, itemData, baseCurrencyCode);

    let finalLines = [rawText];
    let finalFontSize = fontSize;

    logDebug(`Starting auto-fit for element '${element.dataField}' with initial font size: ${fontSize}pt.`);
    let bestFitLines = [];
    while (fontSize >= 4) {
      const block = measureTextBlock(rawText, fontSize, fontWeight, fontFamily, width, height);
      if (block.fits) {
        finalFontSize = fontSize;
        bestFitLines = block.lines;
        logDebug(`SUCCESS: Found fit for '${element.dataField}' at font size: ${finalFontSize}pt.`);
        break;
      }
      fontSize -= 0.5;
    }

    if (bestFitLines.length > 0) {
      finalLines = bestFitLines;
    } else {
      logDebug(`WARNING: Could not fit text for '${element.dataField}' within bounds. Using smallest font size.`);
      finalFontSize = 5; // Use the smallest font size if no fit was found
    }

    elementStyle += `font-size: ${finalFontSize}pt;`;
    innerHtml = finalLines.join("<br />");
  } else if (element.type === "barcode" || element.type === "qrcode") {
    const dataUrl = await generateCodeSvg(element, itemData);
    innerHtml = `<img src="${dataUrl}" style="width: 100%; height: 100%; object-fit: fill;" />`;
  }

  return `<div style="${elementStyle}">${innerHtml}</div>`;
}

export async function generateLabelHtmlOld(template, itemData, baseCurrencyCode = "USD") {
  const { labelWidth, labelHeight, content } = template;
  logDebug(`Generating label HTML for template: "${template.name}" (${labelWidth}x${labelHeight}mm)`);
  let contentHtml = "";
  const PADDING = 2.5;
  const skuBarcodeElement = content.find((el) => el.dataField === "sku" && el.type === "barcode");

  if (skuBarcodeElement) {
    logDebug("Applying 'Smart Layout' based on SKU barcode.");
    const productNameElement = content.find((el) => el.dataField === "variantName");
    const priceElement = content.find((el) => el.dataField === "sellingPrice");

    const skuLayout = {
      x: PADDING,
      y: labelHeight / 3,
      width: labelWidth - PADDING * 2,
      height: labelHeight / 3,
    };
    contentHtml += await renderElement(skuBarcodeElement, itemData, skuLayout, 1, baseCurrencyCode);

    if (productNameElement) {
      logDebug("Applying 'Smart Layout' based on productNameElement.");
      const nameLayout = {
        x: PADDING,
        y: PADDING,
        width: labelWidth - PADDING * 2,
        height: labelHeight / 3 - PADDING,
      };
      contentHtml += await renderElement(productNameElement, itemData, nameLayout, 2, baseCurrencyCode);
    }
    if (priceElement) {
      const priceWidth = labelWidth - PADDING * 2; //labelWidth * 0.5;
      const priceLayout = {
        x: labelWidth - priceWidth - PADDING,
        y: skuLayout.y + skuLayout.height + PADDING,
        width: priceWidth,
        height: labelHeight - (skuLayout.y + skuLayout.height) - PADDING * 2,
      };
      priceElement.align = "right";
      contentHtml += await renderElement(priceElement, itemData, priceLayout, 2, baseCurrencyCode);
    }

    const handledIds = [skuBarcodeElement.id, productNameElement?.id, priceElement?.id];
    const otherElements = content.filter((el) => !handledIds.includes(el.id));
    for (const element of otherElements) {
      logDebug(`Rendering additional element '${element.id}' with its saved position.`);
      const clampedLayout = {
        x: Math.max(0, element.x),
        y: Math.max(0, element.y),
        width: Math.min(element.width, labelWidth - element.x),
        height: Math.min(element.height, labelHeight - element.y),
      };
      contentHtml += await renderElement(element, itemData, clampedLayout, 3, baseCurrencyCode);
    }
  } else {
    logDebug("Applying 'Fallback Clamping Layout' (no SKU barcode found).");
    for (const element of content || []) {
      const safeLayout = {
        x: Math.max(0, element.x),
        y: Math.max(0, element.y),
        width: Math.max(0, Math.min(element.width || labelWidth - element.x, labelWidth - element.x)),
        height: Math.max(0, Math.min(element.height || 10, labelHeight - element.y)),
      };
      contentHtml += await renderElement(element, itemData, safeLayout, 1, baseCurrencyCode);
    }
  }

  const labelStyle = `width: ${labelWidth}mm; height: ${labelHeight}mm; position: relative; box-sizing: border-box; overflow: hidden; background: white; border: 1px solid #ccc;`;
  return `<div class="label" style="${labelStyle}">${contentHtml}</div>`;
}

/**
 * Generates print-ready HTML using a professional, measurement-first layout algorithm.
 */
export async function generateLabelHtml2(template, itemData, baseCurrencyCode = "USD") {
  const { labelWidth, labelHeight, content } = template;
  let contentHtml = "";
  const PADDING = 2;

  // --- 1. Measurement Pass ---
  // First, calculate the *actual* space needed by each text element.
  const measuredElements = content.map((el) => {
    if (el.type === "text") {
      const rawText = getFieldData(el.dataField, itemData, baseCurrencyCode);
      const measured = measureTextBlock(rawText, el.fontSize, el.fontWeight, el.fontFamily, el.width || labelWidth - PADDING * 2);
      return { ...el, requiredHeight: measured.requiredHeight, lines: measured.lines };
    }
    // For barcodes, the height is defined by the user.
    return { ...el, requiredHeight: el.height };
  });

  // --- 2. Intelligent Layout Calculation ---
  // Now, arrange these measured elements dynamically.
  const productName = measuredElements.find((el) => el.dataField === "variantName");
  const skuBarcode = measuredElements.find((el) => el.dataField === "sku" && el.type === "barcode");
  const price = measuredElements.find((el) => el.dataField === "sellingPrice");

  const barcodeHeight = skuBarcode ? skuBarcode.requiredHeight : labelHeight * 0.3;
  const barcodeY = labelHeight / 2 - barcodeHeight / 2;

  // Layout for Barcode
  if (skuBarcode) {
    const layout = { x: PADDING, y: barcodeY, width: labelWidth - PADDING * 2, height: barcodeHeight, fontSize: skuBarcode.fontSize };
    contentHtml += await renderElement(skuBarcode, itemData, layout, baseCurrencyCode);
  }

  // Layout for Product Name
  if (productName) {
    const layout = {
      x: PADDING,
      y: PADDING,
      width: labelWidth - PADDING * 2,
      height: barcodeY - PADDING * 2, // Fill space above barcode
      lines: productName.lines,
      fontSize: productName.fontSize,
    };
    productName.align = "left";
    contentHtml += await renderElement(productName, itemData, layout, baseCurrencyCode);
  }

  // Layout for Price
  if (price) {
    const priceY = barcodeY + barcodeHeight + PADDING;
    const layout = {
      x: PADDING,
      y: priceY,
      width: labelWidth - PADDING * 2,
      height: labelHeight - priceY - PADDING, // Fill space below barcode
      lines: price.lines,
      fontSize: price.fontSize,
    };
    price.align = "right";
    contentHtml += await renderElement(price, itemData, layout, baseCurrencyCode);
  }

  const labelStyle = `
    width: ${labelWidth}mm; height: ${labelHeight}mm; position: relative;
    box-sizing: border-box; overflow: hidden; background: white; border: 1px solid #ccc;
  `;
  return `<div class="label" style="${labelStyle}">${contentHtml}</div>`;
}

async function renderElement(element, itemData, layout, baseCurrencyCode) {
  await initPromise; // Ensure canvas is ready
  const { x, y, width, height } = layout; // Use the calculated layout from parent

  logDebug(
    `\nRendering element '${element.dataField}' (${element.type}) at [x: ${x.toFixed(2)}, y: ${y.toFixed(2)}, w: ${width.toFixed(
      2
    )}, h: ${height.toFixed(2)}]`
  );

  let elementStyle = `
        position: absolute; left: ${x}mm; top: ${y}mm; width: ${width}mm; height: ${height}mm;
        color: black; font-weight: ${element.fontWeight || "normal"};
        font-family: '${element.fontFamily || "Roboto Condensed"}', sans-serif;
        box-sizing: border-box; display: flex; align-items: center;
        justify-content: ${element.align || "center"};
        line-height: 1.1; /* A tight line height is good for labels */
    `;
  let innerHtml = "";

  if (element.type === "text") {
    let fontSize = element.fontSize || 12; // Start with a generous font size
    const rawText = getFieldData(element.dataField, itemData, baseCurrencyCode) || `[${element.dataField}]`;
    let finalLines = [rawText];
    let bestFitFontSize = 4; // Default to a minimum readable font size

    // --- BRUTAL AUTO-FITTING LOGIC ---
    // This loop shrinks the font size until the text block fits within the given height.
    while (fontSize >= 4) {
      const block = await measureTextBlock(rawText, fontSize, element.fontWeight, element.fontFamily, width, height);
      console.log({ block });
      if (block.fits) {
        // We found the largest possible font size that works.
        bestFitFontSize = fontSize;
        finalLines = block.lines;
        break; // Exit the loop
      }
      fontSize -= 0.5; // Decrease font size and try again
    }

    // Apply the final calculated font size
    elementStyle += `font-size: ${bestFitFontSize}pt;`;
    // Join the measured lines with <br> tags for multi-line HTML
    innerHtml = finalLines.join("<br />");
  } else if (element.type === "barcode" || element.type === "qrcode") {
    const dataUrl = await generateCodeSvg(element, itemData);
    innerHtml = `<img src="${dataUrl}" style="width: 100%; height: 100%; object-fit: fill;" />`;
  }

  return `<div style="${elementStyle}">${innerHtml}</div>`;
}

/**
 * Generates print-ready HTML using a professional, measurement-first layout algorithm.
 */
export async function generateLabelHtml(template, itemData, baseCurrencyCode = "USD") {
  await initPromise; // Ensure canvas is ready
  const { labelWidth, labelHeight, content } = template;
  let contentHtml = "";
  const PADDING = 2;

  // --- Measurement Pass ---
  const measuredElements = content.map((el) => {
    if (el.type === "text") {
      const rawText = getFieldData(el.dataField, itemData, baseCurrencyCode);
      // We no longer need to measure here, the renderer will do it.
      return { ...el, rawText };
    }
    return el;
  });

  // --- Intelligent Layout Calculation ---
  const productName = measuredElements.find((el) => el.dataField === "variantName");
  const skuBarcode = measuredElements.find((el) => el.dataField === "sku" && el.type === "barcode");
  const price = measuredElements.find((el) => el.dataField === "sellingPrice");

  // Use the user-defined height for the barcode if available, otherwise default.
  const barcodeHeight = skuBarcode?.height || labelHeight * 0.3;
  const barcodeY = labelHeight / 2 - barcodeHeight / 2;

  // Layout for Barcode
  if (skuBarcode) {
    const layout = { x: PADDING, y: barcodeY, width: labelWidth - PADDING * 2, height: barcodeHeight };
    contentHtml += await renderElement(skuBarcode, itemData, layout, baseCurrencyCode);
  }

  // Layout for Product Name
  if (productName) {
    const layout = {
      x: PADDING,
      y: PADDING,
      width: labelWidth - PADDING * 2,
      height: barcodeY - PADDING * 2, // Fill space above barcode
    };
    productName.align = "left";
    contentHtml += await renderElement(productName, itemData, layout, baseCurrencyCode);
  }

  // Layout for Price
  if (price) {
    const priceY = barcodeY + barcodeHeight + PADDING;
    const layout = {
      x: PADDING,
      y: priceY,
      width: labelWidth - PADDING * 2,
      height: labelHeight - priceY - PADDING, // Fill space below barcode
    };
    price.align = "right";
    contentHtml += await renderElement(price, itemData, layout, baseCurrencyCode);
  }

  const labelStyle = `
    width: ${labelWidth}mm; height: ${labelHeight}mm; position: relative;
    box-sizing: border-box; overflow: hidden; background: white; border: 1px solid #ccc;
  `;
  return `<div class="label" style="${labelStyle}">${contentHtml}</div>`;
}
