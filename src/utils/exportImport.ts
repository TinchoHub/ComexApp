import * as XLSX from 'xlsx';
import type { ImportItem, CalculatedImportItem } from '../types/import';

export function exportToExcel(items: CalculatedImportItem[]) {
  // 1. Sheet format matching the original spreadsheet (Vertical rows, columns per item)
  const rows: (string | number)[][] = [
    ['', 'PROVEEDOR', ...items.map((i) => i.proveedor)],
    ['', 'ITEMS', ...items.map((i) => i.item)],
    ['', 'FOB', ...items.map((i) => i.fob)],
    ['', 'FLETE', ...items.map((i) => i.flete)],
    ['', 'SEGURO', ...items.map((i) => i.seguro)],
    ['', 'BASE IMPONIBLE VALOR CIF', ...items.map((i) => i.cif)],
    ['', 'DERECHOS DE IMPO', ...items.map((i) => i.derechos)],
    ['', 'TASA ESTADISTICA', ...items.map((i) => i.tasaEstadistica)],
    ['', 'COSTO DE DERECHOS', ...items.map((i) => i.costoDerechos)],
    ['', 'SIM', ...items.map((i) => i.sim)],
    ['', 'TASA DIGITALIZACION', ...items.map((i) => i.digitalizacion)],
    ['', 'SENASA', ...items.map((i) => i.senasa)],
    ['', 'COSTO FINANCIERO', ...items.map((i) => i.costoFinanciero)],
    ['', 'FORWARDER', ...items.map((i) => i.forwarder)],
    ['', 'HONORARIOS DESPACHANTE', ...items.map((i) => i.honorariosDespachante)],
    ['', 'GASTOS OPERATIVOS', ...items.map((i) => i.gastosOperativos)],
    ['', 'NAVIERA', ...items.map((i) => i.naviera)],
    ['', 'TERMINAL', ...items.map((i) => i.terminal)],
    ['', 'DEPOSITO FISCAL', ...items.map((i) => i.depositoFiscal)],
    ['', 'TRANSPORTE', ...items.map((i) => i.transporte)],
    ['', 'GASTOS', ...items.map((i) => i.gastos)],
    ['', '', ...items.map(() => '')],
    ['', 'TOTAL', ...items.map((i) => i.total)],
    ['', '%', ...items.map((i) => i.porcentaje)],
  ];

  const wb = XLSX.utils.book_new();
  const wsOriginal = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, wsOriginal, 'Planilla Original');

  // 2. Tabular row-by-row format (great for pivot tables and modern analysis)
  const tabularData = items.map((i) => ({
    'Proveedor': i.proveedor,
    'Item/Despacho': i.item,
    'FOB (USD)': i.fob,
    'Flete (USD)': i.flete,
    'Seguro (USD)': i.seguro,
    'CIF (USD)': i.cif,
    'Derechos (USD)': i.derechos,
    'Tasa Estadística (USD)': i.tasaEstadistica,
    'Costo Derechos (USD)': i.costoDerechos,
    'SIM (USD)': i.sim,
    'Digitalización (USD)': i.digitalizacion,
    'SENASA (USD)': i.senasa,
    'Costo Financiero (USD)': i.costoFinanciero,
    'Forwarder (USD)': i.forwarder,
    'Despachante (USD)': i.honorariosDespachante,
    'Gastos Operativos (USD)': i.gastosOperativos,
    'Naviera (USD)': i.naviera,
    'Terminal (USD)': i.terminal,
    'Depósito Fiscal (USD)': i.depositoFiscal,
    'Transporte (USD)': i.transporte,
    'Total Gastos Operativos (USD)': i.gastos,
    'Total Nacionalización (USD)': i.total,
    'Incidencia (%)': (i.porcentaje * 100).toFixed(2) + '%',
    'Costo Final Total (USD)': i.costoFinalTotal,
  }));

  const wsTable = XLSX.utils.json_to_sheet(tabularData);
  XLSX.utils.book_append_sheet(wb, wsTable, 'Detalle Tabular');

  XLSX.writeFile(wb, `Planilla_Importaciones_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportToJson(items: ImportItem[]) {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(items, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `backup_importaciones_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function parseSpreadsheetFile(file: File): Promise<ImportItem[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        const aoa: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Try detecting column orientation (original format where row 1 has ITEMS)
        const itemsRowIdx = aoa.findIndex((row) =>
          row.some((cell) => String(cell).trim().toUpperCase() === 'ITEMS')
        );

        if (itemsRowIdx !== -1) {
          // Horizontal format detected!
          const labelColIdx = aoa[itemsRowIdx].findIndex(
            (c) => String(c).trim().toUpperCase() === 'ITEMS'
          );
          const provRowIdx = aoa.findIndex((row) =>
            row.some((cell) => String(cell).trim().toUpperCase() === 'PROVEEDOR')
          );

          const result: ImportItem[] = [];
          const numCols = Math.max(...aoa.map((r) => r.length));

          // Map row labels to their row indices
          const labelRowMap: { [label: string]: number } = {};
          aoa.forEach((row, rIdx) => {
            const labelCell = row[labelColIdx];
            if (labelCell) {
              const cleaned = String(labelCell).trim().toUpperCase();
              labelRowMap[cleaned] = rIdx;
            }
          });

          let currentProv = '';
          for (let c = labelColIdx + 1; c < numCols; c++) {
            if (provRowIdx !== -1 && aoa[provRowIdx][c]) {
              currentProv = String(aoa[provRowIdx][c]).trim();
            }
            const itemVal = aoa[itemsRowIdx][c];
            if (itemVal !== undefined && itemVal !== null && String(itemVal).trim() !== '') {
              const getValue = (labelKey: string): number => {
                const rIdx = Object.keys(labelRowMap).find((k) => k.includes(labelKey));
                if (rIdx !== undefined && aoa[labelRowMap[rIdx]]) {
                  const val = parseFloat(String(aoa[labelRowMap[rIdx]][c]).replace(/,/g, ''));
                  return isNaN(val) ? 0 : val;
                }
                return 0;
              };

              result.push({
                id: `imp-${itemVal}-${Date.now()}-${c}`,
                item: String(itemVal).trim(),
                proveedor: currentProv || 'Importación',
                fob: getValue('FOB'),
                flete: getValue('FLETE'),
                seguro: getValue('SEGURO'),
                derechos: getValue('DERECHOS'),
                tasaEstadistica: getValue('TASA ESTADISTICA'),
                sim: getValue('SIM') || 10,
                digitalizacion: getValue('DIGITALIZACION') || 24,
                senasa: getValue('SENASA') || 0,
                forwarder: getValue('FORWARDER'),
                honorariosDespachante: getValue('HONORARIOS') || getValue('DESPACHANTE') || 500,
                gastosOperativos: getValue('OPERATIVOS') || 35,
                naviera: getValue('NAVIERA'),
                terminal: getValue('TERMINAL'),
                depositoFiscal: getValue('DEPOSITO'),
                transporte: getValue('TRANSPORTE'),
              });
            }
          }

          if (result.length > 0) {
            resolve(result);
            return;
          }
        }

        // Try tabular row-by-row json import
        const jsonRows: any[] = XLSX.utils.sheet_to_json(sheet);
        if (jsonRows.length > 0) {
          const items: ImportItem[] = jsonRows.map((r, i) => ({
            id: `imp-${i}-${Date.now()}`,
            item: String(r['Item/Despacho'] || r['Item'] || r['ITEM'] || i + 1),
            proveedor: String(r['Proveedor'] || r['PROVEEDOR'] || 'Importación'),
            fob: Number(r['FOB'] || r['FOB (USD)'] || 0),
            flete: Number(r['FLETE'] || r['Flete (USD)'] || 0),
            seguro: Number(r['SEGURO'] || r['Seguro (USD)'] || 0),
            derechos: Number(r['DERECHOS'] || r['Derechos (USD)'] || 0),
            tasaEstadistica: Number(r['TASA ESTADISTICA'] || r['Tasa Estadística (USD)'] || 0),
            sim: Number(r['SIM'] || 10),
            digitalizacion: Number(r['DIGITALIZACION'] || 24),
            senasa: Number(r['SENASA'] || 0),
            forwarder: Number(r['FORWARDER'] || 0),
            honorariosDespachante: Number(r['HONORARIOS'] || r['Despachante (USD)'] || 500),
            gastosOperativos: Number(r['GASTOS OPERATIVOS'] || 35),
            naviera: Number(r['NAVIERA'] || 0),
            terminal: Number(r['TERMINAL'] || 0),
            depositoFiscal: Number(r['DEPOSITO FISCAL'] || 0),
            transporte: Number(r['TRANSPORTE'] || 0),
          }));
          resolve(items);
        } else {
          reject(new Error('No se encontraron datos válidos en el archivo.'));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (e) => reject(e);
    reader.readAsArrayBuffer(file);
  });
}
