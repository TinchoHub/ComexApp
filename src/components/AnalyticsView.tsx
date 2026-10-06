import React from 'react';
import type { CalculatedImportItem } from '../types/import';
import type { SummaryTotals } from '../utils/calculations';
import { formatCurrency, formatPercent, formatNumber } from '../utils/formatters';
import { BarChart3, PieChart, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Props {
  items: CalculatedImportItem[];
  summary: SummaryTotals;
}

export const AnalyticsView: React.FC<Props> = ({ items, summary }) => {
  // Aggregate by Provider
  const providerStats: {
    [prov: string]: {
      count: number;
      fob: number;
      cif: number;
      derechos: number;
      gastos: number;
      total: number;
      avgIncidencia: number;
    };
  } = {};

  items.forEach((item) => {
    const p = (item.proveedor || 'Sin Proveedor').toUpperCase().trim();
    if (!providerStats[p]) {
      providerStats[p] = {
        count: 0,
        fob: 0,
        cif: 0,
        derechos: 0,
        gastos: 0,
        total: 0,
        avgIncidencia: 0,
      };
    }
    providerStats[p].count += 1;
    providerStats[p].fob += item.fob;
    providerStats[p].cif += item.cif;
    providerStats[p].derechos += item.costoDerechos;
    providerStats[p].gastos += item.gastos + item.costoFinanciero;
    providerStats[p].total += item.total;
  });

  Object.keys(providerStats).forEach((p) => {
    const s = providerStats[p];
    s.avgIncidencia = s.fob > 0 ? (s.total / s.fob) * 100 : 0;
  });

  const providersList = Object.entries(providerStats).sort((a, b) => b[1].fob - a[1].fob);

  // Cost breakdown
  const costBreakdown = [
    {
      name: 'Derechos & Tasa Estadística',
      amount: summary.costoDerechos,
      color: 'bg-blue-500',
      text: 'text-blue-700',
      description: 'Tributos aduaneros AFIP',
    },
    {
      name: 'Terminales & Navieras',
      amount: summary.terminal + summary.naviera,
      color: 'bg-indigo-500',
      text: 'text-indigo-700',
      description: 'Liberación de contenedor y terminal portuaria',
    },
    {
      name: 'Transporte Terrestre Local',
      amount: summary.transporte,
      color: 'bg-cyan-500',
      text: 'text-cyan-700',
      description: 'Flete de puerto/fiscal a planta',
    },
    {
      name: 'Despachante de Aduana',
      amount: summary.honorariosDespachante,
      color: 'bg-emerald-500',
      text: 'text-emerald-700',
      description: 'Honorarios profesionales ($500/despacho)',
    },
    {
      name: 'Tasas Fijas (SIM + Digit + SENASA)',
      amount: summary.costoFinanciero,
      color: 'bg-amber-500',
      text: 'text-amber-700',
      description: 'Aranceles oficiales de registro',
    },
    {
      name: 'Depósito Fiscal & Otros',
      amount: summary.depositoFiscal + summary.gastosOperativos + summary.forwarder,
      color: 'bg-purple-500',
      text: 'text-purple-700',
      description: 'Almacenaje fiscal y operativos',
    },
  ];

  const totalNacionalizacion = summary.total > 0 ? summary.total : 1;

  // Items sorted by Incidencia %
  const sortedByIncidencia = [...items].sort((a, b) => b.porcentaje - a.porcentaje);
  const highestIncidence = sortedByIncidencia.slice(0, 5);
  const lowestIncidence = [...sortedByIncidencia].reverse().slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-2 text-indigo-600 mb-2 font-semibold text-xs uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" /> Resumen de Volumen
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {items.length} Despachos
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Distribuidos en {providersList.length} proveedores internacionales
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-2 text-amber-600 mb-2 font-semibold text-xs uppercase tracking-wider">
            <BarChart3 className="w-4 h-4" /> Costo Medio de Gastos
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {formatCurrency(items.length > 0 ? summary.total / items.length : 0)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Promedio de desembolso de nacionalización por importación
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-2 text-emerald-600 mb-2 font-semibold text-xs uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" /> Factor Incidencia Global
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700">
            {formatPercent(summary.promedioIncidencia)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cada \$100 de FOB demanda \${formatNumber(summary.promedioIncidencia)} adicionales en gastos
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Desglose por Proveedor */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" /> Comparativa por Proveedor
          </h3>

          <div className="space-y-4">
            {providersList.map(([name, stat]) => {
              const fobShare = summary.fob > 0 ? (stat.fob / summary.fob) * 100 : 0;
              return (
                <div key={name} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">{name}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                        {stat.count} {stat.count === 1 ? 'ítem' : 'ítems'}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-indigo-700">
                      Incidencia: {formatPercent(stat.avgIncidencia)}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 rounded-full h-2 mb-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(5, fobShare))}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-xs text-slate-500 font-mono">
                    <span>FOB: {formatCurrency(stat.fob)} ({formatPercent(fobShare)})</span>
                    <span>Gastos: {formatCurrency(stat.total)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Estructura del Gasto de Nacionalización */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-600" /> Estructura de Gastos de Importación
          </h3>

          <div className="space-y-3.5">
            {costBreakdown.map((item, idx) => {
              const pct = (item.amount / totalNacionalizacion) * 100;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="font-semibold text-slate-800">{item.name}</span>
                      <span className="text-[11px] text-slate-400 block">{item.description}</span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-bold text-slate-900">{formatCurrency(item.amount)}</span>
                      <span className="text-[11px] text-slate-500 ml-1.5">({formatPercent(pct)})</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${Math.min(100, Math.max(1, pct))}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Extremos de Incidencia */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Despachos con Mayor Incidencia */}
        <div className="bg-white p-5 rounded-2xl border border-rose-200/80 bg-rose-50/10 shadow-2xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 mb-3 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" /> Despachos con Mayor Costo Relativo (Mayor %)
          </h4>
          <div className="divide-y divide-slate-100 text-xs">
            {highestIncidence.map((i) => (
              <div key={i.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 font-mono">Item #{i.item}</span>
                  <span className="text-slate-500 ml-2">({i.proveedor})</span>
                  <div className="text-[11px] text-slate-400 font-mono">
                    FOB: {formatCurrency(i.fob)} | Gastos: {formatCurrency(i.total)}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    {formatPercent(i.porcentaje * 100)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Despachos Más Eficientes (Menor Incidencia) */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 bg-emerald-50/10 shadow-2xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Despachos Más Eficientes (Menor %)
          </h4>
          <div className="divide-y divide-slate-100 text-xs">
            {lowestIncidence.map((i) => (
              <div key={i.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 font-mono">Item #{i.item}</span>
                  <span className="text-slate-500 ml-2">({i.proveedor})</span>
                  <div className="text-[11px] text-slate-400 font-mono">
                    FOB: {formatCurrency(i.fob)} | Gastos: {formatCurrency(i.total)}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {formatPercent(i.porcentaje * 100)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
