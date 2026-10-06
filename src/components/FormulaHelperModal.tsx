import React from 'react';
import { HelpCircle, X, Calculator, ShieldCheck, DollarSign, Truck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const FormulaHelperModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const formulas = [
    {
      title: '1. Base Imponible Valor CIF',
      icon: <DollarSign className="w-5 h-5 text-emerald-600" />,
      formula: 'VALOR CIF = FOB + FLETE + SEGURO',
      description:
        'Es el valor de la mercadería puesta en puerto o aduana de destino. Sobre este valor se calculan la base imponible de los derechos arancelarios y la tasa estadística.',
      badge: 'Base Aduanera',
    },
    {
      title: '2. Costo de Derechos Aduaneros',
      icon: <ShieldCheck className="w-5 h-5 text-blue-600" />,
      formula: 'COSTO DE DERECHOS = DERECHOS DE IMPO + TASA ESTADISTICA',
      description:
        'Suma de los tributos de importación. Tasa Estadística es típicamente el 3% del CIF (o 0% para orígenes Mercosur o acuerdos preferenciales). Los Derechos varían según la posición arancelaria (NCM).',
      badge: 'Tributos',
    },
    {
      title: '3. Costo Financiero / Tasas Oficiales',
      icon: <Calculator className="w-5 h-5 text-amber-600" />,
      formula: 'COSTO FINANCIERO = SIM ($10) + TASA DIGITALIZACION ($24) + SENASA ($10 ó $0)',
      description:
        'Tasas fijas administrativas y aranceles de registro por despacho aduanero (Sistema Informático María/Malvina, Digitalización de Legajos AFIP, y SENASA en caso de aplicar).',
      badge: 'Tasas Fijas',
    },
    {
      title: '4. Total de Gastos Operativos y Logística',
      icon: <Truck className="w-5 h-5 text-indigo-600" />,
      formula:
        'GASTOS = FORWARDER + DESPACHANTE + GASTOS OPERATIVOS + NAVIERA + TERMINAL + DEPOSITO FISCAL + TRANSPORTE',
      description:
        'Consolida todos los honorarios de agentes y costos logísticos locales e internacionales vinculados a la liberación física del contenedor o carga.',
      badge: 'Logística',
    },
    {
      title: '5. Total Costo de Nacionalización',
      icon: <Calculator className="w-5 h-5 text-purple-600" />,
      formula: 'TOTAL = COSTO DE DERECHOS + COSTO FINANCIERO + GASTOS',
      description:
        'Representa el desembolso total para importar y nacionalizar la mercadería, excluyendo el valor FOB original de compra.',
      badge: 'Total Desembolso',
    },
    {
      title: '6. % Incidencia (Factor de Costo)',
      icon: <Calculator className="w-5 h-5 text-rose-600" />,
      formula: '% INCIDENCIA = (TOTAL / FOB) * 100',
      description:
        'Indica el porcentaje adicional que representa la nacionalización sobre el valor de compra FOB. Clave para calcular el mark-up y precio de venta final.',
      badge: 'KPI Clave',
    },
    {
      title: '7. Costo Total Puesto en Planta (Final)',
      icon: <DollarSign className="w-5 h-5 text-teal-600" />,
      formula: 'COSTO FINAL = FOB + TOTAL',
      description:
        'Costo total consolidado de la mercadería adquirida y nacionalizada (FOB + todos los gastos y derechos).',
      badge: 'Costo Final',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 border border-indigo-400/30 rounded-xl">
              <HelpCircle className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Fórmulas del Sistema de Importación</h3>
              <p className="text-xs text-indigo-200 mt-0.5">
                Reglas matemáticas extraídas y estandarizadas de tu planilla de cálculo
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

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {formulas.map((f, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-indigo-200 transition-all shadow-xs"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {f.icon}
                  <span className="font-semibold text-slate-900 text-sm">{f.title}</span>
                </div>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {f.badge}
                </span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200/80 rounded-lg font-mono text-xs font-semibold text-indigo-700 mb-2 select-all">
                {f.formula}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>

        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
