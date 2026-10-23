import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useVacantes } from '../../context/VacantesContext';
import { SortBarBy, EscogenciaRegistro } from '../../types';
import {
  Trash2,
  Calendar,
  Pencil,
  GripHorizontal,
  Search,
  X,
  Check,
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
    actualizarEscogencia,
    expandOnlyDept,
    liveTypingUsers,
    isHearingFinished,
  } = useVacantes();

  // Resizable split percentage: defaults strictly to 50% / 50%
  const [topPercent, setTopPercent] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [liveSearchTerm, setLiveSearchTerm] = useState<string>('');

  // Auth modal state for delete or edit authorization code ("GeoVac2026")
  const [authModalAction, setAuthModalAction] = useState<{ type: 'delete' | 'edit'; item: EscogenciaRegistro } | null>(null);
  const [authCode, setAuthCode] = useState('');
  const [codeError, setCodeError] = useState('');

  // Edit form modal state after auth success
  const [editingRecord, setEditingRecord] = useState<EscogenciaRegistro | null>(null);
  const [editAspirante, setEditAspirante] = useState('');
  const [editDeptId, setEditDeptId] = useState('');
  const [editSeccionalId, setEditSeccionalId] = useState('');

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

  const filteredEscogencias = useMemo(() => {
    if (!liveSearchTerm.trim()) return escogencias;
    const term = liveSearchTerm.toLowerCase();
    return escogencias.filter(
      (e) =>
        e.aspirante.toLowerCase().includes(term) ||
        e.departamentoNombre.toLowerCase().includes(term) ||
        e.seccionalNombre.toLowerCase().includes(term) ||
        e.id.toLowerCase().includes(term)
    );
  }, [escogencias, liveSearchTerm]);

  const handleSelectDept = (deptId: string) => {
    setSelectedDeptId(deptId);
    expandOnlyDept(deptId);
    setTimeout(() => {
      const el = document.getElementById(`accordion-dept-${deptId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  };

  const currentEditDept = departments.find((d) => d.id === editDeptId);

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

      {/* 2. INTERACTIVE RESIZER / DIVIDER */}
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

      {/* 3. BOTTOM PANEL: Postulaciones en Vivo */}
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
            <span className="font-mono text-[10px] text-slate-600 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">
              {liveSearchTerm.trim()
                ? `${filteredEscogencias.length} / ${escogencias.length}`
                : escogencias.length}
            </span>
          </div>
        </div>

        {/* Search Bar for Live Postulations */}
        <div className="relative shrink-0">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar aspirante, seccional o departamento..."
            value={liveSearchTerm}
            onChange={(e) => setLiveSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
          {liveSearchTerm && (
            <button
              onClick={() => setLiveSearchTerm('')}
              className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Total search results count banner */}
        {liveSearchTerm.trim() && (
          <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-medium text-blue-800 bg-blue-50/90 border border-blue-200 rounded-lg shrink-0 shadow-2xs">
            <span>
              Resultados encontrados: <strong className="font-bold text-blue-900">{filteredEscogencias.length}</strong> de {escogencias.length} {escogencias.length === 1 ? 'registro' : 'registros'}
            </span>
            <button
              type="button"
              onClick={() => setLiveSearchTerm('')}
              className="text-blue-600 hover:text-blue-800 font-semibold underline text-[10px] cursor-pointer"
            >
              Limpiar
            </button>
          </div>
        )}

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
          {filteredEscogencias.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500 space-y-1">
              <p className="font-medium">
                {escogencias.length === 0 ? 'Esperando primera postulación en la audiencia...' : 'No se encontraron postulaciones con ese criterio.'}
              </p>
              <p className="text-[10px] text-slate-400">
                {escogencias.length === 0 ? 'Apenas alguien registre su escogencia, aparecerá aquí en tiempo real.' : 'Intente con otro término de búsqueda.'}
              </p>
            </div>
          ) : (
            filteredEscogencias.map((esc) => (
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
                      #{escogencias.length - escogencias.findIndex((e) => e.id === esc.id)}
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
                  <div className="text-[9px] font-mono text-slate-400 flex items-center gap-1">
                    <Calendar className="h-2.5 w-2.5" />
                    <span>{esc.fecha} (Hora Bogotá)</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalAction({ type: 'edit', item: esc });
                      setAuthCode('');
                      setCodeError('');
                    }}
                    title="Editar postulación"
                    className="rounded p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalAction({ type: 'delete', item: esc });
                      setAuthCode('');
                      setCodeError('');
                    }}
                    title="Eliminar postulación"
                    className="rounded p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Verification Code Modal for Delete or Edit Authorization */}
      {authModalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-2xs">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              {authModalAction.type === 'delete' ? (
                <>
                  <Trash2 className="h-4 w-4 text-red-600" />
                  Eliminar Postulación
                </>
              ) : (
                <>
                  <Pencil className="h-4 w-4 text-blue-600" />
                  Autorizar Edición de Postulación
                </>
              )}
            </h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Para {authModalAction.type === 'delete' ? 'eliminar' : 'editar'} la escogencia de <strong>{authModalAction.item.aspirante}</strong> en <strong>{authModalAction.item.departamentoNombre}</strong>, ingrese el código de autorización:
            </p>
            <div className="mt-3">
              <input
                type="password"
                placeholder="Código de autorización"
                value={authCode}
                onChange={(e) => {
                  setAuthCode(e.target.value);
                  if (codeError) setCodeError('');
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
              />
              {codeError && (
                <p className="mt-1 text-[11px] font-semibold text-red-600">{codeError}</p>
              )}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAuthModalAction(null)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (authCode.trim() === 'GeoVac2026') {
                    const item = authModalAction.item;
                    const actionType = authModalAction.type;
                    setAuthModalAction(null);

                    if (actionType === 'delete') {
                      liberarEscogencia(item.id, true);
                    } else {
                      setEditingRecord(item);
                      setEditAspirante(item.aspirante);
                      setEditDeptId(item.departamentoId);
                      setEditSeccionalId(item.seccionalId);
                    }
                  } else {
                    setCodeError('Código de autorización incorrecto.');
                  }
                }}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs ${
                  authModalAction.type === 'delete' ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'
                }`}
              >
                {authModalAction.type === 'delete' ? 'Confirmar Eliminación' : 'Autorizar y Editar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Postulation Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-2xs">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Pencil className="h-4 w-4 text-blue-600" />
                Editar Postulación
              </h3>
              <button
                onClick={() => setEditingRecord(null)}
                className="rounded p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre del Aspirante</label>
                <input
                  type="text"
                  value={editAspirante}
                  onChange={(e) => setEditAspirante(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Departamento Destino</label>
                <select
                  value={editDeptId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setEditDeptId(newId);
                    const d = departments.find((x) => x.id === newId);
                    if (d && d.seccionales.length > 0) {
                      setEditSeccionalId(d.seccionales[0].id);
                    }
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Seccional / Despacho</label>
                <select
                  value={editSeccionalId}
                  onChange={(e) => setEditSeccionalId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                >
                  {currentEditDept?.seccionales.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre} ({s.cuposDisponibles} disp. de {s.cuposOfertados})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!editAspirante.trim()) return;
                  actualizarEscogencia(editingRecord.id, editAspirante.trim(), editDeptId, editSeccionalId);
                  setEditingRecord(null);
                }}
                className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-500 flex items-center gap-1.5"
              >
                <Check className="h-3.5 w-3.5" />
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
