export interface ImportItem {
  id: string;
  item: string;
  proveedor: string;
  fecha?: string;
  descripcion?: string;

  // Base
  fob: number;
  flete: number;
  seguro: number;

  // Derechos e Impuestos
  derechos: number;
  tasaEstadistica: number;

  // Costo Financiero / Tasas
  sim: number;
  digitalizacion: number;
  senasa: number;

  // Gastos Operativos y Logísticos
  forwarder: number;
  honorariosDespachante: number;
  gastosOperativos: number;
  naviera: number;
  terminal: number;
  depositoFiscal: number;
  transporte: number;
}

export interface CalculatedImportItem extends ImportItem {
  cif: number;
  costoDerechos: number;
  costoFinanciero: number;
  gastos: number;
  total: number;
  porcentaje: number; // Factor incidencia (total / fob)
  porcentajeDisplay: number; // percentage as 0-100%
  costoFinalTotal: number; // FOB + Total gastos nacionalización
}

export interface ColumnDefinition {
  key: keyof CalculatedImportItem;
  label: string;
  category: 'header' | 'base' | 'derechos' | 'financiero' | 'gastos' | 'totales';
  isCalculated: boolean;
  formulaDescription?: string;
  format?: 'currency' | 'percent' | 'text' | 'number';
  tooltip?: string;
}

export interface PresetTemplate {
  name: string;
  description: string;
  proveedor: string;
  sim: number;
  digitalizacion: number;
  senasa: number;
  honorariosDespachante: number;
  gastosOperativos: number;
  tasaEstadisticaPct?: number; // e.g. 0.03 (3%)
  derechosPct?: number;
  navieraDefault?: number;
  terminalDefault?: number;
}
