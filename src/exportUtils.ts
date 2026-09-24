import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Export arbitrary tabular data directly to Excel (.xlsx) file download
export function downloadExcelFile(fileName: string, sheetName: string, headers: string[], rows: (string | number)[][]) {
  const data = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

// Export arbitrary tabular data directly to clean printable PDF report
export function downloadPdfReport(title: string, subTitle: string, headers: string[], rows: (string | number)[][], fileName: string) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4'
  });

  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(title, 40, 40);

  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(subTitle, 40, 58);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN')}`, 40, 72);

  autoTable(doc, {
    startY: 85,
    head: [headers],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59], // slate-800
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    styles: {
      overflow: 'linebreak',
      cellPadding: 4
    }
  });

  doc.save(`${fileName}.pdf`);
}
