import React from 'react';
import type { SummaryTotals } from '../utils/calculations';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { DollarSign, ShieldAlert, Percent, Truck, UserCheck, TrendingUp } from 'lucide-react';

interface Props {
  summary: SummaryTotals;
  filteredCount: number;
  totalCount: number;
}

export const KpiCards: React.FC<Props> = ({ summary, filteredCount, totalCount }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-6">
      {/* FOB Total */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between text-slate-500 mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">FOB Total</span>
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="text-lg font-bold font-mono text-slate-900 tracking-tight">
          {formatCurrency(summary.fob, 0)}
        </div>
        <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
          <span>CIF: {formatCurrency(summary.cif, 0)}</span>
          <span className="text-slate-400 font-mono">({filteredCount}/{totalCount})</span>
        </div>
      </div>

      {/* Total Gastos Impo */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between text-slate-500 mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Gastos Impo</span>
          <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div className="text-lg font-bold font-mono text-amber-700 tracking-tight">
          {formatCurrency(summary.total, 0)}
        </div>
        <div className="text-[11px] text-slate-500 mt-1">
          Derechos: {formatCurrency(summary.costoDerechos, 0)}
        </div>
      </div>

      {/* Incidencia Promedio */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between text-slate-500 mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">% Incidencia</span>
          <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
            <Percent className="w-4 h-4" />
          </div>
        </div>
        <div className="text-lg font-bold font-mono text-purple-700 tracking-tight">
          {formatPercent(summary.promedioIncidencia)}
        </div>
        <div className="text-[11px] text-slate-500 mt-1">
          Sobre valor FOB total
        </div>
      </div>

      {/* Despachante Total */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between text-slate-500 mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Despachante</span>
          <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="text-lg font-bold font-mono text-emerald-700 tracking-tight">
          {formatCurrency(summary.honorariosDespachante, 0)}
        </div>
        <div className="text-[11px] text-slate-500 mt-1">
          Fijo $500 por despacho
        </div>
      </div>

      {/* Transporte Total */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between text-slate-500 mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-700">Transporte</span>
          <div className="p-1.5 bg-cyan-50 text-cyan-600 rounded-lg">
            <Truck className="w-4 h-4" />
          </div>
        </div>
        <div className="text-lg font-bold font-mono text-cyan-700 tracking-tight">
          {formatCurrency(summary.transporte, 0)}
        </div>
        <div className="text-[11px] text-slate-500 mt-1">
          Flete local a planta
        </div>
      </div>

      {/* Costo Final Consolidado */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-xl p-3.5 shadow-xs">
        <div className="flex items-center justify-between text-indigo-200 mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-200">Costo Puesto Planta</span>
          <div className="p-1.5 bg-white/10 rounded-lg">
            <TrendingUp className="w-4 h-4 text-indigo-300" />
          </div>
        </div>
        <div className="text-lg font-bold font-mono text-teal-300 tracking-tight">
          {formatCurrency(summary.costoFinalTotal, 0)}
        </div>
        <div className="text-[11px] text-indigo-200/80 mt-1">
          FOB + Todos los Gastos
        </div>
      </div>
    </div>
  );
};
