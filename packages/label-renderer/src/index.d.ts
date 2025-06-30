// packages/label-renderer/index.d.ts


import React from "react";

export interface LabelElement {
  type: "text" | "barcode" | "qrcode";
  dataField: string;
  x: number;
  y: number;
  fontSize?: number;
  fontWeight?: string;
  barcodeHeight?: number;
  barcodeWidth?: number;
}

export interface LabelTemplate {
  labelWidth: number;
  labelHeight: number;
  content: LabelElement[];
}

export function generateLabelHtml(template: LabelTemplate, itemData: Record<string, any>): Promise<string>;


export interface LabelElement {
  type: "text" | "barcode" | "qrcode";
  x?: number;            // position in mm
  y?: number;            // position in mm
  fontSize?: number;     // in pt, only for text
  fontWeight?: string;   // e.g. "normal" | "bold", only for text
  dataField: string;     // field name for data lookup
  barcodeHeight?: number;// height in mm, only for barcode/qrcode
  // you can extend this with other element props if needed
}

export interface LabelTemplate {
  labelWidth: number;   // in mm
  labelHeight: number;  // in mm
  content?: LabelElement[];
}

export interface ItemData {
  [key: string]: any;   // flexible object for your data fields
}

export interface LabelCanvasKonvaProps {
  template: LabelTemplate;
  itemData: ItemData;
}

declare const LabelCanvasKonva: React.FC<LabelCanvasKonvaProps>;

export default LabelCanvasKonva;

// Utility function types

/**
 * Extracts a field's data from the itemData object by the given field name.
 */
export function getFieldData(fieldName: string, itemData: ItemData): string;

/**
 * Generates a barcode or QR code SVG as a data URL string.
 * This is an async function that takes the element config and itemData.
 */
export function generateCodeSvg(
  element: LabelElement,
  itemData: ItemData
): Promise<string>;
