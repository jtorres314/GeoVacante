/**
 * Utilidad para el cálculo del Mapa de Calor (Choropleth Heatmap)
 * de vacantes del Concurso Fiscalía 2025.
 *
 * El degradado progresa de:
 * - Verde Esmeralda (100% de cupos disponibles / 0% ocupación)
 * - Verde Lima (Alta disponibilidad)
 * - Amarillo / Ámbar (Media disponibilidad)
 * - Naranja (Baja disponibilidad / Pocos cupos)
 * - Naranja Rojizo (Casi agotado)
 * - Rojo Carmesí Intenso (Sin cupos disponibles / 0 vacantes restantes)
 */

export interface HeatmapInfo {
  fillColor: string;
  strokeColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  statusLabel: string;
  porcentajeOcupacion: number;
  porcentajeDisponible: number;
}

export function getDepartmentHeatmap(
  ofertados: number,
  disponibles: number,
  ocupados: number
): HeatmapInfo {
  // Caso 1: Sin vacantes disponibles (Agotado o 0 cupos)
  if (ofertados === 0 || disponibles === 0) {
    return {
      fillColor: '#dc2626', // Rojo Carmesí
      strokeColor: '#b91c1c',
      badgeBg: 'bg-red-500/15',
      badgeBorder: 'border-red-500/40',
      badgeText: 'text-red-400',
      statusLabel: 'SIN VACANTES (0 Libres)',
      porcentajeOcupacion: 100,
      porcentajeDisponible: 0,
    };
  }

  const pctOcupacion = Math.min(100, Math.max(0, (ocupados / ofertados) * 100));
  const pctDisponible = Math.max(0, 100 - pctOcupacion);

  // Caso 2: 100% de vacantes disponibles (0% ocupado)
  if (pctOcupacion === 0) {
    return {
      fillColor: '#16a34a', // Verde Esmeralda
      strokeColor: '#15803d',
      badgeBg: 'bg-emerald-500/15',
      badgeBorder: 'border-emerald-500/40',
      badgeText: 'text-emerald-400',
      statusLabel: '100% DISPONIBLE',
      porcentajeOcupacion: 0,
      porcentajeDisponible: 100,
    };
  }

  // Interpolación RGB precisa para mapa de calor
  let r: number, g: number, b: number;
  let statusLabel: string;
  let badgeBg: string;
  let badgeBorder: string;
  let badgeText: string;

  if (pctOcupacion <= 25) {
    // Verde esmeralda (22, 163, 74) a Verde Lima (101, 163, 13)
    const t = pctOcupacion / 25;
    r = Math.round(22 + (101 - 22) * t);
    g = Math.round(163 + (163 - 163) * t);
    b = Math.round(74 + (13 - 74) * t);
    statusLabel = `ALTA DISPONIBILIDAD (${disponibles} libres)`;
    badgeBg = 'bg-lime-500/15';
    badgeBorder = 'border-lime-500/40';
    badgeText = 'text-lime-400';
  } else if (pctOcupacion <= 50) {
    // Verde Lima (101, 163, 13) a Amarillo Oro (234, 179, 8)
    const t = (pctOcupacion - 25) / 25;
    r = Math.round(101 + (234 - 101) * t);
    g = Math.round(163 + (179 - 163) * t);
    b = Math.round(13 + (8 - 13) * t);
    statusLabel = `MEDIA DISPONIBILIDAD (${disponibles} libres)`;
    badgeBg = 'bg-amber-500/15';
    badgeBorder = 'border-amber-500/40';
    badgeText = 'text-amber-400';
  } else if (pctOcupacion <= 75) {
    // Amarillo Oro (234, 179, 8) a Naranja (249, 115, 22)
    const t = (pctOcupacion - 50) / 25;
    r = Math.round(234 + (249 - 234) * t);
    g = Math.round(179 + (115 - 179) * t);
    b = Math.round(8 + (22 - 8) * t);
    statusLabel = `CUPOS LIMITADOS (${disponibles} libres)`;
    badgeBg = 'bg-orange-500/15';
    badgeBorder = 'border-orange-500/40';
    badgeText = 'text-orange-400';
  } else if (pctOcupacion < 100) {
    // Naranja (249, 115, 22) a Rojo Carmesí (220, 38, 38)
    const t = (pctOcupacion - 75) / 25;
    r = Math.round(249 + (220 - 249) * t);
    g = Math.round(115 + (38 - 115) * t);
    b = Math.round(22 + (38 - 22) * t);
    statusLabel = `CASI AGOTADO (${disponibles} ${disponibles === 1 ? 'cupo restante' : 'cupos restantes'})`;
    badgeBg = 'bg-red-500/15';
    badgeBorder = 'border-red-500/40';
    badgeText = 'text-red-400';
  } else {
    r = 220;
    g = 38;
    b = 38;
    statusLabel = 'SIN VACANTES (0 Libres)';
    badgeBg = 'bg-red-500/15';
    badgeBorder = 'border-red-500/40';
    badgeText = 'text-red-400';
  }

  const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

  return {
    fillColor: hex,
    strokeColor: hex,
    badgeBg,
    badgeBorder,
    badgeText,
    statusLabel,
    porcentajeOcupacion: Math.round(pctOcupacion),
    porcentajeDisponible: Math.round(pctDisponible),
  };
}
