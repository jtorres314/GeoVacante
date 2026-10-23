import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useVacantes } from '../../context/VacantesContext';
import { SortBarBy } from '../../types';
import {
  Trash2,
  Calendar,
  Pencil,
  Lock,
  GripHorizontal,
} from 'lucide-react';

export const AnalyticsPanel: React.FC = () => {
  const {
    departments,
    selectedDeptId,
    setSelectedDeptId,
    sortBarBy,
    setSortBarBy,
    escogencias,
    liberarEscogencia,
    expandOnlyDept,
    liveTypingUsers,
    isAdminAuthenticated,
    isHearingFinished,
  } = useVacantes();

  // Resizable split percentage: defaults strictly to 50% / 50%
  const [topPercent, setTopPercent] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const offsetY = e.clientY - rect.top;
      const pct = Math.max(20, Math.min(80, (offsetY / rect.height) * 100));
      setTopPercent(pct);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const sortedDepartments = useMemo(() => {
    const list = departments.map((d) => {
      const ofertados = d.seccionales.reduce((acc, s) => acc + s.cuposOfertados, 0);
      const disponibles = d.seccionales.reduce((acc, s) => acc + s.cuposDisponibles, 0);
      const ocupados = d.seccionales.reduce((acc, s) => acc + s.cuposOcupados, 0);
      const pctOcupado = ofertados > 0 ? (ocupados / ofertados) * 100 : 0;
      const isAgotado = disponibles === 0;

      return {
        id: d.id,
        nombre: d.nombre,
        ofertados,
        disponibles,
        ocupados,
        pctOcupado,
        isAgotado,
      };
    });

    if (sortBarBy === 'mayor_ocupacion') {
      return list.sort((a, b) => b.pctOcupado - a.pctOcupado || b.ocupados - a.ocupados);
    } else if (sortBarBy === 'mas_disponibles') {
      return list.sort((a, b) => b.disponibles - a.disponibles || a.pctOcupado - b.pctOcupado);
    } else {
      return list.sort((a, b) => a.nombre.localeCompare(b.nombre));
    }
  }, [departments, sortBarBy]);

  const handleSelectDept = (deptId: string) => {
    setSelectedDeptId(deptId);
    expandOnlyDept(deptId);
    setTimeout(() => {
      const el = document.getElementById(`accordion-dept-${deptId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col h-full rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden select-none ${
        isDragging ? 'cursor-row-resize' : ''
      }`}
    >
      {/* 1. TOP PANEL: Ocupación por Departamento (50% default height, adjustable) */}
      <div
        style={{ height: `${topPercent}%` }}
        className="flex flex-col min-h-0 overflow-hidden"
      >
        {/* Header & Sort Controls */}
        <div className="p-2.5 border-b border-slate-200 bg-slate-50 space-y-1.5 shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
              Ocupación por Departamento
            </h2>
            <span className="text-[10px] font-mono font-bold text-slate-500">
              {Math.round(topPercent)}%
            </span>
          </div>

          {/* Dropdown sort selector */}
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="text-[11px] font-medium">Ordenar por:</span>
            <select
              value={sortBarBy}
              onChange={(e) => setSortBarBy(e.target.value as SortBarBy)}
              className="rounded-md border border-slate-300 bg-white px-2 py-0.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
            >
              <option value="mayor_ocupacion">Mayor ocupación</option>
              <option value="mas_disponibles">Más disponibles</option>
              <option value="alfabetico">Nombre alfabético</option>
            </select>
          </div>
        </div>

        {/* Horizontal Progress Bars List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 divide-y divide-slate-100 min-h-0">
          {sortedDepartments.map((dept) => {
            const isSelected = selectedDeptId === dept.id;

            return (
              <div
                key={dept.id}
                onClick={() => handleSelectDept(dept.id)}
                className={`pt-1.5 rounded-lg p-2 cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-red-50/50 border-red-400'
                    : 'border-transparent hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800 truncate pr-2">
                    {dept.nombre}
                  </span>
                  <span className="font-mono text-[11px] tabular-nums shrink-0">
                    <span className={dept.isAgotado ? 'text-red-600 font-bold' : 'text-slate-800 font-bold'}>
                      {dept.ocupados}
                    </span>
                    <span className="text-slate-500">/{dept.ofertados}</span>
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden flex border border-slate-200">
                  {dept.isAgotado ? (
                    <div className="h-full bg-red-500 w-full" />
                  ) : (
                    <>
                      <div
                        className="h-full bg-red-400 transition-all duration-300"
                        style={{ width: `${dept.pctOcupado}%` }}
                      />
                      <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${100 - dept.pctOcupado}%` }}
                      />
                    </>
                  )}
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                  <span className={dept.disponibles > 0 ? 'text-emerald-700 font-medium' : 'text-red-600 font-medium'}>
                    {dept.disponibles} disponibles
                  </span>
                  <span>
                    {dept.isAgotado ? 'Agotado (0 cupos)' : `${dept.pctOcupado.toFixed(0)}% ocupado`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. INTERACTIVE RESIZER / DIVIDER (Drag handle to graduar el tamaño) */}
      <div
        onMouseDown={handleMouseDown}
        className="group relative flex h-3.5 w-full cursor-row-resize items-center justify-between bg-slate-100 hover:bg-slate-200 border-y border-slate-300/80 px-2 transition-colors shrink-0"
        title="Arrastra para graduar la altura de ambos paneles (Actual: 50% / 50%)"
      >
        <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500">
          <GripHorizontal className="h-3 w-3 text-slate-400 group-hover:text-slate-600" />
          <span className="hidden sm:inline">Graduar tamaño</span>
        </div>

        <div className="flex items-center gap-1 text-[9px] font-mono text-slate-600">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setTopPercent(50);
            }}
            className="rounded bg-white px-1.5 py-0.2 text-[8px] font-extrabold text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Restablecer división a 50% / 50%"
          >
            50 / 50
          </button>
          <span className="font-bold text-slate-700">
            {Math.round(topPercent)}% / {Math.round(100 - topPercent)}%
          </span>
        </div>
      </div>

      {/* 3. BOTTOM PANEL: Postulaciones en Vivo (50% default height, adjustable) */}
      <div
        style={{ height: `${100 - topPercent}%` }}
        className="bg-slate-50 p-2.5 space-y-2 flex flex-col min-h-0 overflow-hidden"
      >
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1">
              <span>Postulaciones en Vivo</span>
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800 border border-emerald-300">
              Cloud Sync
            </span>
            <span className="font-mono text-[10px] text-slate-600 font-semibold">
              {escogencias.length}
            </span>
          </div>
        </div>

        {/* Live typing alert if someone in another tab or device is currently typing */}
        {liveTypingUsers.length > 0 && !isHearingFinished && (
          <div className="space-y-1 shrink-0">
            {liveTypingUsers.map((u) => (
              <div
                key={u.id}
                className="rounded-lg bg-amber-50 p-2 border border-amber-300 text-xs flex items-center gap-2 animate-pulse shadow-2xs"
              >
                <Pencil className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-amber-900 truncate text-[11px]">
                    ✍️ {u.aspirante} está seleccionando en este momento...
                  </div>
                  <div className="text-[10px] text-amber-700 truncate">
                    Destino: {u.departamentoNombre} · {u.seccionalNombre}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chronological live postulations list */}
        <div className="overflow-y-auto space-y-1.5 pr-1 flex-1 min-h-0">
          {escogencias.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500 space-y-1">
              <p className="font-medium">Esperando primera postulación en la audiencia...</p>
              <p className="text-[10px] text-slate-400">
                Apenas alguien registre su escogencia en cualquier equipo, aparecerá aquí en tiempo real.
              </p>
            </div>
          ) : (
            escogencias.map((esc, index) => (
              <div
                key={esc.id}
                className={`rounded-lg p-2 border text-xs flex items-start justify-between gap-2 shadow-2xs transition-all ${
                  esc.isNew
                    ? 'bg-emerald-50/80 border-emerald-400 ring-1 ring-emerald-400'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] font-bold text-slate-400">
                      #{escogencias.length - index}
                    </span>
                    <span className="font-bold text-slate-900 truncate">
                      {esc.aspirante}
                    </span>
                    {esc.isNew && (
                      <span className="rounded bg-emerald-500 px-1 py-0.2 text-[9px] font-extrabold text-white animate-pulse">
                        NUEVO
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-emerald-800 font-semibold truncate">
                    {esc.departamentoNombre} — {esc.seccionalNombre}
                  </div>
                  {esc.observaciones && (
                    <div className="text-[10px] text-slate-500 truncate">
                      «{esc.observaciones}»
                    </div>
                  )}
                  <div className="text-[9px] font-mono text-slate-400 flex items-center gap-1">
                    <Calendar className="h-2.5 w-2.5" />
                    <span>{esc.fecha} (Hora Bogotá)</span>
                  </div>
                </div>

                {isHearingFinished ? (
                  <span
                    title="Audiencia finalizada a las 17:00: Asignación congelada para comprobación"
                    className="p-1 text-slate-300 shrink-0"
                  >
                    <Lock className="h-3.5 w-3.5 text-slate-400" />
                  </span>
                ) : isAdminAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => liberarEscogencia(esc.id)}
                    title="Liberar vacante (Mesa Técnica - Administrar opciones)"
                    className="rounded p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <span
                    title="Sólo se libera para quien administra opciones (Mesa Técnica)"
                    className="p-1 text-slate-300 shrink-0"
                  >
                    <Lock className="h-3 w-3" />
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
