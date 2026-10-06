import React, { useState, useEffect } from 'react';
import type { ImportItem } from '../types/import';
import { calculateItem } from '../utils/calculations';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { X, Plus, Sparkles, Calculator, Check, ShieldCheck, DollarSign, Truck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: ImportItem) => void;
  initialItem?: ImportItem | null;
  existingProviders: string[];
}

const DEFAULT_NEW_ITEM: Omit<ImportItem, 'id'> = {
  item: '',
  proveedor: '',
  fob: 0,
  flete: 0,
  seguro: 0,
  derechos: 0,
  tasaEstadistica: 0,
  sim: 10,
  digitalizacion: 24,
  senasa: 10,
  forwarder: 0,
  honorariosDespachante: 500,
  gastosOperativos: 35,
  naviera: 0,
  terminal: 0,
  depositoFiscal: 0,
  transporte: 0,
};

export const ImportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  initialItem,
  existingProviders,
}) => {
  const [formData, setFormData] = useState<ImportItem>({
    id: '',
    ...DEFAULT_NEW_ITEM,
  });

  const isEditing = Boolean(initialItem && initialItem.id);

  useEffect(() => {
    if (initialItem) {
      setFormData({ ...initialItem });
    } else {
      setFormData({
        id: `imp-${Date.now()}`,
        ...DEFAULT_NEW_ITEM,
        item: `IMP-${Math.floor(100 + Math.random() * 900)}`,
        proveedor: existingProviders[0] || 'NUEVO PROVEEDOR',
      });
    }
  }, [initialItem, isOpen]);

  if (!isOpen) return null;

  const calculated = calculateItem(formData);

  const handleNumChange = (field: keyof ImportItem, value: string) => {
    const num = parseFloat(value);
    setFormData((prev) => ({
      ...prev,
      [field]: isNaN(num) ? 0 : num,
    }));
  };

  const handleApplyPreset = (type: 'mercosur' | 'general3pct' | 'sinSenasa') => {
    setFormData((prev) => {
      const cif = (prev.fob || 0) + (prev.flete || 0) + (prev.seguro || 0);
      if (type === 'mercosur') {
        return {
          ...prev,
          derechos: 0,
          tasaEstadistica: 0,
          sim: 10,
          digitalizacion: 24,
          senasa: 10,
          honorariosDespachante: 500,
          gastosOperativos: 35,
        };
      }
      if (type === 'general3pct') {
        return {
          ...prev,
          tasaEstadistica: Math.round(cif * 0.03 * 100) / 100,
          sim: 10,
          digitalizacion: 24,
          senasa: 10,
          honorariosDespachante: 500,
          gastosOperativos: 35,
        };
      }
      if (type === 'sinSenasa') {
        return {
          ...prev,
          senasa: 0,
          sim: 10,
          digitalizacion: 24,
          honorariosDespachante: 500,
          gastosOperativos: 35,
        };
      }
      return prev;
    });
  };

  const handleCalc3PctTasa = () => {
    const cif = (formData.fob || 0) + (formData.flete || 0) + (formData.seguro || 0);
    const tasa = Math.round(cif * 0.03 * 100) / 100;
    setFormData((prev) => ({ ...prev, tasaEstadistica: tasa }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.item.trim()) {
      alert('Por favor ingrese el número o identificador del Item / Despacho');
      return;
    }
    if (!formData.proveedor.trim()) {
      alert('Por favor ingrese o seleccione un proveedor');
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 text-white p-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 border border-indigo-400/30 rounded-xl">
              {isEditing ? <Calculator className="w-6 h-6 text-indigo-300" /> : <Plus className="w-6 h-6 text-indigo-300" />}
            </div>
            <div>
              <h3 className="text-xl font-bold">
                {isEditing ? `Editar Importación Item #${formData.item}` : 'Nueva Importación (Nueva Columna)'}
              </h3>
              <p className="text-xs text-indigo-200 mt-0.5">
                Completa los datos y las fórmulas se calcularán automáticamente en tiempo real
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets Bar */}
        <div className="bg-indigo-50/70 border-b border-indigo-100 px-6 py-2.5 flex items-center gap-2 flex-wrap text-xs">
          <span className="font-semibold text-indigo-900 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Presets Rápidos:
          </span>
          <button
            type="button"
            onClick={() => handleApplyPreset('general3pct')}
            className="px-2.5 py-1 bg-white border border-indigo-200 hover:border-indigo-400 text-indigo-800 rounded-md font-medium transition-colors shadow-2xs"
          >
            General Extra-Zona (Tasa 3%)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('mercosur')}
            className="px-2.5 py-1 bg-white border border-emerald-200 hover:border-emerald-400 text-emerald-800 rounded-md font-medium transition-colors shadow-2xs"
          >
            Mercosur (Derechos y Tasa 0%)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('sinSenasa')}
            className="px-2.5 py-1 bg-white border border-slate-200 hover:border-slate-400 text-slate-700 rounded-md font-medium transition-colors shadow-2xs"
          >
            Sin Arancel SENASA ($0)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Input Fields */}
            <div className="lg:col-span-2 space-y-5 max-h-[62vh] overflow-y-auto pr-2 custom-scrollbar">
              
              {/* Sección Identificación */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-500"></span> Identificación del Despacho
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Proveedor *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        list="providers-list"
                        value={formData.proveedor}
                        onChange={(e) => setFormData({ ...formData, proveedor: e.target.value.toUpperCase() })}
                        placeholder="Ej. BAZAN, NINGBO, BRASKEM"
                        required
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none uppercase font-semibold"
                      />
                      <datalist id="providers-list">
                        {existingProviders.map((p) => (
                          <option key={p} value={p} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Item / N° Despacho *
                    </label>
                    <input
                      type="text"
                      value={formData.item}
                      onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                      placeholder="Ej. 193, 204B, OT-409"
                      required
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Sección Base y CIF */}
              <div className="p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/20">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" /> Valores Base & Valor CIF
                  </h4>
                  <span className="text-[11px] font-mono text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md font-semibold">
                    CIF = FOB + FLETE + SEGURO
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Valor FOB (USD) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={formData.fob || ''}
                      onChange={(e) => handleNumChange('fob', e.target.value)}
                      placeholder="0.00"
                      required
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-mono font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Flete Internacional (USD)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={formData.flete || ''}
                      onChange={(e) => handleNumChange('flete', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Seguro (USD)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={formData.seguro || ''}
                      onChange={(e) => handleNumChange('seguro', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="mt-3 p-2.5 bg-emerald-100/50 rounded-lg flex items-center justify-between border border-emerald-200">
                  <span className="text-xs font-semibold text-emerald-900">Base Imponible Valor CIF:</span>
                  <span className="text-base font-bold font-mono text-emerald-800">
                    {formatCurrency(calculated.cif)}
                  </span>
                </div>
              </div>

              {/* Sección Derechos Aduaneros */}
              <div className="p-4 rounded-xl border border-blue-200/80 bg-blue-50/20">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" /> Derechos de Importación & Tasas
                  </h4>
                  <button
                    type="button"
                    onClick={handleCalc3PctTasa}
                    className="text-[11px] font-medium text-blue-700 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-2 py-0.5 rounded-md transition-colors"
                    title="Aplica 3% sobre el Valor CIF actual"
                  >
                    Calcular Tasa 3% CIF
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Derechos de Impo (USD)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={formData.derechos || ''}
                      onChange={(e) => handleNumChange('derechos', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Tasa Estadística (USD)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={formData.tasaEstadistica || ''}
                      onChange={(e) => handleNumChange('tasaEstadistica', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="mt-3 p-2 bg-blue-100/40 rounded-lg flex items-center justify-between border border-blue-200">
                  <span className="text-xs font-semibold text-blue-900">Costo de Derechos:</span>
                  <span className="text-sm font-bold font-mono text-blue-800">
                    {formatCurrency(calculated.costoDerechos)}
                  </span>
                </div>
              </div>

              {/* Sección Costo Financiero (Tasas AFIP / SENASA) */}
              <div className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/20">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span> Costo Financiero / Aranceles Oficiales
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      SIM (USD)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.sim}
                      onChange={(e) => handleNumChange('sim', e.target.value)}
                      placeholder="10.00"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Tasa Digitalización (USD)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.digitalizacion}
                      onChange={(e) => handleNumChange('digitalizacion', e.target.value)}
                      placeholder="24.00"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      SENASA (USD)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.senasa}
                      onChange={(e) => handleNumChange('senasa', e.target.value)}
                      placeholder="10.00"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="mt-3 p-2 bg-amber-100/40 rounded-lg flex items-center justify-between border border-amber-200">
                  <span className="text-xs font-semibold text-amber-900">Costo Financiero (SIM + Digit + SENASA):</span>
                  <span className="text-sm font-bold font-mono text-amber-800">
                    {formatCurrency(calculated.costoFinanciero)}
                  </span>
                </div>
              </div>

              {/* Sección Gastos Operativos y Logísticos */}
              <div className="p-4 rounded-xl border border-indigo-200/80 bg-indigo-50/20">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-800 mb-3 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-indigo-600" /> Gastos Operativos & Logística Local
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Honorarios Despachante
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.honorariosDespachante}
                      onChange={(e) => handleNumChange('honorariosDespachante', e.target.value)}
                      placeholder="500.00"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Gastos Operativos
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.gastosOperativos}
                      onChange={(e) => handleNumChange('gastosOperativos', e.target.value)}
                      placeholder="35.00"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Transporte Terrestre
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.transporte || ''}
                      onChange={(e) => handleNumChange('transporte', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Terminal Portuaria
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.terminal || ''}
                      onChange={(e) => handleNumChange('terminal', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Naviera / Agente
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.naviera || ''}
                      onChange={(e) => handleNumChange('naviera', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Depósito Fiscal
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.depositoFiscal || ''}
                      onChange={(e) => handleNumChange('depositoFiscal', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Forwarder (USD)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.forwarder || ''}
                      onChange={(e) => handleNumChange('forwarder', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="mt-3 p-2 bg-indigo-100/40 rounded-lg flex items-center justify-between border border-indigo-200">
                  <span className="text-xs font-semibold text-indigo-900">Total Gastos Operativos:</span>
                  <span className="text-sm font-bold font-mono text-indigo-800">
                    {formatCurrency(calculated.gastos)}
                  </span>
                </div>
              </div>

            </div>

            {/* Right Column: Live Calculation Summary Card */}
            <div className="lg:col-span-1 flex flex-col justify-between bg-slate-900 text-white rounded-2xl p-5 shadow-xl border border-slate-800">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Liquidación en Vivo
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full font-mono">
                    Auto-Calculado
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400 font-sans">Valor FOB:</span>
                    <span className="text-white font-semibold">{formatCurrency(calculated.fob)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400 font-sans">Valor CIF:</span>
                    <span className="text-emerald-400 font-semibold">{formatCurrency(calculated.cif)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400 font-sans">+ Costo Derechos:</span>
                    <span className="text-blue-400 font-semibold">{formatCurrency(calculated.costoDerechos)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400 font-sans">+ Costo Financiero:</span>
                    <span className="text-amber-400 font-semibold">{formatCurrency(calculated.costoFinanciero)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400 font-sans">+ Total Gastos:</span>
                    <span className="text-indigo-400 font-semibold">{formatCurrency(calculated.gastos)}</span>
                  </div>

                  {/* Highlights */}
                  <div className="p-3 mt-4 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-sans text-slate-300 font-semibold">TOTAL GASTOS IMPO:</span>
                      <span className="text-lg font-bold text-amber-300">
                        {formatCurrency(calculated.total)}
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline pt-2 border-t border-slate-700">
                      <span className="text-xs font-sans text-slate-300 font-semibold">% INCIDENCIA (TOTAL / FOB):</span>
                      <span className="text-base font-bold text-rose-300">
                        {formatPercent(calculated.porcentajeDisplay)}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-indigo-950/60 rounded-xl border border-indigo-800/50 flex justify-between items-baseline">
                    <span className="text-xs font-sans text-indigo-200 font-semibold">COSTO FINAL PUESTO EN PLANTA:</span>
                    <span className="text-lg font-bold text-teal-300">
                      {formatCurrency(calculated.costoFinalTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 mt-6 border-t border-slate-800 flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-2.5 px-3 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  {isEditing ? 'Guardar Cambios' : 'Agregar Columna'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
