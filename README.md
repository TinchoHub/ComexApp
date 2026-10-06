# ComexFlow — Gestor de Importaciones y Costos de Nacionalización

Aplicación web desarrollada para la gestión ágil e interactiva de importaciones, reemplazando la creación manual de columnas y fórmulas en Excel.

## 🚀 Acceso Rápido

El servidor de desarrollo ya se encuentra iniciado y disponible localmente en:
👉 **[http://localhost:5173/](http://localhost:5173/)**

Para compilar para producción:
```bash
npm run build
npm run preview
```

---

## 🧮 Fórmulas Implementadas (Fieles a la Planilla Original)

1. **Base Imponible Valor CIF**:
   $$\text{VALOR CIF} = \text{FOB} + \text{FLETE} + \text{SEGURO}$$
2. **Costo de Derechos Aduaneros**:
   $$\text{COSTO DE DERECHOS} = \text{DERECHOS DE IMPO} + \text{TASA ESTADÍSTICA}$$
   *(Tasa Estadística es el 3% del CIF para extra-zona o 0% para orígenes Mercosur)*
3. **Costo Financiero (Tasas Oficiales)**:
   $$\text{COSTO FINANCIERO} = \text{SIM (\$10)} + \text{TASA DIGITALIZACIÓN (\$24)} + \text{SENASA (\$10 ó \$0)}$$
4. **Total Gastos Operativos y Logísticos**:
   $$\text{GASTOS} = \text{FORWARDER} + \text{HONORARIOS DESPACHANTE} + \text{GASTOS OPERATIVOS} + \text{NAVIERA} + \text{TERMINAL} + \text{DEPÓSITO FISCAL} + \text{TRANSPORTE}$$
5. **Total Desembolso de Nacionalización**:
   $$\text{TOTAL} = \text{COSTO DE DERECHOS} + \text{COSTO FINANCIERO} + \text{GASTOS}$$
6. **% Incidencia (Factor de Costo)**:
   $$\% \text{ INCIDENCIA} = \left(\frac{\text{TOTAL}}{\text{FOB}}\right) \times 100$$
7. **Costo Final Puesto en Planta**:
   $$\text{COSTO FINAL} = \text{FOB} + \text{TOTAL}$$

---

## ✨ Características Principales

- **Datos Originales Pre-Cargados**: Incluye los 21 despachos de tu planilla (BAZAN, ROMA, MYRIAD, NINGBO, BRASKEM) con coincidencia exacta al centavo (FOB Total: \$1,470,415.39, Despachante: \$10,500.00, Transporte: \$27,540.60).
- **Vista Planilla Horizontal (Columnas)**: Mantiene el formato al que estás acostumbrado en Excel con cabeceras congeladas, edición en línea haciendo clic en cualquier celda y columna fija de totales a la derecha.
- **Vista Tabla Vertical (Filas)**: Permite ordenar despachos por valor FOB, costo de nacionalización, incidencia %, o filtrar por proveedor.
- **+ Nueva Importación**: Formulario interactivo con cálculo en tiempo real y presets rápidos (Mercosur 0%, General 3% Tasa, etc.) para agregar nuevas columnas con un clic sin lidiar con fórmulas rotas.
- **Duplicar / Clonar**: Duplica rápidamente un despacho para cargar uno similar.
- **Exportación & Importación**: Descarga tu planilla en formato Excel `.xlsx` original y tabular, o importa archivos existentes.
- **Persistencia Local**: Tus cambios se guardan automáticamente en tu navegador (`localStorage`).
- **Analíticas & Gráficos**: Comparativa de costos por proveedor y ranking de despachos por factor de incidencia.
