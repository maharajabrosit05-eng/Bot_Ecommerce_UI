import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

export interface ExportColumn {
  header: string;   // table header ah kaatanum (e.g. "Product Name")
  field: string;     // data object key (e.g. "productName")
}

/**
 * ExportService
 * ------------------------------------------------------------
 * Excel export, PDF export, matrum Print — moonu um inga oru
 * edathula than irukku. Edhu page layum, edhu table ku um,
 * ithe service ah inject panni call pannitu use pannalam:
 *
 *   constructor(private exportSvc: ExportService) {}
 *
 *   this.exportSvc.exportExcel(this.filteredData, 'All Products');
 *
 *   this.exportSvc.exportPdf(
 *     [{ header: 'Name', field: 'name' }, { header: 'Price', field: 'price' }],
 *     this.filteredData,
 *     'All Products'
 *   );
 *
 *   this.exportSvc.printData(
 *     'All Products',
 *     [{ header: 'Name', field: 'name' }, { header: 'Price', field: 'price' }],
 *     this.filteredData
 *   );
 * ------------------------------------------------------------
 */
@Injectable({ providedIn: 'root' })
export class ExportService {

  /** Export ANY array of objects to an .xlsx file (columns auto-detected from keys) */
  exportExcel(data: any[], fileName: string = 'export', sheetName: string = 'Sheet1'): void {
    if (!data || !data.length) { return; }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = { Sheets: { [sheetName]: worksheet }, SheetNames: [sheetName] };

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  }

  /** Export to a formatted PDF table. Pass explicit columns so header labels look clean. */
  exportPdf(columns: ExportColumn[], data: any[], fileName: string = 'export', title?: string): void {
    if (!data || !data.length) { return; }

    const doc = new jsPDF({ orientation: columns.length > 6 ? 'landscape' : 'portrait' });

    let startY = 14;
    if (title) {
      doc.setFontSize(13);
      doc.text(title, 14, startY);
      startY += 8;
    }

    autoTable(doc, {
      startY,
      head: [columns.map(c => c.header)],
      body: data.map(row => columns.map(c => row[c.field] ?? '')),
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [79, 124, 255] }
    });

    doc.save(`${fileName}.pdf`);
  }

  /** Opens a clean print window with just the title + table, then triggers window print */
  printData(title: string, columns: ExportColumn[], data: any[]): void {
    if (!data || !data.length) { return; }

    const rowsHtml = data.map(row =>
      `<tr>${columns.map(c => `<td>${row[c.field] ?? ''}</td>`).join('')}</tr>`
    ).join('');

    const headHtml = columns.map(c => `<th>${c.header}</th>`).join('');

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) { return; }

    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: 'Inter', Arial, sans-serif; padding: 24px; color: #1e2433; }
            h2 { margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; }
            th, td { border: 1px solid #dde2ee; padding: 8px 10px; text-align: left; }
            th { background: #f4f6fb; }
          </style>
        </head>
        <body>
          <h2>${title}</h2>
          <table>
            <thead><tr>${headHtml}</tr></thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();

    // give the new window a moment to render before opening the print dialog
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  }
}
