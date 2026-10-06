import React, { useState } from 'react';
import type { ImportItem, CalculatedImportItem } from '../types/import';
import type { SummaryTotals } from '../utils/calculations';
import { formatCurrency, formatPercent } from '../utils/formatters';
import {
  Edit2,
  Copy,
  Trash2,
  Plus,
  HelpCircle,
  Calculator,
  Sparkles,
} from 'lucide-react';

interface Props {
  items: CalculatedImportItem[];
  summary: SummaryTotals;
  onEdit: (item: CalculatedImportItem) => void;
  onDuplicate: (item: CalculatedImportItem) => void;
  onDelete: (id: string) => void;
  onQuickAdd: () => void;
  onCellChange: (id: string, field: keyof ImportItem, value: number | string) => void;
  onShowFormulas: () => void;
}

interface RowDef {
  key: keyof CalculatedImportItem;
  label: string;
  category: 'header' | 'base' | 'derechos' | 'financiero' | 'gastos' | 'totales';
  isCalculated: boolean;
  formula?: string;
  format?: 'currency' | 'percent' | 'text' | 'number';
}

const ROWS: RowDef[] = [
  { key: 'proveedor', label: 'PROVEEDOR', category: 'header', isCalculated: false, format: 'text' },
  { key: 'item', label: 'ITEMS', category: 'header', isCalculated: false, format: 'text' },
  { key: 'fob', label: 'FOB', category: 'base', isCalculated: false, format: 'currency' },
  { key: 'flete', label: 'FLETE', category: 'base', isCalculated: false, format: 'currency' },
  { key: 'seguro', label: 'SEGURO', category: 'base', isCalculated: false, format: 'currency' },
  {
    key: 'cif',
    label: 'BASE IMPONIBLE VALOR CIF',
    category: 'base',
    isCalculated: true,
    formula: 'FOB + FLETE + SEGURO',
    format: 'currency',
  },
  { key: 'derechos', label: 'DERECHOS DE IMPO', category: 'derechos', isCalculated: false, format: 'currency' },
  { key: 'tasaEstadistica', label: 'TASA ESTADISTICA', category: 'derechos', isCalculated: false, format: 'currency' },
  {
    key: 'costoDerechos',
    label: 'COSTO DE DERECHOS',
    category: 'derechos',
    isCalculated: true,
    formula: 'DERECHOS + TASA ESTADISTICA',
    format: 'currency',
  },
  { key: 'sim', label: 'SIM', category: 'financiero', isCalculated: false, format: 'currency' },
  { key: 'digitalizacion', label: 'TASA DIGITALIZACION', category: 'financiero', isCalculated: false, format: 'currency' },
  { key: 'senasa', label: 'SENASA', category: 'financiero', isCalculated: false, format: 'currency' },
  {
    key: 'costoFinanciero',
    label: 'COSTO FINANCIERO',
    category: 'financiero',
    isCalculated: true,
    formula: 'SIM + DIGITALIZACION + SENASA',
    format: 'currency',
  },
  { key: 'forwarder', label: 'FORWARDER', category: 'gastos', isCalculated: false, format: 'currency' },
  { key: 'honorariosDespachante', label: 'HONORARIOS DESPACHANTE', category: 'gastos', isCalculated: false, format: 'currency' },
  { key: 'gastosOperativos', label: 'GASTOS OPERATIVOS', category: 'gastos', isCalculated: false, format: 'currency' },
  { key: 'naviera', label: 'NAVIERA', category: 'gastos', isCalculated: false, format: 'currency' },
  { key: 'terminal', label: 'TERMINAL', category: 'gastos', isCalculated: false, format: 'currency' },
  { key: 'depositoFiscal', label: 'DEPOSITO FISCAL', category: 'gastos', isCalculated: false, format: 'currency' },
  { key: 'transporte', label: 'TRANSPORTE', category: 'gastos', isCalculated: false, format: 'currency' },
  {
    key: 'gastos',
    label: 'GASTOS',
    category: 'gastos',
    isCalculated: true,
    formula: 'FORWARDER + DESPACHANTE + OPERATIVOS + NAVIERA + TERMINAL + DEPOSITO + TRANSPORTE',
    format: 'currency',
  },
  {
    key: 'total',
    label: 'TOTAL',
    category: 'totales',
    isCalculated: true,
    formula: 'COSTO DE DERECHOS + COSTO FINANCIERO + GASTOS',
    format: 'currency',
  },
  {
    key: 'porcentaje',
    label: '%',
    category: 'totales',
    isCalculated: true,
    formula: 'TOTAL / FOB',
    format: 'percent',
  },
];

const PROVIDER_COLORS: { [k: string]: { bg: string; text: string; border: string } } = {
  BAZAN: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  ROMA: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
  MYRIAD: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
  NINGBO: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
  BRASKEM: { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-300' },
};

export const SpreadsheetView: React.FC<Props> = ({
  items,
  summary,
  onEdit,
  onDuplicate,
  onDelete,
  onQuickAdd,
  onCellChange,
  onShowFormulas,
}) => {
  const [editingCell, setEditingCell] = useState<{ id: string; key: keyof ImportItem } | null>(null);
  const [tempValue, setTempValue] = useState<string>('');

  const startEditing = (id: string, key: keyof ImportItem, currentVal: any) => {
    setEditingCell({ id, key });
    setTempValue(String(currentVal ?? ''));
  };

  const saveEditing = () => {
    if (editingCell) {
      if (editingCell.key === 'proveedor' || editingCell.key === 'item') {
        onCellChange(editingCell.id, editingCell.key, tempValue);
      } else {
        const num = parseFloat(tempValue);
        onCellChange(editingCell.id, editingCell.key, isNaN(num) ? 0 : num);
      }
    }
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEditing();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  const getProviderStyle = (prov: string) => {
    const clean = (prov || '').toUpperCase().trim();
    return (
      PROVIDER_COLORS[clean] || {
        bg: 'bg-slate-100',
        text: 'text-slate-800',
        border: 'border-slate-300',
      }
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
      {/* Top Banner with Instructions and Quick Add */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span>
            Vista de Planilla (Columnas por Importación)
          </span>
          <span className="text-xs text-slate-500 hidden sm:inline">
            — Haz clic en cualquier celda para editar sus valores; las fórmulas se recalculan al instante.
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onShowFormulas}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
            Ver Fórmulas
          </button>
          <button
            onClick={onQuickAdd}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            + Nueva Columna
          </button>
        </div>
      </div>

      {/* Main Table Scroll Container with relative and overflow */}
      <div className="relative overflow-x-auto overflow-y-auto max-h-[72vh] custom-scrollbar border-b border-slate-200">
        <table className="border-separate border-spacing-0 text-xs select-none min-w-full">
          <thead>
            <tr className="text-slate-700 uppercase font-semibold text-[11px] sticky top-0 z-30">
              {/* Frozen Left Header - 100% Solid Opaque Background */}
              <th className="sticky left-0 z-40 bg-slate-100 text-slate-800 border-r-2 border-slate-300 border-b-2 border-slate-300 px-4 py-3 text-left w-[270px] min-w-[270px] max-w-[270px] font-bold whitespace-nowrap shadow-[4px_0_8px_-2px_rgba(0,0,0,0.12)]">
                CONCEPTO / FÓRMULA
              </th>

              {/* Import Columns */}
              {items.map((item, idx) => {
                const style = getProviderStyle(item.proveedor);
                return (
                  <th
                    key={item.id}
                    className="border-r border-slate-200 border-b-2 border-slate-300 px-3 py-2.5 text-center w-[145px] min-w-[145px] max-w-[145px] bg-slate-50 group hover:bg-slate-100 transition-colors whitespace-nowrap"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-[10px] text-slate-500 font-mono font-semibold">
                        #{idx + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEdit(item)}
                          title="Editar en formulario"
                          className="p-1 hover:bg-indigo-100 text-slate-500 hover:text-indigo-700 rounded transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onDuplicate(item)}
                          title="Duplicar importación"
                          className="p-1 hover:bg-blue-100 text-slate-500 hover:text-blue-700 rounded transition-colors cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onDelete(item.id)}
                          title="Eliminar columna"
                          className="p-1 hover:bg-rose-100 text-slate-500 hover:text-rose-700 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div
                      className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wide ${style.bg} ${style.text} border ${style.border} truncate max-w-full shadow-2xs`}
                      title={item.proveedor}
                    >
                      {item.proveedor || 'S/P'}
                    </div>
                  </th>
                );
              })}

              {/* Add Column Button inside Header */}
              <th className="border-r border-slate-300 border-b-2 border-slate-300 px-3 py-2 text-center w-[130px] min-w-[130px] max-w-[130px] bg-indigo-50/60 whitespace-nowrap">
                <button
                  onClick={onQuickAdd}
                  className="w-full py-2 px-2 border-2 border-dashed border-indigo-300 hover:border-indigo-500 rounded-lg text-indigo-700 hover:text-indigo-900 font-bold text-xs flex items-center justify-center gap-1 transition-all bg-white hover:bg-indigo-50/80 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Nueva
                </button>
              </th>

              {/* Sticky Right Summary Column - 100% Solid Opaque Background */}
              <th className="sticky right-0 z-40 bg-slate-900 text-white border-l-2 border-slate-700 border-b-2 border-slate-700 px-4 py-3 text-right w-[180px] min-w-[180px] max-w-[180px] font-bold whitespace-nowrap shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.25)]">
                TOTALES
              </th>
            </tr>
          </thead>

          <tbody>
            {ROWS.map((row) => {
              const isCalc = row.isCalculated;
              const isTotalRow = row.key === 'total' || row.key === 'porcentaje';
              const isCifRow = row.key === 'cif';

              // Solid background colors for Left Sticky Column to PREVENT any text bleed/overlap
              let stickyBg = 'bg-white';
              let stickyText = 'text-slate-800';
              let cellBg = 'bg-white hover:bg-slate-50';

              if (isTotalRow) {
                stickyBg = 'bg-amber-100 text-amber-950 font-bold';
                stickyText = 'text-amber-950';
                cellBg = 'bg-amber-50/80 hover:bg-amber-100/70 font-semibold';
              } else if (isCifRow) {
                stickyBg = 'bg-emerald-100 text-emerald-950 font-bold';
                stickyText = 'text-emerald-950';
                cellBg = 'bg-emerald-50/70 hover:bg-emerald-100/60 font-semibold';
              } else if (isCalc) {
                stickyBg = 'bg-indigo-50 text-indigo-950 font-bold';
                stickyText = 'text-indigo-950';
                cellBg = 'bg-indigo-50/40 hover:bg-indigo-100/50';
              }

              return (
                <tr key={row.key} className="group border-b border-slate-200">
                  {/* Left Sticky Label - SOLID OPAQUE BACKGROUND + SHADOW */}
                  <td
                    className={`sticky left-0 z-20 ${stickyBg} border-r-2 border-slate-300 border-b border-slate-200 px-4 py-2.5 text-left w-[270px] min-w-[270px] max-w-[270px] whitespace-nowrap shadow-[4px_0_8px_-2px_rgba(0,0,0,0.12)]`}
                  >
                    <div className="flex items-center justify-between gap-1.5 w-full">
                      <div className="flex items-center gap-2 truncate">
                        {isCalc && (
                          <span
                            title={`Fórmula: ${row.formula}`}
                            className="p-1 rounded bg-indigo-200/70 text-indigo-800 shrink-0"
                          >
                            <Calculator className="w-3 h-3" />
                          </span>
                        )}
                        <span className={`text-xs ${stickyText} truncate font-semibold`}>
                          {row.label}
                        </span>
                      </div>

                      {row.formula && (
                        <span
                          title={row.formula}
                          className="text-[10px] text-slate-400 hover:text-indigo-600 font-mono shrink-0 ml-1 cursor-help px-1 bg-slate-100/80 rounded"
                        >
                          fx
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Item Values */}
                  {items.map((item) => {
                    const rawVal = item[row.key];
                    const isCellEditing = editingCell?.id === item.id && editingCell?.key === row.key;

                    let displayVal = '';
                    if (row.format === 'currency') displayVal = formatCurrency(Number(rawVal));
                    else if (row.format === 'percent') displayVal = formatPercent(Number(rawVal) * 100);
                    else displayVal = String(rawVal ?? '');

                    if (isCellEditing) {
                      return (
                        <td
                          key={item.id}
                          className="border-r border-slate-200 border-b border-slate-200 p-1 text-center bg-yellow-50 w-[145px] min-w-[145px] max-w-[145px] whitespace-nowrap"
                        >
                          <input
                            type={row.format === 'text' ? 'text' : 'number'}
                            step="any"
                            autoFocus
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            onBlur={saveEditing}
                            onKeyDown={handleKeyDown}
                            className="w-full px-2 py-1 text-center text-xs font-mono font-bold bg-white border-2 border-indigo-500 rounded outline-none shadow-inner"
                          />
                        </td>
                      );
                    }

                    return (
                      <td
                        key={item.id}
                        onClick={() => {
                          if (!isCalc) {
                            startEditing(item.id, row.key as keyof ImportItem, rawVal);
                          }
                        }}
                        className={`border-r border-slate-200 border-b border-slate-200 px-3 py-2.5 text-center font-mono text-xs w-[145px] min-w-[145px] max-w-[145px] whitespace-nowrap transition-colors ${cellBg} ${
                          isCalc
                            ? 'cursor-default font-semibold'
                            : 'cursor-pointer hover:bg-indigo-100/70 hover:text-indigo-900'
                        } ${
                          isTotalRow
                            ? 'text-amber-950 font-bold'
                            : isCifRow
                            ? 'text-emerald-950 font-semibold'
                            : isCalc
                            ? 'text-indigo-950'
                            : 'text-slate-800'
                        }`}
                        title={
                          isCalc
                            ? `Fórmula: ${row.formula}`
                            : 'Clic para editar este valor'
                        }
                      >
                        {displayVal}
                      </td>
                    );
                  })}

                  {/* Add Column Empty Space Cell */}
                  <td className="border-r border-slate-300 border-b border-slate-200 px-3 py-2 text-center bg-indigo-50/20 text-slate-300 w-[130px] min-w-[130px] max-w-[130px] whitespace-nowrap">
                    —
                  </td>

                  {/* Sticky Right Consolidated Total - SOLID OPAQUE SLATE-900 BACKGROUND */}
                  <td className="sticky right-0 z-20 bg-slate-900 text-white border-l-2 border-slate-700 border-b border-slate-800 px-4 py-2.5 text-right font-mono font-bold w-[180px] min-w-[180px] max-w-[180px] whitespace-nowrap shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.25)]">
                    {(() => {
                      if (row.key === 'fob') return formatCurrency(summary.fob);
                      if (row.key === 'flete') return formatCurrency(summary.flete);
                      if (row.key === 'seguro') return formatCurrency(summary.seguro);
                      if (row.key === 'cif') return <span className="text-emerald-300">{formatCurrency(summary.cif)}</span>;
                      if (row.key === 'derechos') return formatCurrency(summary.derechos);
                      if (row.key === 'tasaEstadistica') return formatCurrency(summary.tasaEstadistica);
                      if (row.key === 'costoDerechos') return <span className="text-blue-300">{formatCurrency(summary.costoDerechos)}</span>;
                      if (row.key === 'sim') return formatCurrency(summary.sim);
                      if (row.key === 'digitalizacion') return formatCurrency(summary.digitalizacion);
                      if (row.key === 'senasa') return formatCurrency(summary.senasa);
                      if (row.key === 'costoFinanciero') return <span className="text-amber-300">{formatCurrency(summary.costoFinanciero)}</span>;
                      if (row.key === 'forwarder') return formatCurrency(summary.forwarder);
                      if (row.key === 'honorariosDespachante') return formatCurrency(summary.honorariosDespachante);
                      if (row.key === 'gastosOperativos') return formatCurrency(summary.gastosOperativos);
                      if (row.key === 'naviera') return formatCurrency(summary.naviera);
                      if (row.key === 'terminal') return formatCurrency(summary.terminal);
                      if (row.key === 'depositoFiscal') return formatCurrency(summary.depositoFiscal);
                      if (row.key === 'transporte') return formatCurrency(summary.transporte);
                      if (row.key === 'gastos') return <span className="text-indigo-300">{formatCurrency(summary.gastos)}</span>;
                      if (row.key === 'total') return <span className="text-amber-300 text-sm">{formatCurrency(summary.total)}</span>;
                      if (row.key === 'porcentaje') return <span className="text-purple-300 text-sm">{formatPercent(summary.promedioIncidencia)}</span>;
                      if (row.key === 'proveedor') return <span className="text-slate-400 font-sans text-[11px]">CONSOLIDADO</span>;
                      if (row.key === 'item') return <span className="text-slate-400 font-sans text-[11px]">{items.length} Despachos</span>;
                      return '—';
                    })()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer bar with quick summary info */}
      <div className="bg-slate-50 border-t border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span>
            Mostrando <strong>{items.length}</strong> columnas de importación
          </span>
          <span className="hidden sm:inline text-slate-300">|</span>
          <span className="hidden sm:inline">
            FOB Total: <strong>{formatCurrency(summary.fob)}</strong>
          </span>
          <span className="hidden sm:inline text-slate-300">|</span>
          <span className="hidden sm:inline">
            Despachante Total: <strong>{formatCurrency(summary.honorariosDespachante)}</strong>
          </span>
          <span className="hidden sm:inline text-slate-300">|</span>
          <span className="hidden sm:inline">
            Transporte Total: <strong>{formatCurrency(summary.transporte)}</strong>
          </span>
        </div>

        <button
          onClick={onQuickAdd}
          className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" /> Agregar Nueva Importación
        </button>
      </div>
    </div>
  );
};
