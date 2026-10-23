import React, { useState } from 'react';
import { useVacantes } from '../context/VacantesContext';
import {
  RotateCcw,
  Sparkles,
  Download,
  Scale,
  Undo2,
  Cloud,
  Volume2,
  VolumeX,
  Lock,
  Calendar,
  Trash2,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { playLivePostulationSound, isSoundMuted, setSoundMuted } from '../utils/audioChime';
import { HearingChronometer } from './HearingChronometer';

interface HeaderProps {
  onOpenExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenExport }) => {
  const {
    kpis,
    restablecerDatosFabrica,
    simularAsignacionAleatoria,
    canUndo,
    undoLastAction,
    lastUndoText,
    cloudSyncStatus,
    lastCloudSyncTime,
    isHearingDay,
    isHearingFinished,
    limpiarBaseDatosParaAudienciaReal,
  } = useVacantes();

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showCleanRealConfirm, setShowCleanRealConfirm] = useState(false);
  const [muted, setMuted] = useState<boolean>(() => isSoundMuted());

  const handleToggleSound = () => {
    const next = !muted;
    setMuted(next);
    setSoundMuted(next);
    if (!next) {
      playLivePostulationSound();
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white px-3 sm:px-4 py-2 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Brand Zone & Automatic Phase Status */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs shrink-0">
            <Scale className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold tracking-tight text-slate-900">
                CONCURSO FISCALÍA 2025
              </h1>
              <span className="hidden md:inline-block rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                OPECE I-204-M-01
              </span>

              {/* Automatic Phase Indicator: Automatically switches when 23 Oct arrives or finishes at 17:00 */}
              {isHearingFinished ? (
                <span
                  title="Audiencia Oficial Finalizada (17:00 COT). Modo Solo Lectura para Comprobación de Asignaciones Definitivas."
                  className="flex items-center gap-1 rounded bg-blue-100 px-2 py-0.5 text-[10px] font-extrabold text-blue-900 border border-blue-300"
                >
                  <Lock className="h-3 w-3 text-blue-700" />
                  AUDIENCIA FINALIZADA (17:00)
                </span>
              ) : isHearingDay ? (
                <span
                  title="23 de Octubre de 2026: Día Oficial de Audiencia Real. Marcado automáticamente según la fecha oficial."
                  className="flex items-center gap-1 rounded bg-red-100 px-2 py-0.5 text-[10px] font-extrabold text-red-700 border border-red-300 animate-pulse"
                >
                  <ShieldAlert className="h-3 w-3 text-red-600" />
                  AUDIENCIA REAL (23 OCT)
                </span>
              ) : (
                <span
                  title="Fase de Simulación permitida hasta el 22 de Octubre de 2026. El 23 de Octubre se activará de forma automática."
                  className="flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200"
                >
                  <Calendar className="h-3 w-3 text-amber-600" />
                  SIMULACIÓN (Hasta 22 Oct)
                </span>
              )}
            </div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
              Asistente de Fiscal I — 347 Vacantes Definitivas
            </p>
          </div>
        </div>

        {/* Live KPI Metric Strip */}
        <div className="flex items-center gap-2 overflow-x-auto py-0.5">
          {/* Total Vacantes */}
          <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Total
            </span>
            <span className="font-mono text-xs font-extrabold text-slate-900 tabular-nums">
              {kpis.totalOfertados}
            </span>
          </div>

          {/* Vacantes Ocupadas */}
          <div className="flex items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-1 border border-red-200">
            <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
              Ocupadas
            </span>
            <span className="font-mono text-xs font-extrabold text-red-600 tabular-nums">
              {kpis.totalOcupados}
            </span>
          </div>

          {/* Vacantes Disponibles */}
          <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 border border-emerald-200">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
              Disponibles
            </span>
            <span className="font-mono text-xs font-extrabold text-emerald-700 tabular-nums">
              {kpis.totalDisponibles}
            </span>
          </div>

          {/* % Ocupación */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              % Ocupación
            </span>
            <span className="font-mono text-xs font-bold text-amber-600 tabular-nums">
              {kpis.porcentajeOcupacion.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Functional Clock & Hearing Chronometer Widget */}
        <HearingChronometer isHearingDay={isHearingDay} />

        {/* Action Controls */}
        <div className="w-full 2xl:w-auto flex flex-wrap items-center justify-center 2xl:justify-end gap-2 pt-1.5 border-t border-slate-100 2xl:border-t-0 2xl:pt-0">

          {/* Undo Action */}
          {canUndo && !isHearingDay && !isHearingFinished && (
            <button
              onClick={undoLastAction}
              title={lastUndoText ? `Deshacer: ${lastUndoText}` : 'Deshacer'}
              className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors shadow-2xs cursor-pointer"
            >
              <Undo2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Deshacer</span>
            </button>
          )}

          {/* Simulate Action (Blocked on October 23 Hearing Day) */}
          <button
            onClick={simularAsignacionAleatoria}
            disabled={isHearingDay || isHearingFinished}
            title={
              isHearingFinished
                ? 'DESHABILITADO: La audiencia finalizó a las 17:00 del 23 de octubre. La app está en modo solo lectura.'
                : isHearingDay
                ? 'DESHABILITADO: El 23 de octubre de 2026 es el día de la AUDIENCIA REAL. Las simulaciones están bloqueadas por protocolo de mérito.'
                : 'Simular asignación aleatoria'
            }
            className={`hidden sm:flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold border transition-all shadow-2xs ${
              isHearingDay || isHearingFinished
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 cursor-pointer'
            }`}
          >
            {isHearingDay || isHearingFinished ? (
              <>
                <Lock className="h-3.5 w-3.5 text-slate-400" />
                <span>Simulación Bloqueada</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                <span>Simular Asignación</span>
              </>
            )}
          </button>

          {/* Clean Database Button for October 23 Official Hearing Day */}
          {isHearingDay && !isHearingFinished && (
            <button
              onClick={() => setShowCleanRealConfirm(true)}
              title="Limpiar base de datos para la audiencia real (Eliminar simulaciones y restaurar las 347 vacantes ofertadas)"
              className="flex items-center gap-1.5 rounded-lg bg-red-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-red-700 transition-colors shadow-xs cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Limpiar BD Audiencia</span>
            </button>
          )}

          {/* Export Action */}
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 border border-slate-200 hover:bg-slate-200/80 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Exportar</span>
          </button>

          {/* Sound Notification Alert Toggle */}
          <button
            onClick={handleToggleSound}
            title={muted ? 'Activar sonido de postulaciones en tiempo real' : 'Sonido activado (clic para silenciar)'}
            className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold border transition-all cursor-pointer ${
              !muted
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 shadow-2xs'
                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200/80'
            }`}
          >
            {!muted ? (
              <>
                <Volume2 className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
                <span className="hidden md:inline">Sonido</span>
              </>
            ) : (
              <>
                <VolumeX className="h-3.5 w-3.5 text-slate-400" />
                <span className="hidden md:inline">Silenciado</span>
              </>
            )}
          </button>

          {/* Reset Action (Disabled on October 23 Hearing Day) */}
          <button
            onClick={() => !isHearingDay && setShowResetConfirm(true)}
            disabled={isHearingDay}
            title={
              isHearingDay
                ? 'DESHABILITADO: Restablecer está inhabilitado durante la audiencia real oficial del 23 de octubre.'
                : 'Restablecer datos predeterminados'
            }
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium border transition-colors ${
              isHearingDay
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-red-600 hover:border-red-200 cursor-pointer'
            }`}
          >
            {isHearingDay ? (
              <Lock className="h-3.5 w-3.5 text-slate-400" />
            ) : (
              <RotateCcw className="h-3.5 w-3.5" />
            )}
            <span className="hidden md:inline">Restablecer</span>
          </button>

          {/* Google Cloud Firestore sync badge */}
          <div
            title={
              cloudSyncStatus === 'connected'
                ? `Conectado a Google Cloud Firestore. Última sincronización: ${lastCloudSyncTime || 'En tiempo real'}`
                : cloudSyncStatus === 'syncing'
                ? 'Conectando con Google Cloud Firestore...'
                : 'Modo local activo (reintentando conexión cloud)'
            }
            className={`hidden lg:flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-semibold border ${
              cloudSyncStatus === 'connected'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : cloudSyncStatus === 'syncing'
                ? 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            <Cloud className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-[10px]">
              {cloudSyncStatus === 'connected'
                ? 'Cloud Firestore'
                : cloudSyncStatus === 'syncing'
                ? 'Conectando...'
                : 'Offline'}
            </span>
          </div>
        </div>
      </div>


      {/* Confirmation modal for standard reset (pre-hearing) */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-2xs">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-red-500" />
              ¿Restablecer datos de fábrica?
            </h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Esta acción restaurará las 347 vacantes oficiales y reiniciará las seccionales a su estado base de simulación.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  restablecerDatosFabrica();
                  setShowResetConfirm(false);
                }}
                className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-red-500"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation modal for October 23 Official Hearing DB Clean */}
      {showCleanRealConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-2.5 text-red-600">
              <ShieldAlert className="h-6 w-6" />
              <h3 className="text-base font-extrabold text-slate-900">
                Limpiar Base de Datos para la Audiencia Real
              </h3>
            </div>
            <p className="mt-3 text-xs text-slate-600 leading-relaxed">
              El <strong>23 de octubre de 2026</strong> inicia la <strong>Audiencia Pública Oficial de Asignación de Vacantes</strong> (Asistente de Fiscal I, OPECE I-204-M-01).
            </p>
            <div className="mt-3 rounded-lg bg-red-50 p-3 text-[11px] text-red-800 border border-red-200 space-y-1">
              <p className="font-bold">Esta operación realizará en Google Cloud Firestore:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Eliminará todos los registros de prueba y simulaciones previas.</li>
                <li>Restaurará las 347 vacantes definitivas (347 disponibles, 0 ocupadas).</li>
                <li>Bloqueará botones de simulación y restablecimiento para garantizar estricto orden de mérito.</li>
              </ul>
            </div>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                onClick={() => setShowCleanRealConfirm(false)}
                className="rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  await limpiarBaseDatosParaAudienciaReal();
                  setShowCleanRealConfirm(false);
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition-colors"
              >
                Ejecutar Limpieza Oficial
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
