import React, { useState, useEffect, useMemo } from 'react';
import type { ImportItem, CalculatedImportItem } from './types/import';
import { INITIAL_IMPORTS } from './data/initialData';
import { calculateItem, calculateSummary } from './utils/calculations';
import { exportToExcel, parseSpreadsheetFile } from './utils/exportImport';
import { Navbar } from './components/Navbar';
import { KpiCards } from './components/KpiCards';
import { FilterBar } from './components/FilterBar';
import { SpreadsheetView } from './components/SpreadsheetView';
import { TableView } from './components/TableView';
import { AnalyticsView } from './components/AnalyticsView';
import { ImportModal } from './components/ImportModal';
import { FormulaHelperModal } from './components/FormulaHelperModal';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const STORAGE_KEY = 'comex_imports_data_v1';

export const App: React.FC = () => {
  // Load initial data from localStorage if present
  const [items, setItems] = useState<ImportItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading saved items:', e);
    }
    return INITIAL_IMPORTS;
  });

  const [currentView, setCurrentView] = useState<'spreadsheet' | 'table' | 'analytics'>('spreadsheet');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<string>('ALL');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<ImportItem | null>(null);
  const [isFormulasOpen, setIsFormulasOpen] = useState<boolean>(false);

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }, [items]);

  // Calculated items
  const calculatedItems = useMemo(() => {
    return items.map(calculateItem);
  }, [items]);

  // Unique Providers list
  const providers = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (i.proveedor && i.proveedor.trim()) {
        set.add(i.proveedor.trim().toUpperCase());
      }
    });
    return Array.from(set).sort();
  }, [items]);

  // Filtered items
  const filteredCalculatedItems = useMemo(() => {
    return calculatedItems.filter((i) => {
      const matchSearch =
        !searchTerm.trim() ||
        i.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.proveedor.toLowerCase().includes(searchTerm.toLowerCase());

      const matchProv =
        selectedProvider === 'ALL' ||
        i.proveedor.toUpperCase() === selectedProvider.toUpperCase();

      return matchSearch && matchProv;
    });
  }, [calculatedItems, searchTerm, selectedProvider]);

  // Summary totals for currently displayed items
  const summary = useMemo(() => {
    return calculateSummary(filteredCalculatedItems);
  }, [filteredCalculatedItems]);

  // Handlers
  const handleSaveItem = (itemToSave: ImportItem) => {
    setItems((prev) => {
      const existsIndex = prev.findIndex((i) => i.id === itemToSave.id);
      if (existsIndex >= 0) {
        const next = [...prev];
        next[existsIndex] = itemToSave;
        showToast(`Importación #${itemToSave.item} actualizada correctamente.`);
        return next;
      } else {
        showToast(`Nueva importación #${itemToSave.item} agregada como columna.`);
        return [...prev, itemToSave];
      }
    });
    setEditingItem(null);
  };

  const handleDuplicateItem = (item: CalculatedImportItem) => {
    const newItem: ImportItem = {
      ...item,
      id: `imp-${Date.now()}`,
      item: `${item.item}-COPIA`,
    };
    setItems((prev) => [...prev, newItem]);
    showToast(`Se duplicó la importación #${item.item} con éxito.`);
  };

  const handleDeleteItem = (id: string) => {
    const itemToDelete = items.find((i) => i.id === id);
    const itemName = itemToDelete ? itemToDelete.item : 'esta importación';
    if (window.confirm(`¿Estás seguro de eliminar el item #${itemName}?`)) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      showToast(`Item #${itemName} eliminado.`, 'success');
    }
  };

  const handleQuickAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEditItem = (item: CalculatedImportItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCellChange = (id: string, field: keyof ImportItem, value: number | string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            [field]: value,
          };
        }
        return item;
      })
    );
  };

  const handleExportExcel = () => {
    try {
      exportToExcel(calculatedItems);
      showToast('Planilla de Excel exportada exitosamente.');
    } catch (e) {
      console.error(e);
      showToast('Error al exportar archivo Excel.', 'error');
    }
  };

  const handleImportFile = async (file: File) => {
    try {
      const imported = await parseSpreadsheetFile(file);
      if (imported.length > 0) {
        setItems(imported);
        showToast(`Se importaron ${imported.length} despachos exitosamente.`);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Error al importar el archivo: ${err.message || 'Formato no soportado'}`);
    }
  };

  const handleResetData = () => {
    if (
      window.confirm(
        '¿Deseas restablecer los datos originales de la planilla (21 importaciones de Bazan, Roma, Myriad, Ningbo y Braskem)?'
      )
    ) {
      setItems(INITIAL_IMPORTS);
      showToast('Datos originales restablecidos.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl text-xs font-semibold animate-in slide-in-from-bottom-5 border border-slate-700">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        onNewImport={handleQuickAdd}
        onExportExcel={handleExportExcel}
        onImportFile={handleImportFile}
        onResetData={handleResetData}
        onShowFormulas={() => setIsFormulasOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {/* KPI Summary Cards */}
        <KpiCards
          summary={summary}
          filteredCount={filteredCalculatedItems.length}
          totalCount={items.length}
        />

        {/* Filter and Search Bar */}
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedProvider={selectedProvider}
          onProviderChange={setSelectedProvider}
          providers={providers}
          totalCount={items.length}
        />

        {/* Dynamic Views */}
        {currentView === 'spreadsheet' && (
          <SpreadsheetView
            items={filteredCalculatedItems}
            summary={summary}
            onEdit={handleEditItem}
            onDuplicate={handleDuplicateItem}
            onDelete={handleDeleteItem}
            onQuickAdd={handleQuickAdd}
            onCellChange={handleCellChange}
            onShowFormulas={() => setIsFormulasOpen(true)}
          />
        )}

        {currentView === 'table' && (
          <TableView
            items={filteredCalculatedItems}
            summary={summary}
            onEdit={handleEditItem}
            onDuplicate={handleDuplicateItem}
            onDelete={handleDeleteItem}
            onQuickAdd={handleQuickAdd}
          />
        )}

        {currentView === 'analytics' && (
          <AnalyticsView
            items={filteredCalculatedItems}
            summary={summary}
          />
        )}
      </main>

      {/* Add / Edit Import Modal */}
      <ImportModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        initialItem={editingItem}
        existingProviders={providers}
      />

      {/* Formula Documentation Modal */}
      <FormulaHelperModal
        isOpen={isFormulasOpen}
        onClose={() => setIsFormulasOpen(false)}
      />
    </div>
  );
};

export default App;
