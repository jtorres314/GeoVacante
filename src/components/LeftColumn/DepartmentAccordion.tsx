import React, { useMemo } from 'react';
import { useVacantes } from '../../context/VacantesContext';
import { FilterStatus } from '../../types';
import {
  Search,
  ChevronDown,
  ChevronRight,
  Minus,
  Plus,
  X,
  Users,
} from 'lucide-react';

export const DepartmentAccordion: React.FC = () => {
  const {
    departments,
    selectedDeptId,
    setSelectedDeptId,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    expandedDeptIds,
    toggleExpandDept,
    updateSeccionalCupo,
    toggleSeccionalDisponibilidad,
    toggleSeccionalAutomatico,
    viewMode,
    isAdminAuthenticated,
    escogencias,
  } = useVacantes();

  const filteredDepartments = useMemo(() => {
    return departments.filter((d) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        term === '' ||
        d.nombre.toLowerCase().includes(term) ||
        d.seccionales.some((s) => s.nombre.toLowerCase().includes(term));

      if (!matchesSearch) return false;

      const totalDisp = d.seccionales.reduce((acc, s) => acc + s.cuposDisponibles, 0);
      if (filterStatus === 'disponibles') return totalDisp > 0;
      if (filterStatus === 'sin_cupo') return totalDisp === 0;
      return true;
    });
  }, [departments, searchTerm, filterStatus]);

  const counts = useMemo(() => {
    let conCupo = 0;
    let sinCupo = 0;
    departments.forEach((d) => {
      const totalDisp = d.seccionales.reduce((acc, s) => acc + s.cuposDisponibles, 0);
      if (totalDisp > 0) conCupo++;
      else sinCupo++;
    });
    return { todos: departments.length, conCupo, sinCupo };
  }, [departments]);

  return (
    <div className="flex flex-col flex-1 min-h-0 rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      {/* Header & Search */}
      <div className="p-2.5 border-b border-slate-200 bg-slate-50 space-y-1.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
            Vacantes por Departamento
          </h2>
          <span className="text-[11px] font-mono text-slate-500">
            {filteredDepartments.length} de {departments.length}
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar departamento o seccional..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-2 text-slate-400 hover:text-slate-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* State filter segmented pills */}
        <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-200/80 p-0.5 border border-slate-300/80">
          {(
            [
              { id: 'todos', label: `Todos (${counts.todos})` },
              { id: 'disponibles', label: `Disponibles (${counts.conCupo})` },
              { id: 'sin_cupo', label: `Sin cupo (${counts.sinCupo})` },
            ] as { id: FilterStatus; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`py-1 text-center text-[10px] font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion List Container */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-slate-100">
        {filteredDepartments.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No se encontraron departamentos con los filtros actuales.
          </div>
        ) : (
          filteredDepartments.map((dept) => {
            const isExpanded = !!expandedDeptIds[dept.id];
            const isSelected = selectedDeptId === dept.id;

            const totalOfertados = dept.seccionales.reduce((acc, s) => acc + s.cuposOfertados, 0);
            const totalDisponibles = dept.seccionales.reduce((acc, s) => acc + s.cuposDisponibles, 0);
            const isDisponible = totalDisponibles > 0;

            return (
              <div
                key={dept.id}
                id={`accordion-dept-${dept.id}`}
                className={`rounded-lg transition-all pt-1 ${
                  isSelected
                    ? 'border-2 border-red-500 bg-red-50/20'
                    : 'border border-transparent hover:bg-slate-50'
                }`}
              >
                {/* Department Header */}
                <div
                  onClick={() => {
                    toggleExpandDept(dept.id);
                    setSelectedDeptId(dept.id);
                  }}
                  className="flex items-center justify-between p-2 cursor-pointer select-none group"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpandDept(dept.id);
                      }}
                      className="text-slate-400 group-hover:text-slate-800"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {dept.nombre}
                    </span>
                    {dept.esEspecial && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300">
                        Especial
                      </span>
                    )}
                  </div>

                  {/* Status & numbers matching video exact display */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-bold ${
                        isDisponible ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {isDisponible ? 'DISPONIBLE' : 'NO DISPONIBLE'}
                    </span>

                    <span className="font-mono text-[10px] text-slate-500 tabular-nums">
                      {totalDisponibles} disp. / {totalOfertados} tot.
                    </span>
                  </div>
                </div>

                {/* Expanded Seccionales Content */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 border-t border-slate-100 space-y-2">
                    {dept.seccionales.map((sec) => (
                      <div
                        key={sec.id}
                        className="rounded-lg bg-slate-50 p-2.5 border border-slate-200/80 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="text-[11px] font-semibold text-slate-900 leading-tight">
                              {sec.nombre}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 font-mono">
                              <span>Ofertados: {sec.cuposOfertados}</span>
                              <span>|</span>
                              <span>Ocupados: {sec.cuposOcupados}</span>
                            </div>
                          </div>

                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                              sec.disponible && sec.cuposDisponibles > 0
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-red-50 text-red-600 border border-red-200'
                            }`}
                          >
                            {sec.disponible && sec.cuposDisponibles > 0 ? 'DISPONIBLE' : 'NO DISP.'}
                          </span>
                        </div>

                        {/* Controls per Seccional conditioned on ViewMode */}
                        {isAdminAuthenticated && viewMode === 'administrar' && (
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/80">
                            {/* Toggle Disponibilidad button */}
                            <button
                              type="button"
                              onClick={() => toggleSeccionalDisponibilidad(dept.id, sec.id)}
                              className={`text-[10px] font-bold px-2 py-1 rounded border transition-colors cursor-pointer ${
                                sec.disponible && sec.cuposDisponibles > 0
                                  ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
                                  : 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              }`}
                            >
                              {sec.disponible && sec.cuposDisponibles > 0
                                ? 'Marcar NO DISPONIBLE'
                                : 'Marcar DISPONIBLE'}
                            </button>

                            {/* Stepper & Auto checkbox */}
                            <div className="flex items-center gap-2">
                              {/* Stepper [-] [cupo] [+] */}
                              <div className="flex items-center rounded-md border border-slate-300 bg-white shadow-2xs">
                                <button
                                  type="button"
                                  onClick={() => updateSeccionalCupo(dept.id, sec.id, sec.cuposDisponibles - 1)}
                                  disabled={sec.cuposDisponibles <= 0}
                                  className="px-2 py-0.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent rounded-l transition-colors"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-7 text-center font-mono text-xs font-bold text-slate-900 select-none">
                                  {sec.cuposDisponibles}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateSeccionalCupo(dept.id, sec.id, sec.cuposDisponibles + 1)}
                                  disabled={sec.cuposDisponibles >= sec.cuposOfertados}
                                  className="px-2 py-0.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent rounded-r transition-colors"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>

                              {/* Automatic toggle */}
                              <label className="flex items-center gap-1 text-[10px] font-medium text-slate-600 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={sec.automatico}
                                  onChange={() => toggleSeccionalAutomatico(dept.id, sec.id)}
                                  className="h-3 w-3 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
                                />
                                <span>Auto</span>
                              </label>
                            </div>
                          </div>
                        )}

                        {viewMode === 'proponente' && (
                          <div className="flex items-center justify-between pt-1 border-t border-slate-200/80 text-[10px]">
                            <span className="text-slate-500">
                              {sec.cuposDisponibles > 0
                                ? `${sec.cuposDisponibles} vacantes disponibles para escoger`
                                : 'Cupos agotados en esta seccional'}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDeptId(dept.id);
                                const formEl = document.getElementById('depto-select');
                                if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className="font-bold text-emerald-700 hover:text-emerald-900 underline"
                            >
                              Seleccionar en formulario
                            </button>
                          </div>
                        )}

                        {viewMode === 'solo_libera' && (
                          <div className="pt-1 border-t border-slate-200/80 text-[10px] text-amber-700 flex items-center justify-between">
                            <span>🎯 Sujeta a reasignación prioritaria (siguiente en lista)</span>
                            <span className="font-mono font-bold text-slate-700">
                              {sec.cuposOcupados > 0 ? `${sec.cuposOcupados} asignada(s)` : 'Sin asignaciones'}
                            </span>
                          </div>
                        )}

                        {/* Postulados in this Seccional */}
                        {(() => {
                          const secPostulados = escogencias.filter(
                            (e) => e.departamentoId === dept.id && e.seccionalId === sec.id
                          );
                          if (secPostulados.length === 0) return null;
                          return (
                            <div className="pt-1.5 border-t border-slate-200/70 space-y-1">
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                <Users className="h-2.5 w-2.5 text-blue-600" />
                                Postulados ({secPostulados.length}):
                              </span>
                              <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                                {secPostulados.map((p, idx) => (
                                  <div
                                    key={p.id}
                                    className="text-[10px] font-bold text-slate-800 bg-white rounded px-2 py-0.5 border border-slate-200/70 flex items-center justify-between gap-1 shadow-2xs"
                                  >
                                    <span className="truncate">{idx + 1}. {p.aspirante}</span>
                                    <span className="text-[8.5px] font-mono text-slate-400 shrink-0">
                                      {p.fecha.includes(',') ? p.fecha.split(',')[1].trim() : p.fecha}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
