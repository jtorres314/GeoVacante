import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useVacantes } from '../../context/VacantesContext';
import { COLOMBIA_GEO, COLOMBIA_VIEWBOX } from '../../data/colombiaGeo';
import { getDepartmentHeatmap, HeatmapInfo } from '../../utils/heatmap';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Tag,
  MapPin,
  Flame,
  ArrowRightLeft,
  CheckCircle2,
  X,
} from 'lucide-react';

type CornerMode = 'auto' | 'top-left' | 'top-right';

export const ColombiaMap: React.FC = () => {
  const {
    departments,
    selectedDeptId,
    setSelectedDeptId,
    hoveredDeptId,
    setHoveredDeptId,
    expandOnlyDept,
  } = useVacantes();

  const containerRef = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [cornerPreference, setCornerPreference] = useState<CornerMode>('auto');

  // Compute stats and heatmap for all departments
  const deptStatsMap = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        nombre: string;
        totalOfertados: number;
        totalDisponibles: number;
        totalOcupados: number;
        isDisponible: boolean;
        porcentajeOcupacion: number;
        esEspecial: boolean;
        seccionales: {
          id: string;
          nombre: string;
          cuposOfertados: number;
          cuposDisponibles: number;
          cuposOcupados: number;
        }[];
        heatmap: HeatmapInfo;
      }
    >();

    departments.forEach((d) => {
      const of = d.seccionales.reduce((acc, s) => acc + s.cuposOfertados, 0);
      const disp = d.seccionales.reduce((acc, s) => acc + s.cuposDisponibles, 0);
      const ocu = d.seccionales.reduce((acc, s) => acc + s.cuposOcupados, 0);
      const isDisp = disp > 0;
      const pct = of > 0 ? (ocu / of) * 100 : (disp === 0 ? 100 : 0);
      const heatmap = getDepartmentHeatmap(of, disp, ocu);

      map.set(d.id, {
        id: d.id,
        nombre: d.nombre,
        totalOfertados: of,
        totalDisponibles: disp,
        totalOcupados: ocu,
        isDisponible: isDisp,
        porcentajeOcupacion: pct,
        esEspecial: !!d.esEspecial,
        seccionales: d.seccionales,
        heatmap,
      });
    });

    return map;
  }, [departments]);

  // Active department: currently hovered, or selected if none hovered
  const hoveredDeptStats = hoveredDeptId ? deptStatsMap.get(hoveredDeptId) : null;
  const selectedDeptStats = selectedDeptId ? deptStatsMap.get(selectedDeptId) : null;
  const activeDeptId = hoveredDeptId || selectedDeptId;
  const activeDeptStats = activeDeptId ? deptStatsMap.get(activeDeptId) : null;
  const activeGeo = activeDeptId ? COLOMBIA_GEO.find((g) => g.id === activeDeptId) : null;

  // Determine corner location according to geography in Colombia (Left vs Right)
  // cx >= 295 = East/Right side -> HUD placed at Top-Left (Arriba Izquierda)
  // cx < 295  = West/Left side  -> HUD placed at Top-Right (Arriba Derecha)
  const computedCorner = useMemo((): 'top-left' | 'top-right' => {
    if (cornerPreference === 'top-left') return 'top-left';
    if (cornerPreference === 'top-right') return 'top-right';

    if (activeGeo) {
      return activeGeo.cx >= 295 ? 'top-left' : 'top-right';
    }
    // Default when no department is hovered
    return 'top-right';
  }, [cornerPreference, activeGeo]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'svg' || e.button === 1 || e.shiftKey) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleZoom = (delta: number) => {
    setScale((prev) => Math.min(3.2, Math.max(0.8, prev + delta)));
  };

  const handleResetZoom = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (selectedDeptId && scale > 1.2) {
      const geo = COLOMBIA_GEO.find((g) => g.id === selectedDeptId);
      if (geo) {
        const targetX = (306 - geo.cx) * (scale - 1) * 0.4;
        const targetY = (347 - geo.cy) * (scale - 1) * 0.4;
        setPan({ x: targetX, y: targetY });
      }
    }
  }, [selectedDeptId, scale]);

  const handleDeptClick = (geoId: string) => {
    if (selectedDeptId === geoId) {
      setSelectedDeptId(null);
    } else {
      setSelectedDeptId(geoId);
      expandOnlyDept(geoId);

      setTimeout(() => {
        const el = document.getElementById(`accordion-dept-${geoId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 50);
    }
  };

  // Summary counts for the heatmap legend
  const heatmapSummary = useMemo(() => {
    let countDisponibles = 0;
    let countAgotados = 0;
    deptStatsMap.forEach((s) => {
      if (s.totalDisponibles > 0) countDisponibles++;
      else countAgotados++;
    });
    return { countDisponibles, countAgotados };
  }, [deptStatsMap]);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="relative flex flex-col h-full w-full rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden select-none"
    >
      {/* Top Header info bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 border-b border-slate-200 bg-white z-10">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-500 animate-pulse shrink-0" />
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
            MAPA DE VACANTES
          </h2>
          <span className="hidden md:inline-block rounded-md bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-700 border border-orange-200">
            Verde (Disp.) ➔ Rojo (Agotado)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick corner position selector */}
          <div className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
            <span className="text-[10px] font-semibold text-slate-400">HUD:</span>
            <button
              onClick={() => setCornerPreference('auto')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                cornerPreference === 'auto'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Alternar automáticamente según ubicación geográfica"
            >
              Auto
            </button>
            <button
              onClick={() => setCornerPreference('top-left')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                cornerPreference === 'top-left'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Fijar en Arriba Izquierda"
            >
              Izq.
            </button>
            <button
              onClick={() => setCornerPreference('top-right')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                cornerPreference === 'top-right'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Fijar en Arriba Derecha"
            >
              Der.
            </button>
          </div>

          {selectedDeptStats ? (
            <div className="flex items-center gap-1.5 text-xs text-slate-700">
              <span className="font-bold text-slate-900 truncate max-w-[120px]">
                {selectedDeptStats.nombre}
              </span>
              <button
                onClick={() => setSelectedDeptId(null)}
                className="text-[10px] text-slate-500 hover:text-red-600 underline"
              >
                (limpiar)
              </button>
            </div>
          ) : (
            <span className="hidden xl:inline text-xs text-slate-400">
              Pasa el cursor o haz clic
            </span>
          )}
        </div>
      </div>

      {/* Map SVG Canvas */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden bg-slate-50/50">
        <svg
          viewBox={COLOMBIA_VIEWBOX}
          className="w-full h-full max-h-[82vh] cursor-grab active:cursor-grabbing transition-transform duration-100 ease-out"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: 'center center',
          }}
        >
          {/* San Andrés Inset Frame */}
          <g id="san-andres-inset-frame" className="pointer-events-none select-none">
            <rect
              x="36"
              y="20"
              width="44"
              height="45"
              rx="4"
              fill="#ffffff"
              fillOpacity="0.8"
              stroke="#94a3b8"
              strokeWidth="0.8"
              strokeDasharray="2 2"
            />
            <text
              x="58"
              y="28"
              textAnchor="middle"
              className="text-[5.5px] font-bold fill-slate-500 font-sans tracking-wider uppercase"
            >
              Archipiélago
            </text>
          </g>

          {/* Base Polygons with Heatmap Dynamic Colors */}
          <g id="colombia-departments">
            {COLOMBIA_GEO.map((geo) => {
              const stats = deptStatsMap.get(geo.id);
              const isSelected = selectedDeptId === geo.id;
              const isHovered = hoveredDeptId === geo.id;

              // Heatmap color progression from Emerald Green -> Lime -> Yellow -> Orange -> Crimson Red
              const fillColor = stats ? stats.heatmap.fillColor : '#16a34a';
              let strokeColor = '#ffffff';
              let strokeWidth = '1.2';

              if (isSelected) {
                strokeColor = '#ffffff';
                strokeWidth = '2.2';
              } else if (isHovered) {
                strokeColor = '#0f172a';
                strokeWidth = '2';
              }

              return (
                <path
                  key={geo.id}
                  id={`map-dept-${geo.id}`}
                  d={geo.path}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  className="map-dept-path transition-colors duration-200 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeptClick(geo.id);
                  }}
                  onMouseEnter={() => setHoveredDeptId(geo.id)}
                  onMouseLeave={() => setHoveredDeptId(null)}
                />
              );
            })}
          </g>

          {/* Selected Department Outline Overlay (Dashed stroke) */}
          {selectedDeptId && (
            <g id="colombia-selected-overlay" className="pointer-events-none">
              {COLOMBIA_GEO.filter((g) => g.id === selectedDeptId).map((geo) => (
                <React.Fragment key={`sel-overlay-${geo.id}`}>
                  {/* Thick white halo underlay */}
                  <path
                    d={geo.path}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  {/* Red dashed animated stroke */}
                  <path
                    d={geo.path}
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    className="map-selected-stroke"
                  />
                </React.Fragment>
              ))}
            </g>
          )}

          {/* Department Name Labels */}
          {showLabels && (
            <g id="colombia-labels" className="pointer-events-none select-none">
              {COLOMBIA_GEO.map((geo) => {
                const stats = deptStatsMap.get(geo.id);
                if (!stats) return null;
                const isSelected = selectedDeptId === geo.id;

                const displayName =
                  geo.name === 'Bogotá D.C.'
                    ? 'Bogotá'
                    : geo.name === 'Norte de Santander'
                    ? 'N. Santander'
                    : geo.name === 'Valle del Cauca'
                    ? 'Valle'
                    : geo.name === 'San Andrés y Providencia'
                    ? 'San Andrés'
                    : geo.name;

                return (
                  <g key={`lbl-${geo.id}`} transform={`translate(${geo.cx}, ${geo.cy})`}>
                    <text
                      textAnchor="middle"
                      dy="3"
                      className="text-[9.5px] font-extrabold fill-slate-900 font-sans"
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                    >
                      {displayName}
                    </text>
                    <text
                      textAnchor="middle"
                      dy="3"
                      className={`text-[9.5px] font-bold font-sans ${
                        isSelected ? 'fill-red-700 font-extrabold' : 'fill-slate-900'
                      }`}
                    >
                      {displayName}
                    </text>
                  </g>
                );
              })}
            </g>
          )}
        </svg>

        {/* DOCKED POP-UP HUD IN CORNER (ARRIBA IZQUIERDA O ARRIBA DERECHA SEGÚN UBICACIÓN EN EL MAPA) */}
        {activeDeptStats && (
          <div
            className={`pointer-events-auto absolute z-30 transition-all duration-200 max-w-[280px] w-full sm:w-[280px] rounded-xl border border-slate-700/80 bg-slate-900/95 p-3.5 shadow-2xl backdrop-blur-md text-white ${
              computedCorner === 'top-left' ? 'top-3 left-3' : 'top-3 right-3'
            }`}
          >
            {/* Header: Name, Location indicator & Corner Toggle */}
            <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-800">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span className="font-extrabold text-white text-sm truncate uppercase tracking-wide">
                    {activeDeptStats.nombre}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-slate-400 font-medium">
                    {activeGeo && activeGeo.cx >= 295 ? 'Zona Oriental' : 'Zona Occidental'}
                  </span>
                  <span className="text-[9px] text-slate-500">•</span>
                  <span className="text-[10px] text-slate-400">
                    {activeDeptStats.seccionales.length}{' '}
                    {activeDeptStats.seccionales.length === 1 ? 'seccional' : 'seccionales'}
                  </span>
                </div>
              </div>

              {/* Status Badge & Close button */}
              <div className="flex items-center gap-1.5 shrink-0">
                <div
                  className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${activeDeptStats.heatmap.badgeBg} ${activeDeptStats.heatmap.badgeBorder} ${activeDeptStats.heatmap.badgeText}`}
                >
                  {activeDeptStats.totalDisponibles === 0 ? 'AGOTADO' : activeDeptStats.heatmap.statusLabel.split('(')[0].trim()}
                </div>
                {selectedDeptId === activeDeptStats.id && (
                  <button
                    onClick={() => setSelectedDeptId(null)}
                    title="Desfijar pop-up del mapa"
                    className="flex h-5 w-5 items-center justify-center rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Visual Heatmap Thermometer Bar */}
            <div className="mt-2.5 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-medium">
                <span className="flex items-center gap-1 text-slate-400">
                  <Flame className="h-3 w-3 text-orange-400" />
                  Nivel de Calor / Ocupación:
                </span>
                <span className="font-mono font-bold text-amber-300">
                  {activeDeptStats.heatmap.porcentajeOcupacion}% Ocupado
                </span>
              </div>
              <div className="relative h-2 w-full rounded-full bg-slate-800 overflow-hidden border border-slate-700/60">
                <div
                  className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-emerald-500 via-amber-500 to-red-600"
                  style={{ width: `${Math.max(4, activeDeptStats.heatmap.porcentajeOcupacion)}%` }}
                />
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="mt-2.5 grid grid-cols-3 gap-1.5 rounded-lg bg-slate-800/80 p-2 text-center border border-slate-700/50">
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase">
                  Ofertados
                </span>
                <span className="font-mono text-xs font-extrabold text-white">
                  {activeDeptStats.totalOfertados}
                </span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-emerald-400 uppercase">
                  Disponibles
                </span>
                <span
                  className={`font-mono text-xs font-extrabold ${
                    activeDeptStats.totalDisponibles > 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {activeDeptStats.totalDisponibles}
                </span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-red-400 uppercase">
                  Ocupadas
                </span>
                <span className="font-mono text-xs font-extrabold text-red-400">
                  {activeDeptStats.totalOcupados}
                </span>
              </div>
            </div>

            {/* Breakdown of Seccionales */}
            <div className="mt-2 pt-2 border-t border-slate-800 space-y-1 max-h-28 overflow-y-auto pr-1">
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Desglose por Seccional:
              </span>
              {activeDeptStats.seccionales.map((sec) => (
                <div
                  key={sec.id}
                  className="flex items-center justify-between text-[10px] py-0.5 border-b border-slate-800/40 last:border-b-0"
                >
                  <span className="text-slate-300 truncate max-w-[170px]" title={sec.nombre}>
                    {sec.nombre}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0 font-mono">
                    <span
                      className={`font-bold ${
                        sec.cuposDisponibles > 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {sec.cuposDisponibles} disp.
                    </span>
                    <span className="text-slate-500">/ {sec.cuposOfertados}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer with Position Switcher and Click Prompt */}
            <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
              <button
                onClick={() => handleDeptClick(activeDeptStats.id)}
                className="flex items-center gap-1 font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <CheckCircle2 className="h-3 w-3" />
                <span>
                  {selectedDeptId === activeDeptStats.id ? 'Fijado en lista' : 'Clic para fijar'}
                </span>
              </button>

              <button
                onClick={() =>
                  setCornerPreference((prev) =>
                    prev === 'top-left' ? 'top-right' : 'top-left'
                  )
                }
                title="Mover pop-up a la otra esquina"
                className="flex items-center gap-1 text-[9px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <ArrowRightLeft className="h-2.5 w-2.5" />
                <span>
                  {computedCorner === 'top-left' ? 'Mover a Der.' : 'Mover a Izq.'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Floating Zoom Controls */}
        <div className="absolute right-3 bottom-3 flex flex-col gap-1.5 z-20">
          <button
            onClick={() => handleZoom(0.25)}
            title="Acercar mapa"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-2xs transition-colors"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleZoom(-0.25)}
            title="Alejar mapa"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-2xs transition-colors"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={handleResetZoom}
            title="Centrar y restablecer vista"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-2xs transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowLabels((prev) => !prev)}
            title={showLabels ? 'Ocultar nombres' : 'Mostrar nombres'}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors shadow-2xs ${
              showLabels
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-slate-300 bg-white text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Tag className="h-4 w-4" />
          </button>
        </div>

        {/* Heatmap Legend Overlay at Bottom Left */}
        <div className="absolute left-3 bottom-3 z-20 rounded-xl border border-slate-200/90 bg-white/95 p-2.5 shadow-md backdrop-blur-md text-[11px] w-64">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-200">
            <span className="flex items-center gap-1 font-extrabold text-[10px] text-slate-800 uppercase tracking-wide">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              Mapa de Calor (Disponibilidad)
            </span>
            <span className="text-[10px] font-bold text-slate-500">
              {heatmapSummary.countDisponibles} disp. / {heatmapSummary.countAgotados} sin cupo
            </span>
          </div>

          {/* Continuous Color Gradient Bar */}
          <div className="space-y-1">
            <div className="h-2.5 w-full rounded-md bg-gradient-to-r from-[#16a34a] via-[#84cc16] via-[#eab308] via-[#f97316] to-[#dc2626] shadow-inner border border-slate-300/50" />
            <div className="flex justify-between text-[9px] font-bold text-slate-600">
              <span className="text-emerald-700">100% Disp.</span>
              <span className="text-amber-600">50% Disp.</span>
              <span className="text-red-600">0 Vacantes (Agotado)</span>
            </div>
          </div>

          {/* Key Indicators */}
          <div className="mt-2 pt-1.5 border-t border-slate-100 grid grid-cols-2 gap-1 text-[10px]">
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="h-2.5 w-2.5 rounded-full bg-[#16a34a] border border-emerald-600 shrink-0" />
              <span className="truncate">Verde: Con cupos</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="h-2.5 w-2.5 rounded-full bg-[#dc2626] border border-red-600 shrink-0" />
              <span className="truncate">Rojo: Sin cupos (0)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
