import React, { useRef } from 'react';
import {
  FileSpreadsheet,
  Table as TableIcon,
  BarChart3,
  Download,
  Upload,
  RotateCcw,
  Plus,
  HelpCircle,
  Ship,
} from 'lucide-react';

interface Props {
  currentView: 'spreadsheet' | 'table' | 'analytics';
  onViewChange: (view: 'spreadsheet' | 'table' | 'analytics') => void;
  onNewImport: () => void;
  onExportExcel: () => void;
  onImportFile: (file: File) => void;
  onResetData: () => void;
  onShowFormulas: () => void;
}

export const Navbar: React.FC<Props> = ({
  currentView,
  onViewChange,
  onNewImport,
  onExportExcel,
  onImportFile,
  onResetData,
  onShowFormulas,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportFile(file);
      e.target.value = '';
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-xl shadow-inner flex items-center justify-center">
              <Ship className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white m-0">
                  ComexFlow
                </h1>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  Planilla Dinámica
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Cálculo y Gestión de Costos de Importación
              </p>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/80 text-xs">
            <button
              onClick={() => onViewChange('spreadsheet')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                currentView === 'spreadsheet'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Planilla (Columnas)</span>
              <span className="md:hidden">Columnas</span>
            </button>

            <button
              onClick={() => onViewChange('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                currentView === 'table'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Tabla (Filas)</span>
              <span className="md:hidden">Tabla</span>
            </button>

            <button
              onClick={() => onViewChange('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                currentView === 'analytics'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Analíticas</span>
              <span className="md:hidden">Métricas</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx,.xls,.csv,.json"
              className="hidden"
            />

            {/* Formulas Help */}
            <button
              onClick={onShowFormulas}
              title="Ver fórmulas aplicadas"
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors hidden sm:flex"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Export */}
            <button
              onClick={onExportExcel}
              title="Descargar Excel con formato y fórmulas"
              className="px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden lg:inline">Exportar Excel</span>
            </button>

            {/* Import */}
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Cargar archivo Excel, CSV o JSON"
              className="px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden lg:inline">Importar</span>
            </button>

            {/* Reset */}
            <button
              onClick={onResetData}
              title="Restablecer los 21 datos originales de la planilla"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors hidden xl:flex"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* + Nueva Importación CTA */}
            <button
              onClick={onNewImport}
              className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nueva Impo</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
