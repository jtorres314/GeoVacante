import React from 'react';
import { useVacantes } from '../context/VacantesContext';
import { Download, FileText, Code2, X } from 'lucide-react';
import { getBogotaDateString, getBogotaDateTimeString } from '../utils/dateBogota';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { departments, escogencias, kpis } = useVacantes();

  if (!isOpen) return null;

  // Export CSV containing both sections (Consolidado & Escogencias)
  const handleDownloadCSV = () => {
    let csv = '"=== 1. CONSOLIDADO DE VACANTES POR DEPARTAMENTO Y SECCIONAL ==="\n';
    csv += 'Departamento,ID_Depto,Seccional_Despacho,Cupos_Ofertados,Cupos_Disponibles,Cupos_Ocupados,Estado,Automatico\n';
    departments.forEach((d) => {
      d.seccionales.forEach((s) => {
        csv += `"${d.nombre}","${d.id}","${s.nombre}",${s.cuposOfertados},${s.cuposDisponibles},${s.cuposOcupados},"${s.disponible ? 'DISPONIBLE' : 'NO DISPONIBLE'}",${s.automatico ? 'SI' : 'NO'}\n`;
      });
    });

    csv += '\n\n"=== 2. ESCOGENCIAS POR POSTULADO ==="\n';
    csv += 'ID_Postulacion,Aspirante,Departamento,Seccional_Elegida,Fecha_Postulacion\n';
    if (escogencias.length === 0) {
      csv += '"Sin postulaciones registradas","","","",""\n';
    } else {
      escogencias.forEach((e) => {
        csv += `"${e.id}","${e.aspirante.replace(/"/g, '""')}","${e.departamentoNombre}","${e.seccionalNombre.replace(/"/g, '""')}","${e.fecha}"\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `concurso_fiscalia_resultados_completos_${getBogotaDateString(new Date())}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON containing both datasets
  const handleDownloadJSON = () => {
    const data = {
      sistema: 'Concurso Fiscalía - Asignación y Mapa de Vacantes',
      fechaExportacionBogota: getBogotaDateTimeString(new Date()),
      zonaHoraria: 'America/Bogota (UTC-5)',
      kpis,
      consolidadoDepartamentos: departments,
      escogenciasPorPostulado: escogencias,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `concurso_fiscalia_respaldo_completo_${getBogotaDateString(new Date())}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadHTML = () => {
    const departmentsHtml = departments.map(d => {
      const totalDisp = d.seccionales.reduce((acc, s) => acc + s.cuposDisponibles, 0);
      const totalOf = d.seccionales.reduce((acc, s) => acc + s.cuposOfertados, 0);
      const seccionalesList = d.seccionales.map(s => {
        const badgeClass = s.cuposDisponibles > 0 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold';
        return '<li class="flex justify-between items-center text-slate-300"><span class="truncate pr-2">' + s.nombre + '</span><span class="font-mono text-[11px] ' + badgeClass + ' shrink-0">' + s.cuposDisponibles + '/' + s.cuposOfertados + '</span></li>';
      }).join('');

      const deptBadgeClass = totalDisp > 0 ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-red-950 text-red-300 border border-red-500/30';
      const deptBadgeText = totalDisp > 0 ? 'DISPONIBLE' : 'NO DISPONIBLE';

      return '<div class="p-4 rounded-xl border border-slate-800 bg-slate-900 space-y-2">' +
        '<div class="flex justify-between items-center"><h3 class="font-bold text-white text-sm">' + d.nombre + '</h3>' +
        '<span class="text-[10px] font-bold px-2 py-0.5 rounded ' + deptBadgeClass + '">' + deptBadgeText + '</span></div>' +
        '<div class="text-xs font-mono text-slate-400">' + totalDisp + ' disponibles de ' + totalOf + ' ofertadas</div>' +
        '<ul class="text-xs space-y-1.5 pt-2 border-t border-slate-800/80">' + seccionalesList + '</ul></div>';
    }).join('');

    const escogenciasRows = escogencias.length === 0 
      ? '<tr><td colspan="5" class="p-6 text-center text-slate-500">No hay postulaciones registradas aún.</td></tr>'
      : escogencias.map(e => {
          return '<tr class="hover:bg-slate-800/50">' +
            '<td class="p-3 font-mono text-emerald-400">' + e.id + '</td>' +
            '<td class="p-3 font-bold text-white">' + e.aspirante + '</td>' +
            '<td class="p-3">' + e.departamentoNombre + '</td>' +
            '<td class="p-3 text-cyan-300">' + e.seccionalNombre + '</td>' +
            '<td class="p-3 font-mono text-slate-400">' + e.fecha + '</td></tr>';
        }).join('');

    const standaloneHtml = '<!doctype html>' +
'<html lang="es" class="h-full bg-slate-950 text-slate-100">' +
'<head>' +
'  <meta charset="UTF-8"/>' +
'  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>' +
'  <title>Concurso Fiscalía - Resultados Completos y Postulaciones</title>' +
'  <script src="https://cdn.tailwindcss.com"></script>' +
'  <link rel="preconnect" href="https://fonts.googleapis.com">' +
'  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">' +
'  <style>body { font-family: "Plus Jakarta Sans", sans-serif; } .font-mono { font-family: "JetBrains Mono", monospace; font-variant-numeric: tabular-nums; }</style>' +
'</head>' +
'<body class="h-full bg-slate-950 text-slate-100 p-4 md:p-8">' +
'  <div class="max-w-7xl mx-auto space-y-8">' +
'    <header class="p-6 rounded-2xl border border-slate-800 bg-slate-900 flex flex-wrap items-center justify-between gap-4">' +
'      <div>' +
'        <h1 class="text-xl font-bold text-white">CONCURSO FISCALÍA 2025 - RESULTADOS OFICIALES</h1>' +
'        <p class="text-xs text-emerald-400 mt-1">Consolidado de Vacantes y Detalle de Escogencias por Postulado</p>' +
'      </div>' +
'      <div class="flex flex-wrap items-center gap-3 text-xs font-mono">' +
'        <div class="bg-slate-800 px-3 py-2 rounded-xl border border-slate-700">Total Ofertadas: <strong class="text-white">' + kpis.totalOfertados + '</strong></div>' +
'        <div class="bg-red-950/70 px-3 py-2 rounded-xl border border-red-500/30 text-red-300">Ocupadas: <strong class="text-red-400">' + kpis.totalOcupados + '</strong></div>' +
'        <div class="bg-emerald-950/70 px-3 py-2 rounded-xl border border-emerald-500/30 text-emerald-300">Disponibles: <strong class="text-emerald-400">' + kpis.totalDisponibles + '</strong></div>' +
'        <div class="bg-slate-800 px-3 py-2 rounded-xl border border-slate-700 text-amber-400">Ocupación: <strong>' + kpis.porcentajeOcupacion.toFixed(1) + '%</strong></div>' +
'      </div>' +
'    </header>' +
'    <section class="space-y-4">' +
'      <div class="flex items-center gap-2 pb-2 border-b border-slate-800">' +
'        <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-xs">1</span>' +
'        <h2 class="text-base font-bold text-white">Consolidado de Vacantes por Departamento y Seccional</h2>' +
'      </div>' +
'      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">' + departmentsHtml + '</div>' +
'    </section>' +
'    <section class="space-y-4 pt-6">' +
'      <div class="flex items-center gap-2 pb-2 border-b border-slate-800">' +
'        <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 font-bold text-xs">2</span>' +
'        <h2 class="text-base font-bold text-white">Escogencia por cada Postulado (Listado en Vivo)</h2>' +
'      </div>' +
'      <div class="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">' +
'        <div class="overflow-x-auto">' +
'          <table class="w-full text-left border-collapse text-xs">' +
'            <thead>' +
'              <tr class="border-b border-slate-800 bg-slate-950 text-slate-400 font-mono text-[11px]">' +
'                <th class="p-3">ID Postulación</th>' +
'                <th class="p-3">Aspirante</th>' +
'                <th class="p-3">Departamento</th>' +
'                <th class="p-3">Seccional Elegida</th>' +
'                <th class="p-3">Fecha y Hora</th>' +
'              </tr>' +
'            </thead>' +
'            <tbody class="divide-y divide-slate-800 text-slate-300">' + escogenciasRows + '</tbody>' +
'          </table>' +
'        </div>' +
'      </div>' +
'    </section>' +
'  </div>' +
'</body>' +
'</html>';

    const blob = new Blob([standaloneHtml], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `concurso_fiscalia_resultados_completos_${new Date().toISOString().slice(0, 10)}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              Exportar Resultados Completos
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-300 leading-relaxed">
          Descarga los resultados oficiales del Concurso Fiscalía incluyendo ambos reportes solicitados: el <strong className="text-white">Consolidado de Vacantes</strong> por departamento/seccional y el <strong className="text-white">Detalle de Escogencia por cada Postulado</strong>.
        </p>

        <div className="mt-4 space-y-3">
          {/* CSV Card */}
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3.5 hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Reporte Dual en CSV</h4>
                <p className="text-[11px] text-slate-400">Consolidado y postulaciones en un formato estructurado.</p>
              </div>
            </div>
            <button
              onClick={handleDownloadCSV}
              className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
            >
              Descargar CSV
            </button>
          </div>

          {/* JSON Card */}
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3.5 hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                <Code2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Respaldo Integral en JSON</h4>
                <p className="text-[11px] text-slate-400">Incluye departamentos, seccionales y escogencias por postulado.</p>
              </div>
            </div>
            <button
              onClick={handleDownloadJSON}
              className="rounded-lg bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
            >
              Descargar JSON
            </button>
          </div>

          {/* Standalone HTML Bundle Card */}
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3.5 hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                <Download className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Informe HTML Visual Dual</h4>
                <p className="text-[11px] text-slate-400">Consolidado y listado de postulados en visor autónomo.</p>
              </div>
            </div>
            <button
              onClick={handleDownloadHTML}
              className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
            >
              Descargar HTML
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
