import React, { useState, useId } from 'react';
import { useVacantes } from '../../context/VacantesContext';
import { removeAccents } from '../../utils/textSanitizer';
import { BookmarkCheck, Lock } from 'lucide-react';

export const RegistrarEscogencia: React.FC = () => {
  const {
    departments,
    registrarEscogencia,
    selectedDeptId,
    setSelectedDeptId,
    broadcastTyping,
    clearTyping,
    viewMode,
    isHearingDay,
    isHearingFinished,
  } = useVacantes();
  const formId = useId();

  const [aspirante, setAspirante] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>(selectedDeptId || 'dc');
  const [selectedSec, setSelectedSec] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState('');

  React.useEffect(() => {
    setSelectedDept(selectedDeptId || 'dc');
  }, [selectedDeptId]);

  const currentDeptObj = departments.find((d) => d.id === selectedDept);
  const seccionalesList = currentDeptObj?.seccionales || [];

  React.useEffect(() => {
    if (seccionalesList.length > 0) {
      const isCurrentValid = seccionalesList.some((s) => s.id === selectedSec);
      if (!isCurrentValid) {
        const firstAvail = seccionalesList.find((s) => s.cuposDisponibles > 0);
        setSelectedSec(firstAvail ? firstAvail.id : seccionalesList[0].id);
      }
    } else {
      setSelectedSec('');
    }
  }, [selectedDept, seccionalesList, selectedSec]);

  // Broadcast typing / drafting state in real-time
  React.useEffect(() => {
    if (aspirante.trim().length >= 2 && currentDeptObj && !isHearingFinished) {
      const secObj = seccionalesList.find((s) => s.id === selectedSec);
      broadcastTyping(
        aspirante.trim(),
        currentDeptObj.nombre,
        secObj?.nombre || 'Seleccionando despacho'
      );
    } else if (aspirante.trim().length === 0) {
      clearTyping();
    }
  }, [aspirante, selectedDept, selectedSec, currentDeptObj, seccionalesList, broadcastTyping, clearTyping, isHearingFinished]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (isHearingFinished) {
      setErrorMsg('La audiencia ha finalizado a las 17:00 horas. No se permiten nuevas escogencias.');
      return;
    }

      const cleanName = removeAccents(
        aspirante
          .replace(/\s*[—–-]\s*Asistente de Fiscal\s*I\s*$/i, '')
          .replace(/\s*\(Asistente de Fiscal\s*I\)\s*$/i, '')
          .trim()
      );

    if (!cleanName) {
      setErrorMsg('Ingresa el nombre del elegible.');
      return;
    }

    if (!selectedDept || !selectedSec) {
      setErrorMsg('Selecciona un departamento y seccional.');
      return;
    }

    const success = registrarEscogencia(cleanName, selectedDept, selectedSec);
    if (success) {
      setAspirante('');
    }
  };

  const selectedSecObj = seccionalesList.find((s) => s.id === selectedSec);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
            Registrar Escogencia
          </h2>
          <p className="text-[10px] text-slate-500 font-medium">
            Postulación de Elegible
          </p>
        </div>
        {selectedSecObj && (
          <span
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
              selectedSecObj.cuposDisponibles > 0
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-600 border border-red-200'
            }`}
          >
            {selectedSecObj.cuposDisponibles > 0 ? 'DISPONIBLE' : 'SIN CUPOS'}
          </span>
        )}
      </div>

      {/* Mode banners */}
      {isHearingFinished ? (
        <div className="mt-1.5 rounded-lg bg-blue-50 p-2 text-[10px] text-blue-900 border border-blue-200 font-semibold leading-snug flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5 text-blue-700 shrink-0" />
          <span>
            <strong>AUDIENCIA FINALIZADA (17:00 COT):</strong> Sistema en modo solo lectura para comprobación. No se permiten modificaciones.
          </span>
        </div>
      ) : viewMode === 'solo_libera' ? (
        <div className="mt-1.5 rounded-lg bg-amber-50 p-1.5 text-[10px] text-amber-800 border border-amber-200 font-medium leading-snug">
          🎯 <strong>Modo Reasignación Prioritaria:</strong> Adjudicación estricta según lista de elegibles.
        </div>
      ) : isHearingDay ? (
        <div className="mt-1.5 rounded-lg bg-red-50 p-1.5 text-[10px] text-red-800 border border-red-200 font-medium leading-snug">
          🔴 <strong>AUDIENCIA PÚBLICA REAL (23 OCTUBRE 2026):</strong> Selección definitiva e irrevocable.
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-2 space-y-2">
        {/* Aspirante input */}
        <div>
          <label htmlFor={`${formId}-aspirante`} className="block text-[10px] font-bold uppercase tracking-wider text-slate-600">
            Nombre del Elegible <span className="text-red-500">*</span>
          </label>
          <input
            id={`${formId}-aspirante`}
            type="text"
            disabled={isHearingFinished}
            placeholder={isHearingFinished ? 'Audiencia finalizada — Asignación congelada' : 'Ej: Carlos Eduardo Méndez'}
            value={aspirante}
            onChange={(e) => {
              setAspirante(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 disabled:bg-slate-100 disabled:text-slate-500 transition-colors"
          />
        </div>

        {/* Cascading Selects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label htmlFor={`${formId}-depto`} className="block text-[10px] font-bold uppercase tracking-wider text-slate-600">
              Departamento
            </label>
            <select
              id={`${formId}-depto`}
              disabled={isHearingFinished}
              value={selectedDept}
              onChange={(e) => {
                const newDept = e.target.value;
                setSelectedDept(newDept);
                setSelectedDeptId(newDept ? newDept : null);
              }}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 disabled:bg-slate-100 disabled:text-slate-500 truncate"
            >
              <option value="">-- Seleccionar --</option>
              {departments.map((d) => {
                const totalDisp = d.seccionales.reduce((acc, s) => acc + s.cuposDisponibles, 0);
                return (
                  <option key={d.id} value={d.id}>
                    {d.nombre} ({totalDisp} disp.)
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label htmlFor={`${formId}-seccional`} className="block text-[10px] font-bold uppercase tracking-wider text-slate-600">
              Seccional / Despacho
            </label>
            <select
              id={`${formId}-seccional`}
              value={selectedSec}
              onChange={(e) => setSelectedSec(e.target.value)}
              disabled={isHearingFinished || !currentDeptObj || seccionalesList.length === 0}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 disabled:bg-slate-100 disabled:text-slate-500 truncate"
            >
              {!currentDeptObj ? (
                <option value="">-- Elige depto --</option>
              ) : (
                seccionalesList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre} ({s.cuposDisponibles} disp.)
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {errorMsg && (
          <div className="rounded-md bg-red-50 border border-red-200 p-1.5 text-[11px] text-red-600">
            {errorMsg}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isHearingFinished}
          className={`w-full flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold shadow-xs transition-all mt-1 ${
            isHearingFinished
              ? 'bg-slate-700 text-slate-300 cursor-not-allowed'
              : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.99] cursor-pointer'
          }`}
        >
          {isHearingFinished ? <Lock className="h-4 w-4" /> : <BookmarkCheck className="h-4 w-4" />}
          <span>{isHearingFinished ? '🔒 Audiencia Finalizada (Solo Lectura)' : 'Registrar escogencia (fijar)'}</span>
        </button>

        <div className="flex items-center justify-center gap-1.5 text-[9px] text-slate-500 font-medium">
          <span className={`h-1.5 w-1.5 rounded-full ${isHearingFinished ? 'bg-blue-500' : 'bg-emerald-500 animate-pulse'}`} />
          <span>{isHearingFinished ? 'Sincronizado — Registro Definitivo' : 'Sincronización en tiempo real vía Google Cloud'}</span>
        </div>
      </form>
    </div>
  );
};

