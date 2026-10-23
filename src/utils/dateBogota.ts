/**
 * Utility for handling dates and times strictly in Colombia Time (America/Bogota, UTC-5).
 * Used throughout Concurso Fiscalía 2025 to ensure all postulation timestamps,
 * live clocks, and sync indicators reflect Official Bogotá Time.
 */

export const BOGOTA_TIMEZONE = 'America/Bogota';

/**
 * Returns formatted "YYYY-MM-DD HH:mm:ss" in America/Bogota timezone.
 */
export function getBogotaDateTimeString(date: Date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: BOGOTA_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).formatToParts(date);

    const getPart = (type: string) => parts.find((p) => p.type === type)?.value || '00';
    const yyyy = getPart('year');
    const mm = getPart('month');
    const dd = getPart('day');
    const hh = getPart('hour');
    const min = getPart('minute');
    const ss = getPart('second');

    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
  } catch {
    return date.toISOString().replace('T', ' ').slice(0, 19);
  }
}

/**
 * Returns "HH:mm:ss" strictly in America/Bogota timezone.
 */
export function getBogotaTimeString(date: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('es-CO', {
      timeZone: BOGOTA_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date);
  } catch {
    return date.toTimeString().split(' ')[0];
  }
}

/**
 * Returns "YYYY-MM-DD" strictly in America/Bogota timezone.
 */
export function getBogotaDateString(date: Date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: BOGOTA_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date);

    const getPart = (type: string) => parts.find((p) => p.type === type)?.value || '00';
    return `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

/**
 * Returns a full friendly string for Colombia, e.g. "22 de oct. de 2026, 14:30 (Hora Oficial Bogotá - UTC-5)"
 */
export function formatBogotaFriendly(date: Date = new Date()): string {
  try {
    const formatted = new Intl.DateTimeFormat('es-CO', {
      timeZone: BOGOTA_TIMEZONE,
      dateStyle: 'medium',
      timeStyle: 'medium',
      hour12: true,
    }).format(date);
    return `${formatted} (COT / UTC-5)`;
  } catch {
    return date.toLocaleString();
  }
}

/**
 * Official Hearing Timestamps:
 * Starts: October 23, 2026 at 08:00:00 (America/Bogota, UTC-5).
 * Finishes: October 23, 2026 at 17:00:00 (America/Bogota, UTC-5).
 * Total duration: 9 hours (09:00:00).
 */
export const OFFICIAL_HEARING_START_ISO = '2026-10-23T08:00:00-05:00';
export const OFFICIAL_HEARING_START_MS = 1792760400000; // Date.parse('2026-10-23T08:00:00-05:00')

export const OFFICIAL_HEARING_END_ISO = '2026-10-23T17:00:00-05:00';
export const OFFICIAL_HEARING_END_MS = 1792792800000; // Date.parse('2026-10-23T17:00:00-05:00')

export const OFFICIAL_HEARING_TOTAL_SECONDS = 9 * 3600; // 32400 seconds (09:00:00)

/**
 * Checks whether the official hearing has concluded (at or after 17:00:00 on October 23, 2026).
 */
export function isOfficialHearingFinished(now: Date = new Date()): boolean {
  return now.getTime() >= OFFICIAL_HEARING_END_MS;
}

/**
 * Checks whether the official hearing is currently in progress (between 08:00:00 and 17:00:00 on October 23, 2026).
 */
export function isOfficialHearingActive(now: Date = new Date()): boolean {
  const ms = now.getTime();
  return ms >= OFFICIAL_HEARING_START_MS && ms < OFFICIAL_HEARING_END_MS;
}

/**
 * Calculates official hearing chronometer:
 * - Starts automatically at 08:00:00 on October 23, 2026.
 * - Stops automatically at 17:00:00 on October 23, 2026 with final duration 09:00:00.
 * - Prior to 08:00:00 shows countdown to start.
 */
export function getHearingChronometerStats(now: Date = new Date()): {
  isStarted: boolean;
  isFinished: boolean;
  formattedTime: string; // "HH:MM:SS" or "Xd HH:MM:SS"
  totalSeconds: number;
  statusText: string;
  daysRemaining: number;
} {
  const pad = (n: number) => String(Math.max(0, n)).padStart(2, '0');

  try {
    const nowMs = now.getTime();

    if (nowMs >= OFFICIAL_HEARING_END_MS) {
      // Hearing has concluded automatically at 17:00:00 COT
      return {
        isStarted: true,
        isFinished: true,
        formattedTime: '09:00:00',
        totalSeconds: OFFICIAL_HEARING_TOTAL_SECONDS,
        statusText: 'Audiencia Finalizada (17:00:00 COT) · Modo Solo Lectura',
        daysRemaining: 0,
      };
    }

    if (nowMs >= OFFICIAL_HEARING_START_MS) {
      // The hearing is officially in progress (08:00:00 to 17:00:00 COT)
      const elapsed = Math.floor((nowMs - OFFICIAL_HEARING_START_MS) / 1000);
      const eh = Math.floor(elapsed / 3600);
      const em = Math.floor((elapsed % 3600) / 60);
      const es = elapsed % 60;

      return {
        isStarted: true,
        isFinished: false,
        formattedTime: `${pad(eh)}:${pad(em)}:${pad(es)}`,
        totalSeconds: elapsed,
        statusText: 'Audiencia Oficial en Curso (Cierre: 17:00 COT)',
        daysRemaining: 0,
      };
    } else {
      // Prior to Oct 23, 2026 at 08:00:00 COT
      const remaining = Math.max(0, Math.floor((OFFICIAL_HEARING_START_MS - nowMs) / 1000));
      const days = Math.floor(remaining / 86400);
      const rh = Math.floor((remaining % 86400) / 3600);
      const rm = Math.floor((remaining % 3600) / 60);
      const rs = remaining % 60;

      const formatted = days > 0
        ? `${days}d ${pad(rh)}:${pad(rm)}:${pad(rs)}`
        : `${pad(rh)}:${pad(rm)}:${pad(rs)}`;

      return {
        isStarted: false,
        isFinished: false,
        formattedTime: formatted,
        totalSeconds: remaining,
        statusText: 'Inicio automático: 23 Oct 2026, 08:00:00 COT',
        daysRemaining: days,
      };
    }
  } catch {
    return {
      isStarted: false,
      isFinished: false,
      formattedTime: '00:00:00',
      totalSeconds: 0,
      statusText: 'Inicio automático: 23 Oct 2026, 08:00:00 COT',
      daysRemaining: 0,
    };
  }
}


