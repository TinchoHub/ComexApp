import React, { useState } from 'react';
import type { CalculatedImportItem } from '../types/import';
import type { SummaryTotals } from '../utils/calculations';
import { formatCurrency, formatPercent } from '../utils/formatters';
import {
  ArrowUpDown,
  Edit2,
  Copy,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

interface Props {
  items: CalculatedImportItem[];
  summary: SummaryTotals;
  onEdit: (item: CalculatedImportItem) => void;
  onDuplicate: (item: CalculatedImportItem) => void;
  onDelete: (id: string) => void;
  onQuickAdd: () => void;
}

type SortField = 'item' | 'proveedor' | 'fob' | 'cif' | 'costoDerechos' | 'gastos' | 'total' | 'porcentaje' | 'costoFinalTotal';

const PROVIDER_COLORS: { [k: string]: { bg: string; text: string; border: string } } = {
  BAZAN: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  ROMA: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
  MYRIAD: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
  NINGBO: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
  BRASKEM: { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-300' },
};

export const TableView: React.FC<Props> = ({
  items,
  summary,
  onEdit,
  onDuplicate,
  onDelete,
  onQuickAdd,
}) => {
  const [sortField, setSortField] = useState<SortField>('item');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedItems = [...items].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];

    if (sortField === 'item') {
      const aNum = parseInt(a.item);
      const bNum = parseInt(b.item);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortAsc ? aNum - bNum : bNum - aNum;
      }
    }

    if (typeof aVal === 'string') {
      return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortAsc ? aVal - bVal : bVal - aVal;
  });

  const getProviderBadge = (prov: string) => {
    const clean = (prov || '').toUpperCase().trim();
    const style = PROVIDER_COLORS[clean] || {
      bg: 'bg-slate-100',
      text: 'text-slate-800',
      border: 'border-slate-300',
    };
    return (
      <span
        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${style.bg} ${style.text} border ${style.border}`}
      >
        {clean || 'S/P'}
      </span>
    );
  };

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
    <th
      onClick={() => handleSort(field)}
      className="px-3.5 py-3 text-left cursor-pointer hover:bg-slate-200/70 transition-colors select-none font-semibold text-slate-700 text-xs whitespace-nowrap"
    >
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <span>{label}</span>
        {sortField === field ? (
          sortAsc ? (
            <ArrowUp className="w-3.5 h-3.5 text-indigo-600" />
          ) : (
            <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
          )
        ) : (
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60" />
        )}
      </div>
    </th>
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
      {/* Top Banner */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
            Vista de Tabla Vertical (Listado de Despachos)
          </span>
          <span className="text-xs text-slate-500 hidden sm:inline">
            — Ordena y analiza cada despacho de importación por columna
          </span>
        </div>

        <button
          onClick={onQuickAdd}
          className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          + Nueva Importación
        </button>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto overflow-y-auto max-h-[72vh] custom-scrollbar">
        <table className="w-full border-collapse text-xs whitespace-nowrap">
          <thead className="bg-slate-100 text-slate-700 border-b border-slate-300 sticky top-0 z-20 shadow-2xs">
            <tr>
              <SortHeader field="item" label="ITEM / DESP" />
              <SortHeader field="proveedor" label="PROVEEDOR" />
              <SortHeader field="fob" label="VALOR FOB" />
              <th className="px-3 py-3 text-left font-semibold text-slate-700 text-xs whitespace-nowrap">FLETE + SEG</th>
              <SortHeader field="cif" label="VALOR CIF" />
              <SortHeader field="costoDerechos" label="DERECHOS" />
              <th className="px-3 py-3 text-left font-semibold text-slate-700 text-xs whitespace-nowrap">FINANCIERO</th>
              <th className="px-3 py-3 text-left font-semibold text-slate-700 text-xs whitespace-nowrap">DESP + TRANSP</th>
              <SortHeader field="gastos" label="GASTOS OPER." />
              <SortHeader field="total" label="TOTAL NACIONALIZACIÓN" />
              <SortHeader field="porcentaje" label="% INCIDENCIA" />
              <SortHeader field="costoFinalTotal" label="COSTO FINAL" />
              <th className="px-3.5 py-3 text-center font-semibold text-slate-700 text-xs w-28 whitespace-nowrap">ACCIONES</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {sortedItems.map((item) => {
              const incPct = item.porcentaje * 100;
              let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
              if (incPct > 20) badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
              else if (incPct > 10) badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';

              return (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  <td className="px-3.5 py-2.5 font-bold text-slate-900 font-mono">
                    #{item.item}
                  </td>
                  <td className="px-3.5 py-2.5">
                    {getProviderBadge(item.proveedor)}
                  </td>
                  <td className="px-3.5 py-2.5 font-mono font-medium text-slate-800">
                    {formatCurrency(item.fob)}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-slate-500">
                    {formatCurrency(item.flete + item.seguro)}
                  </td>
                  <td className="px-3.5 py-2.5 font-mono font-bold text-emerald-800 bg-emerald-50/20">
                    {formatCurrency(item.cif)}
                  </td>
                  <td className="px-3.5 py-2.5 font-mono text-blue-800">
                    {formatCurrency(item.costoDerechos)}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-amber-800">
                    {formatCurrency(item.costoFinanciero)}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-slate-600">
                    {formatCurrency(item.honorariosDespachante + item.transporte)}
                  </td>
                  <td className="px-3.5 py-2.5 font-mono text-indigo-800">
                    {formatCurrency(item.gastos)}
                  </td>
                  <td className="px-3.5 py-2.5 font-mono font-bold text-amber-900 bg-amber-50/40">
                    {formatCurrency(item.total)}
                  </td>
                  <td className="px-3.5 py-2.5 font-mono font-semibold">
                    <span className={`inline-block px-2 py-0.5 rounded-full border text-[11px] ${badgeColor}`}>
                      {formatPercent(incPct)}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5 font-mono font-bold text-slate-900">
                    {formatCurrency(item.costoFinalTotal)}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit(item)}
                        title="Editar despacho"
                        className="p-1 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDuplicate(item)}
                        title="Duplicar despacho"
                        className="p-1 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        title="Eliminar despacho"
                        className="p-1 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Sticky Total Footer */}
          <tfoot className="bg-slate-900 text-white font-mono text-xs font-bold sticky bottom-0 z-20">
            <tr>
              <td className="px-3.5 py-3">TOTALES</td>
              <td className="px-3.5 py-3 font-sans text-[11px] text-slate-400">{items.length} despachos</td>
              <td className="px-3.5 py-3">{formatCurrency(summary.fob)}</td>
              <td className="px-3 py-3 text-slate-300">{formatCurrency(summary.flete + summary.seguro)}</td>
              <td className="px-3.5 py-3 text-emerald-300">{formatCurrency(summary.cif)}</td>
              <td className="px-3.5 py-3 text-blue-300">{formatCurrency(summary.costoDerechos)}</td>
              <td className="px-3 py-3 text-amber-300">{formatCurrency(summary.costoFinanciero)}</td>
              <td className="px-3 py-3 text-slate-300">
                {formatCurrency(summary.honorariosDespachante + summary.transporte)}
              </td>
              <td className="px-3.5 py-3 text-indigo-300">{formatCurrency(summary.gastos)}</td>
              <td className="px-3.5 py-3 text-amber-300">{formatCurrency(summary.total)}</td>
              <td className="px-3.5 py-3 text-purple-300">{formatPercent(summary.promedioIncidencia)}</td>
              <td className="px-3.5 py-3 text-teal-300">{formatCurrency(summary.costoFinalTotal)}</td>
              <td className="px-3 py-3 text-center text-slate-400 font-sans text-[10px]">100%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
