import type { ImportItem, CalculatedImportItem } from '../types/import';

export function calculateItem(item: ImportItem): CalculatedImportItem {
  const fob = Number(item.fob) || 0;
  const flete = Number(item.flete) || 0;
  const seguro = Number(item.seguro) || 0;

  const cif = fob + flete + seguro;

  const derechos = Number(item.derechos) || 0;
  const tasaEstadistica = Number(item.tasaEstadistica) || 0;
  const costoDerechos = derechos + tasaEstadistica;

  const sim = Number(item.sim) || 0;
  const digitalizacion = Number(item.digitalizacion) || 0;
  const senasa = Number(item.senasa) || 0;
  const costoFinanciero = sim + digitalizacion + senasa;

  const forwarder = Number(item.forwarder) || 0;
  const honorariosDespachante = Number(item.honorariosDespachante) || 0;
  const gastosOperativos = Number(item.gastosOperativos) || 0;
  const naviera = Number(item.naviera) || 0;
  const terminal = Number(item.terminal) || 0;
  const depositoFiscal = Number(item.depositoFiscal) || 0;
  const transporte = Number(item.transporte) || 0;

  const gastos =
    forwarder +
    honorariosDespachante +
    gastosOperativos +
    naviera +
    terminal +
    depositoFiscal +
    transporte;

  const total = costoDerechos + costoFinanciero + gastos;
  const porcentaje = fob > 0 ? total / fob : 0;
  const porcentajeDisplay = porcentaje * 100;
  const costoFinalTotal = fob + total;

  return {
    ...item,
    fob,
    flete,
    seguro,
    cif,
    derechos,
    tasaEstadistica,
    costoDerechos,
    sim,
    digitalizacion,
    senasa,
    costoFinanciero,
    forwarder,
    honorariosDespachante,
    gastosOperativos,
    naviera,
    terminal,
    depositoFiscal,
    transporte,
    gastos,
    total,
    porcentaje,
    porcentajeDisplay,
    costoFinalTotal,
  };
}

export interface SummaryTotals {
  count: number;
  fob: number;
  flete: number;
  seguro: number;
  cif: number;
  derechos: number;
  tasaEstadistica: number;
  costoDerechos: number;
  sim: number;
  digitalizacion: number;
  senasa: number;
  costoFinanciero: number;
  forwarder: number;
  honorariosDespachante: number;
  gastosOperativos: number;
  naviera: number;
  terminal: number;
  depositoFiscal: number;
  transporte: number;
  gastos: number;
  total: number;
  promedioIncidencia: number;
  costoFinalTotal: number;
}

export function calculateSummary(items: CalculatedImportItem[]): SummaryTotals {
  const init: SummaryTotals = {
    count: items.length,
    fob: 0,
    flete: 0,
    seguro: 0,
    cif: 0,
    derechos: 0,
    tasaEstadistica: 0,
    costoDerechos: 0,
    sim: 0,
    digitalizacion: 0,
    senasa: 0,
    costoFinanciero: 0,
    forwarder: 0,
    honorariosDespachante: 0,
    gastosOperativos: 0,
    naviera: 0,
    terminal: 0,
    depositoFiscal: 0,
    transporte: 0,
    gastos: 0,
    total: 0,
    promedioIncidencia: 0,
    costoFinalTotal: 0,
  };

  const totals = items.reduce((acc, curr) => {
    acc.fob += curr.fob;
    acc.flete += curr.flete;
    acc.seguro += curr.seguro;
    acc.cif += curr.cif;
    acc.derechos += curr.derechos;
    acc.tasaEstadistica += curr.tasaEstadistica;
    acc.costoDerechos += curr.costoDerechos;
    acc.sim += curr.sim;
    acc.digitalizacion += curr.digitalizacion;
    acc.senasa += curr.senasa;
    acc.costoFinanciero += curr.costoFinanciero;
    acc.forwarder += curr.forwarder;
    acc.honorariosDespachante += curr.honorariosDespachante;
    acc.gastosOperativos += curr.gastosOperativos;
    acc.naviera += curr.naviera;
    acc.terminal += curr.terminal;
    acc.depositoFiscal += curr.depositoFiscal;
    acc.transporte += curr.transporte;
    acc.gastos += curr.gastos;
    acc.total += curr.total;
    acc.costoFinalTotal += curr.costoFinalTotal;
    return acc;
  }, init);

  totals.promedioIncidencia = totals.fob > 0 ? (totals.total / totals.fob) * 100 : 0;
  return totals;
}
