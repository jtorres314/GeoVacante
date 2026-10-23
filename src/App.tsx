/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { VacantesProvider } from './context/VacantesContext';
import { Header } from './components/Header';
import { RegistrarEscogencia } from './components/LeftColumn/RegistrarEscogencia';
import { DepartmentAccordion } from './components/LeftColumn/DepartmentAccordion';
import { ColombiaMap } from './components/CenterColumn/ColombiaMap';
import { AnalyticsPanel } from './components/RightColumn/AnalyticsPanel';
import { ToastUndo } from './components/ToastUndo';
import { ExportModal } from './components/ExportModal';

function DashboardContent() {
  const [isExportOpen, setIsExportOpen] = useState(false);

  return (
    <div className="flex h-screen w-full flex-col bg-slate-100 text-slate-800 overflow-hidden font-sans">
      {/* 1. Header Superior (Sticky) */}
      <Header onOpenExport={() => setIsExportOpen(true)} />

      {/* Main 3-Column Work Area */}
      <main className="flex-1 min-h-0 w-full p-2.5 sm:p-3 overflow-hidden">
        <div className="grid h-full grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-3">
          {/* 2. Columna Izquierda (Gestión y Árbol de Dependencias) */}
          <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-2 h-full min-h-0 overflow-hidden">
            {/* Formulario Registrar Escogencia */}
            <div className="shrink-0">
              <RegistrarEscogencia />
            </div>

            {/* Buscador y Lista en Acordeón */}
            <DepartmentAccordion />
          </div>

          {/* 3. Columna Central (Mapa Geográfico de Colombia interactivo) */}
          <div className="lg:col-span-5 xl:col-span-6 flex flex-col h-full min-h-0">
            <ColombiaMap />
          </div>

          {/* 4. Columna Derecha (Analítica y Saturación) */}
          <div className="lg:col-span-3 xl:col-span-3 flex flex-col h-full min-h-0">
            <AnalyticsPanel />
          </div>
        </div>
      </main>

      {/* 5. Notificaciones Toast flotantes con función Undo */}
      <ToastUndo />

      {/* Export modal dialog */}
      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <VacantesProvider>
      <DashboardContent />
    </VacantesProvider>
  );
}
