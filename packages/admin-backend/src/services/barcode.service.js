const { generateLabelHtml } = require("label-renderer");

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
  async generatePrintPageHtml(template, items, baseCurrency) {
    const {
      paperSize,
      labelWidth,
      labelHeight,
      horizontalGap,
      verticalGap,
      marginTop,
      marginLeft,
      columns,
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

    const labelHtmlPromises = items.map((item) =>
      generateLabelHtml(template, item, baseCurrency)
    );
    const allLabelsHtml = (await Promise.all(labelHtmlPromises)).join("");

    return `
            <!DOCTYPE html><html lang="en"><head><title>Print Labels</title><style>${style}</style></head>
            <body><div class="page">${allLabelsHtml}</div></body></html>
        `;
  }

  /**
   * @private
   * Generates the CSS needed for the print layout based on the template.
   */
  _generatePrintCss(options) {
    return `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
            body { margin: 0; font-family: 'Roboto Condensed', 'Inter', sans-serif; }
            .page {
                width: ${
                  options.paperSize === "A4"
                    ? "210mm"
                    : options.labelWidth + "mm"
                };
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
            .label { border: 1px dashed #ccc; /* For previewing, removed on print */ }
            .label > .region { height: 33.33%; box-sizing: border-box; padding: 1mm; display: flex; flex-direction: column; }
            .label > .body { justify-content: center; align-items: center; }
            .label > .footer { justify-content: flex-end; }

            @media print {
                @page { size: ${options.paperSize}; margin: 0; }
                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                .label { outline: none; }
            }
        `;
  }
}

module.exports = new BarcodeService();
