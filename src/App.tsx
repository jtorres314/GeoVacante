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
import { ExportModal } from './components/ExportModal';
import { ClipboardList, MapPin, BarChart3 } from 'lucide-react';

function DashboardContent() {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'gestion' | 'mapa' | 'analitica'>('mapa');

  return (
    <div className="flex h-screen w-full flex-col bg-slate-100 text-slate-800 overflow-hidden font-sans">
      {/* 1. Header Superior (Sticky) */}
      <Header onOpenExport={() => setIsExportOpen(true)} />

      {/* Mobile & Tablet Tab Navigation Bar (Visible only below lg breakpoint) */}
      <div className="flex lg:hidden bg-white border-b border-slate-200 px-3 py-1.5 shrink-0 gap-1.5 shadow-xs overflow-x-auto">
        <button
          onClick={() => setMobileTab('gestion')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            mobileTab === 'gestion'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <ClipboardList className="h-3.5 w-3.5 shrink-0" />
          <span>Gestión & Vacantes</span>
        </button>

        <button
          onClick={() => setMobileTab('mapa')}
          className={`flex-1 min-w-[110px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            mobileTab === 'mapa'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span>Mapa Colombia</span>
        </button>

        <button
          onClick={() => setMobileTab('analitica')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            mobileTab === 'analitica'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5 shrink-0" />
          <span>En Vivo & Analítica</span>
        </button>
      </div>

      {/* Main Work Area */}
      <main className="flex-1 min-h-0 w-full p-2.5 sm:p-3 overflow-hidden">
        {/* Mobile & Tablet Active Tab View (Visible only below lg) */}
        <div className="flex lg:hidden h-full flex-col min-h-0 overflow-hidden">
          {mobileTab === 'gestion' && (
            <div className="flex flex-col gap-2.5 h-full min-h-0 overflow-hidden">
              <div className="shrink-0">
                <RegistrarEscogencia />
              </div>
              <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                <DepartmentAccordion />
              </div>
            </div>
          )}

          {mobileTab === 'mapa' && (
            <div className="h-full min-h-0 flex flex-col">
              <ColombiaMap />
            </div>
          )}

          {mobileTab === 'analitica' && (
            <div className="h-full min-h-0 flex flex-col">
              <AnalyticsPanel />
            </div>
          )}
        </div>

        {/* Desktop 3-Column Layout (Visible only on lg and above) */}
        <div className="hidden lg:grid h-full grid-cols-12 gap-3">
          {/* Columna Izquierda (Gestión y Árbol de Dependencias) */}
          <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-2.5 h-full min-h-0 overflow-hidden">
            <div className="shrink-0">
              <RegistrarEscogencia />
            </div>
            <DepartmentAccordion />
          </div>

          {/* Columna Central (Mapa Geográfico de Colombia interactivo) */}
          <div className="lg:col-span-5 xl:col-span-6 flex flex-col h-full min-h-0">
            <ColombiaMap />
          </div>

          {/* Columna Derecha (Analítica y Saturación) */}
          <div className="lg:col-span-3 xl:col-span-3 flex flex-col h-full min-h-0">
            <AnalyticsPanel />
          </div>
        </div>
      </main>

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
