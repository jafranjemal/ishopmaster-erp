const bwipjs = require("bwip-js");

/**
 * The BarcodeService is responsible for generating print-ready HTML
 * for product labels based on user-defined templates.
 */
class BarcodeService {
  /**
   * Generates a complete HTML document for printing labels.
   * @param {object} template - The LabelTemplate document.
   * @param {Array<object>} items - The items (e.g., variants or lots) to print labels for.
   * @returns {Promise<string>} A string containing the full HTML document.
   */
  async generatePrintHtml(template, items) {
    const {
      paperType,
      paperSize,
      labelWidth,
      labelHeight,
      horizontalGap,
      verticalGap,
      marginTop,
      marginLeft,
      columns,
      rows,
      content,
    } = template;

    const style = this._generatePrintCss({
      paperSize,
      labelWidth,
      labelHeight,
      horizontalGap,
      verticalGap,
      marginTop,
      marginLeft,
      columns,
    });

    const bodyContent = await this._generateLabels(content, items);

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Print Labels</title>
          <style>${style}</style>
      </head>
      <body>
          <div class="page">
            ${bodyContent}
          </div>
      </body>
      </html>
    `;
  }

  /**
   * Dynamically generates styles aligned with label config
   */
  _generatePrintCss(options) {
    return `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
      body {
        margin: 0;
        color: black;
        font-family: 'Inter', sans-serif;
      }
      .page {
        width: ${options.paperSize === "A4" ? "210mm" : "auto"};
        min-height: ${options.paperSize === "A4" ? "297mm" : "auto"};
        padding: ${options.marginTop}mm ${options.marginLeft}mm;
        box-sizing: border-box;
        display: grid;
        grid-template-columns: repeat(${options.columns}, ${
      options.labelWidth
    }mm);
        gap: ${options.verticalGap}mm ${options.horizontalGap}mm;
        align-content: start;
      }
      .label {
        width: ${options.labelWidth}mm;
        height: ${options.labelHeight}mm;
        position: relative;
        box-sizing: border-box;
        overflow: hidden;
        outline: 1px dashed #ccc;
      }
      .element {
        position: absolute;
        color: black;
      }
      .barcode-svg {
        width: 100%;
        height: 100%;
        object-fit: contain;
        filter: brightness(0); /* Force black color if possible */
      }
      @media print {
        @page {
          size: ${options.paperSize};
          margin: 0;
        }
        .label {
          outline: none;
        }
      }
    `;
  }

  /**
   * Renders barcode/text elements as per template positions
   */
  async _generateLabels(templateContent, items) {
    let labelsHtml = "";

    for (const item of items) {
      let elementsHtml = "";

      for (const element of templateContent) {
        let elementContent = "";
        if (element.type === "text") {
          elementContent = item[element.dataField] || `[${element.dataField}]`;
        } else if (element.type === "barcode" || element.type === "qrcode") {
          try {
            const bcid = element.type === "qrcode" ? "qrcode" : "code128";
            const svg = await bwipjs.toSVG({
              bcid,
              text: item.sku || "NO-SKU",
              scale: 3,
              height: element.barcodeHeight || 10,
              includetext: false,
              textxalign: "center",
            });
            elementContent = `<img src="data:image/svg+xml;base64,${Buffer.from(
              svg
            ).toString("base64")}" class="barcode-svg" />`;
          } catch (err) {
            console.error("Barcode generation error:", err);
            elementContent = "<div style='color:red'>[BARCODE ERROR]</div>";
          }
        }

        const style = `
          left: ${element.x}mm;
          top: ${element.y}mm;
          font-size: ${element.fontSize || 8}pt;
          font-weight: ${element.fontWeight || "normal"};
          ${element.width ? `width: ${element.width}mm;` : ""}
          ${element.height ? `height: ${element.height}mm;` : ""}
        `;

        elementsHtml += `<div class="element" style="${style}">${elementContent}</div>`;
      }

      labelsHtml += `<div class="label">${elementsHtml}</div>`;
    }

    return labelsHtml;
  }
}

module.exports = new BarcodeService();
