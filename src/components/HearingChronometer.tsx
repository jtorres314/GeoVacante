import React, { useState, useEffect } from 'react';
import { Clock, Timer, Lock } from 'lucide-react';
import { getBogotaTimeString, getBogotaDateString, getHearingChronometerStats } from '../utils/dateBogota';

interface HearingChronometerProps {
  isHearingDay: boolean;
  className?: string;
}

export const HearingChronometer: React.FC<HearingChronometerProps> = ({ className = '' }) => {
  const [bogotaTime, setBogotaTime] = useState<string>(() => getBogotaTimeString(new Date()));
  const [bogotaDate, setBogotaDate] = useState<string>(() => getBogotaDateString(new Date()));
  
  // Official automatic 08:00:00 to 17:00:00 chronometer
  const [officialStats, setOfficialStats] = useState(() => getHearingChronometerStats(new Date()));

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setBogotaTime(getBogotaTimeString(now));
      setBogotaDate(getBogotaDateString(now));
      setOfficialStats(getHearingChronometerStats(now));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className={`flex flex-wrap items-center gap-2 sm:gap-3 rounded-lg bg-slate-900 px-3 py-1.5 text-white border border-slate-700 shadow-md ${className}`}
    >
      {/* 1. Reloj Oficial de la República de Colombia */}
      <div
        title="Hora Oficial de la República de Colombia (America/Bogota, UTC-5)"
        className="flex items-center gap-2 pr-2.5 sm:border-r border-slate-700"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-800 text-emerald-400 border border-slate-700 shrink-0">
          <Clock className="h-4 w-4 animate-pulse" />
        </div>
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5 font-mono text-xs font-black tracking-wider text-emerald-400">
            <span>{bogotaTime}</span>
            <span className="text-[9px] font-bold text-slate-400">COT</span>
          </div>
          <div className="flex items-center gap-1 text-[9px] font-medium text-slate-300">
            <span>Hora Bogotá</span>
            <span className="text-slate-500">•</span>
            <span className="font-mono text-slate-400">{bogotaDate}</span>
          </div>
        </div>
      </div>

      {/* 2. Cronómetro Oficial de la Audiencia (08:00 a 17:00 del 23 de Octubre de 2026) */}
      <div
        title={
          officialStats.isFinished
            ? 'Audiencia oficial finalizada automáticamente a las 17:00:00 COT. Sistema en modo solo lectura para comprobación.'
            : officialStats.isStarted
            ? 'Audiencia oficial en curso (08:00:00 a 17:00:00 COT).'
            : 'Inicio automático programado: 23 de octubre de 2026 a las 08:00:00 COT (Cierre automático: 17:00:00 COT).'
        }
        className="flex items-center gap-2"
      >
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-md border shrink-0 ${
            officialStats.isFinished
              ? 'bg-blue-950/80 text-blue-300 border-blue-800/80'
              : officialStats.isStarted
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80'
              : 'bg-amber-950/80 text-amber-300 border-amber-800/80'
          }`}
        >
          {officialStats.isFinished ? <Lock className="h-4 w-4 text-blue-400" /> : <Timer className="h-4 w-4" />}
        </div>

        <div className="flex flex-col text-left min-w-[130px]">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black tracking-widest text-white tabular-nums">
              {officialStats.formattedTime}
            </span>
            <span className="relative flex h-2 w-2">
              {officialStats.isFinished ? (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400" />
              ) : officialStats.isStarted ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </>
              ) : (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[9px] text-slate-300">
            <span
              className={`font-semibold ${
                officialStats.isFinished
                  ? 'text-blue-400 font-bold'
                  : officialStats.isStarted
                  ? 'text-emerald-400'
                  : 'text-amber-400'
              }`}
            >
              {officialStats.isFinished
                ? 'Audiencia Finalizada'
                : officialStats.isStarted
                ? 'Audiencia en Curso'
                : 'Inicio 23 Oct 08:00'}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">
              {officialStats.isFinished
                ? 'Solo Lectura'
                : officialStats.isStarted
                ? 'Cierre 17:00'
                : 'Hasta 17:00 COT'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
