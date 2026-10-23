import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { DepartmentData, EscogenciaRegistro, LiveTypingUser, ViewMode, FilterStatus, SortBarBy, ToastMessage } from '../types';
import { INITIAL_DEPARTMENTS } from '../data/initialData';
import { db, handleFirestoreError, OperationType, testFirestoreConnection } from '../lib/firebase';
import { playLivePostulationSound } from '../utils/audioChime';
import {
  getBogotaDateTimeString,
  getBogotaTimeString,
  getBogotaDateString,
  isOfficialHearingFinished,
} from '../utils/dateBogota';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  getDocs,
} from 'firebase/firestore';

const STORAGE_KEY_DEPTS = 'concurso_fiscalia_depts_fgn_official_v3';
const STORAGE_KEY_ESCOGENCIAS = 'concurso_fiscalia_escogencias_fgn_official_v3';

interface HistorySnapshot {
  departments: DepartmentData[];
  escogencias: EscogenciaRegistro[];
  description: string;
}

export type CloudSyncStatus = 'connected' | 'syncing' | 'offline';

// Stable client identifier for this tab/browser session
const CLIENT_SESSION_ID = 'client-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);

interface VacantesContextType {
  departments: DepartmentData[];
  selectedDeptId: string | null;
  setSelectedDeptId: (id: string | null) => void;
  hoveredDeptId: string | null;
  setHoveredDeptId: (id: string | null) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  filterStatus: FilterStatus;
  setFilterStatus: (filter: FilterStatus) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortBarBy: SortBarBy;
  setSortBarBy: (sort: SortBarBy) => void;
  escogencias: EscogenciaRegistro[];
  expandedDeptIds: Record<string, boolean>;
  toggleExpandDept: (deptId: string) => void;
  expandOnlyDept: (deptId: string) => void;
  updateSeccionalCupo: (deptId: string, seccionalId: string, newDisponibles: number) => void;
  toggleSeccionalDisponibilidad: (deptId: string, seccionalId: string) => void;
  toggleSeccionalAutomatico: (deptId: string, seccionalId: string) => void;
  registrarEscogencia: (aspirante: string, deptId: string, seccionalId: string, observaciones?: string) => boolean;
  liberarEscogencia: (id: string) => void;
  restablecerDatosFabrica: () => void;
  simularAsignacionAleatoria: () => void;
  isHearingDay: boolean;
  isHearingFinished: boolean;
  simulatedDate: string;
  setSimulatedDate: (date: string) => void;
  isAdminAuthenticated: boolean;
  setIsAdminAuthenticated: (auth: boolean) => void;
  limpiarBaseDatosParaAudienciaReal: () => Promise<void>;
  toasts: ToastMessage[];
  dismissToast: (id: string) => void;
  undoLastAction: () => void;
  canUndo: boolean;
  lastUndoText: string | null;
  cloudSyncStatus: CloudSyncStatus;
  lastCloudSyncTime: string | null;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  liveTypingUsers: LiveTypingUser[];
  broadcastTyping: (aspirante: string, deptoNombre: string, seccionalNombre: string) => void;
  clearTyping: () => void;
  kpis: {
    totalOfertados: number;
    totalOcupados: number;
    totalDisponibles: number;
    porcentajeOcupacion: number;
    deptosEspecialesOcupados: number;
    totalDeptosEspeciales: number;
    deptosSinCupoCount: number;
    deptosConCupoCount: number;
  };
}

const VacantesContext = createContext<VacantesContextType | undefined>(undefined);

export const VacantesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [departments, setDepartments] = useState<DepartmentData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DEPTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_DEPARTMENTS;
  });

  const [escogencias, setEscogencias] = useState<EscogenciaRegistro[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ESCOGENCIAS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  // By default, NO department is pinned on initial load.
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [hoveredDeptId, setHoveredDeptId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('proponente');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBarBy, setSortBarBy] = useState<SortBarBy>('mayor_ocupacion');
  const [cloudSyncStatus, setCloudSyncStatus] = useState<CloudSyncStatus>('syncing');
  const [lastCloudSyncTime, setLastCloudSyncTime] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [liveTypingUsers, setLiveTypingUsers] = useState<LiveTypingUser[]>([]);
  
  // Date control: Simulations allowed strictly up to Oct 22, 2026. On Oct 23, 2026 = Official Hearing Day
  // Timezone defaults strictly to America/Bogota (UTC-5)
  // POR DEFECTO, NO SE PUEDE SELECCIONAR 23 DE OCTUBRE: Se marca automáticamente cuando llega la fecha.
  const [currentBogotaDate, setCurrentBogotaDate] = useState<string>(() => getBogotaDateString(new Date()));
  const [isHearingFinished, setIsHearingFinished] = useState<boolean>(() => isOfficialHearingFinished(new Date()));
  const [adminDateOverride, setAdminDateOverride] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentBogotaDate(getBogotaDateString(now));
      setIsHearingFinished(isOfficialHearingFinished(now));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const simulatedDate = adminDateOverride ?? (currentBogotaDate >= '2026-10-23' ? currentBogotaDate : '2026-10-22');
  const isHearingDay = simulatedDate >= '2026-10-23';

  // Administration authentication: "sólo se libera para quien administra opciones"
  const [isAdminAuthenticated, setIsAdminAuthenticatedState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('fgn_admin_auth_v2') === 'true';
    } catch {
      return false;
    }
  });

  const setIsAdminAuthenticated = useCallback((auth: boolean) => {
    setIsAdminAuthenticatedState(auth);
    try {
      localStorage.setItem('fgn_admin_auth_v2', auth ? 'true' : 'false');
    } catch {}
    if (!auth) {
      setViewMode('proponente');
    }
  }, []);

  const isInitialLoadRef = useRef(true);
  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  const [expandedDeptIds, setExpandedDeptIds] = useState<Record<string, boolean>>({});

  const [undoStack, setUndoStack] = useState<HistorySnapshot[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DEPTS, JSON.stringify(departments));
    } catch (err) {
      console.warn('LocalStorage error:', err);
    }
  }, [departments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ESCOGENCIAS, JSON.stringify(escogencias));
    } catch (err) {
      console.warn('LocalStorage error:', err);
    }
  }, [escogencias]);

  const addToast = useCallback((texto: string, canUndo = true, tipo: 'info' | 'success' | 'warning' = 'info') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [
      ...prev.slice(-3),
      { id, texto, tipo, canUndo, timestamp: Date.now() },
    ]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushUndoSnapshot = useCallback((description: string) => {
    setUndoStack((prev) => [
      ...prev.slice(-20),
      {
        departments: JSON.parse(JSON.stringify(departments)),
        escogencias: JSON.parse(JSON.stringify(escogencias)),
        description,
      },
    ]);
  }, [departments, escogencias]);

  // Real-time Firestore Listeners with Live Postulation Alerting
  useEffect(() => {
    testFirestoreConnection();

    const deptsCol = collection(db, 'departments');
    const escogenciasCol = collection(db, 'escogencias');
    const audienceLiveCol = collection(db, 'audience_live');

    // 1. Departments Listener
    const unsubDepts = onSnapshot(
      deptsCol,
      async (snapshot) => {
        if (snapshot.empty) {
          try {
            const batch = writeBatch(db);
            INITIAL_DEPARTMENTS.forEach((dept) => {
              const deptRef = doc(db, 'departments', dept.id);
              batch.set(deptRef, dept);
            });
            await batch.commit();
            setCloudSyncStatus('connected');
            setLastCloudSyncTime(new Date().toLocaleTimeString());
          } catch (seedErr) {
            handleFirestoreError(seedErr, OperationType.WRITE, 'departments');
          }
        } else {
          const cloudDepts: DepartmentData[] = [];
          snapshot.forEach((docSnap) => {
            cloudDepts.push(docSnap.data() as DepartmentData);
          });
          const ordered = INITIAL_DEPARTMENTS.map((initial) => {
            const found = cloudDepts.find((cd) => cd.id === initial.id);
            return found || initial;
          });
          setDepartments(ordered);
          setCloudSyncStatus('connected');
          setLastCloudSyncTime(new Date().toLocaleTimeString());
        }
      },
      (error) => {
        setCloudSyncStatus('offline');
        handleFirestoreError(error, OperationType.LIST, 'departments');
      }
    );

    // 2. Real-Time Escogencias Listener with live alert trigger
    const unsubEscogencias = onSnapshot(
      escogenciasCol,
      (snapshot) => {
        const cloudEscogencias: EscogenciaRegistro[] = [];
        const newlyAddedItems: EscogenciaRegistro[] = [];

        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' && !isInitialLoadRef.current) {
            const data = change.doc.data() as EscogenciaRegistro;
            newlyAddedItems.push(data);
          }
        });

        snapshot.forEach((docSnap) => {
          const item = docSnap.data() as EscogenciaRegistro;
          // Mark as new if arrived in this live change
          const isFresh = newlyAddedItems.some((n) => n.id === item.id);
          cloudEscogencias.push({
            ...item,
            isNew: isFresh,
          });
        });

        // Trigger real-time alert and audio chime when someone submits
        if (newlyAddedItems.length > 0 && !isInitialLoadRef.current) {
          const latest = newlyAddedItems[0];

          if (soundEnabledRef.current) {
            playLivePostulationSound();
          }

          addToast(
            `📢 ¡Nueva postulación en vivo! ${latest.aspirante} eligió ${latest.departamentoNombre} — ${latest.seccionalNombre}`,
            false,
            'success'
          );

          // Focus newly chosen department on map
          setSelectedDeptId(latest.departamentoId);
        }

        cloudEscogencias.sort((a, b) => b.fecha.localeCompare(a.fecha));
        setEscogencias(cloudEscogencias);
        setCloudSyncStatus('connected');
        setLastCloudSyncTime(getBogotaTimeString(new Date()));

        isInitialLoadRef.current = false;
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'escogencias');
      }
    );

    // 3. Live Presence & Typing broadcast listener
    const unsubLive = onSnapshot(
      audienceLiveCol,
      (snapshot) => {
        const now = Date.now();
        const active: LiveTypingUser[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as LiveTypingUser;
          // Exclude own session, only keep drafts active in the last 15 seconds
          if (data.id !== CLIENT_SESSION_ID && data.aspirante && (now - (data.lastActive || 0) < 15000)) {
            active.push(data);
          }
        });
        setLiveTypingUsers(active);
      },
      (error) => {
        console.warn('Live typing listener note:', error);
      }
    );

    // Cleanup live session on unmount
    return () => {
      unsubDepts();
      unsubEscogencias();
      unsubLive();
      try {
        deleteDoc(doc(db, 'audience_live', CLIENT_SESSION_ID));
      } catch {
        // ignore
      }
    };
  }, [addToast]);

  // Broadcast typing / drafting state to Google Cloud Firestore with debounce
  const typingDebounceTimer = useRef<NodeJS.Timeout | null>(null);

  const broadcastTyping = useCallback((aspirante: string, deptoNombre: string, seccionalNombre: string) => {
    if (typingDebounceTimer.current) {
      clearTimeout(typingDebounceTimer.current);
    }

    typingDebounceTimer.current = setTimeout(async () => {
      try {
        if (!aspirante.trim()) {
          await deleteDoc(doc(db, 'audience_live', CLIENT_SESSION_ID));
          return;
        }

        const payload: LiveTypingUser = {
          id: CLIENT_SESSION_ID,
          aspirante: aspirante.trim(),
          departamentoNombre: deptoNombre,
          seccionalNombre: seccionalNombre,
          lastActive: Date.now(),
        };

        await setDoc(doc(db, 'audience_live', CLIENT_SESSION_ID), payload);
      } catch (e) {
        console.warn('broadcastTyping error:', e);
      }
    }, 350);
  }, []);

  const clearTyping = useCallback(async () => {
    if (typingDebounceTimer.current) {
      clearTimeout(typingDebounceTimer.current);
    }
    try {
      await deleteDoc(doc(db, 'audience_live', CLIENT_SESSION_ID));
    } catch {
      // ignore
    }
  }, []);

  const toggleExpandDept = useCallback((deptId: string) => {
    setExpandedDeptIds((prev) => ({
      ...prev,
      [deptId]: !prev[deptId],
    }));
  }, []);

  const expandOnlyDept = useCallback((deptId: string) => {
    setExpandedDeptIds({ [deptId]: true });
  }, []);

  // Update cupos for a seccional (syncs to Firestore)
  const updateSeccionalCupo = useCallback(
    async (deptId: string, seccionalId: string, newDisponibles: number) => {
      if (isHearingFinished) {
        addToast('La audiencia ha finalizado a las 17:00. No se permiten modificaciones.', false, 'warning');
        return;
      }

      const targetDept = departments.find((d) => d.id === deptId);
      const targetSec = targetDept?.seccionales.find((s) => s.id === seccionalId);
      if (!targetDept || !targetSec) return;

      const clampedDisp = Math.max(0, Math.min(targetSec.cuposOfertados, newDisponibles));
      if (clampedDisp === targetSec.cuposDisponibles) return;

      pushUndoSnapshot(`Cupo de ${targetSec.nombre} ajustado a ${clampedDisp}`);

      const updatedDept: DepartmentData = {
        ...targetDept,
        seccionales: targetDept.seccionales.map((s) => {
          if (s.id !== seccionalId) return s;
          const disp = clampedDisp;
          const ocu = s.cuposOfertados - disp;
          const isAvail = s.automatico ? disp > 0 : s.disponible;
          return {
            ...s,
            cuposDisponibles: disp,
            cuposOcupados: ocu,
            disponible: isAvail,
          };
        }),
      };

      setDepartments((prev) => prev.map((d) => (d.id === deptId ? updatedDept : d)));

      try {
        await setDoc(doc(db, 'departments', deptId), updatedDept);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `departments/${deptId}`);
      }

      const prevDeptDisp = targetDept.seccionales.reduce((acc, s) => acc + s.cuposDisponibles, 0);
      const isNowZero = prevDeptDisp - targetSec.cuposDisponibles + clampedDisp === 0;

      if (prevDeptDisp > 0 && isNowZero) {
        addToast(`${targetDept.nombre} marcado no disponible`, true, 'warning');
      } else if (prevDeptDisp === 0 && clampedDisp > 0) {
        addToast(`${targetDept.nombre} marcado disponible`, true, 'success');
      } else {
        addToast(`Cupos de "${targetSec.nombre}" modificados a ${clampedDisp}`, true, 'info');
      }
    },
    [departments, pushUndoSnapshot, addToast]
  );

  // Toggle explicit availability of a seccional (syncs to Firestore)
  const toggleSeccionalDisponibilidad = useCallback(
    async (deptId: string, seccionalId: string) => {
      if (isHearingFinished) {
        addToast('La audiencia ha finalizado a las 17:00. No se permiten modificaciones.', false, 'warning');
        return;
      }

      const targetDept = departments.find((d) => d.id === deptId);
      const targetSec = targetDept?.seccionales.find((s) => s.id === seccionalId);
      if (!targetDept || !targetSec) return;

      const newStatus = !targetSec.disponible;
      pushUndoSnapshot(`${targetSec.nombre} marcada como ${newStatus ? 'DISPONIBLE' : 'NO DISPONIBLE'}`);

      const updatedDept: DepartmentData = {
        ...targetDept,
        seccionales: targetDept.seccionales.map((s) => {
          if (s.id !== seccionalId) return s;
          let disp = s.cuposDisponibles;
          let ocu = s.cuposOcupados;
          if (newStatus && disp === 0 && s.cuposOfertados > 0) {
            disp = 1;
            ocu = s.cuposOfertados - disp;
          } else if (!newStatus) {
            disp = 0;
            ocu = s.cuposOfertados;
          }
          return {
            ...s,
            disponible: newStatus,
            cuposDisponibles: disp,
            cuposOcupados: ocu,
            automatico: false,
          };
        }),
      };

      setDepartments((prev) => prev.map((d) => (d.id === deptId ? updatedDept : d)));

      try {
        await setDoc(doc(db, 'departments', deptId), updatedDept);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `departments/${deptId}`);
      }

      addToast(
        `${targetDept.nombre} marcado ${newStatus ? 'disponible' : 'no disponible'}`,
        true,
        newStatus ? 'success' : 'warning'
      );
    },
    [departments, pushUndoSnapshot, addToast, isHearingFinished]
  );

  // Toggle automatic mode for seccional (syncs to Firestore)
  const toggleSeccionalAutomatico = useCallback(
    async (deptId: string, seccionalId: string) => {
      if (isHearingFinished) return;

      const targetDept = departments.find((d) => d.id === deptId);
      if (!targetDept) return;

      const updatedDept: DepartmentData = {
        ...targetDept,
        seccionales: targetDept.seccionales.map((s) => {
          if (s.id !== seccionalId) return s;
          const newAuto = !s.automatico;
          return {
            ...s,
            automatico: newAuto,
            disponible: newAuto ? s.cuposDisponibles > 0 : s.disponible,
          };
        }),
      };

      setDepartments((prev) => prev.map((d) => (d.id === deptId ? updatedDept : d)));

      try {
        await setDoc(doc(db, 'departments', deptId), updatedDept);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `departments/${deptId}`);
      }
    },
    [departments, isHearingFinished]
  );

  // Register an escogencia in Firestore
  const registrarEscogencia = useCallback(
    (aspirante: string, deptId: string, seccionalId: string, observaciones?: string): boolean => {
      if (isHearingFinished) {
        addToast(
          'La audiencia oficial ha finalizado a las 17:00 del 23 de octubre. Sistema en modo solo lectura para comprobación.',
          false,
          'warning'
        );
        return false;
      }

      const dept = departments.find((d) => d.id === deptId);
      const sec = dept?.seccionales.find((s) => s.id === seccionalId);

      if (!dept || !sec) {
        addToast('Selección inválida de departamento o seccional', false, 'warning');
        return false;
      }

      if (sec.cuposDisponibles <= 0) {
        addToast(`No hay cupos disponibles en ${sec.nombre}`, false, 'warning');
        return false;
      }

      const cleanAspirante = aspirante
        .replace(/\s*[—–-]\s*Asistente de Fiscal\s*I\s*$/i, '')
        .replace(/\s*\(Asistente de Fiscal\s*I\)\s*$/i, '')
        .trim();

      clearTyping();
      pushUndoSnapshot(`Escogencia de ${cleanAspirante} en ${dept.nombre} (${sec.nombre})`);

      // Timestamp strictly in America/Bogota (UTC-5)
      const fechaBogota = getBogotaDateTimeString(new Date());

      const nuevoRegistro: EscogenciaRegistro = {
        id: 'esc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
        aspirante: cleanAspirante,
        departamentoId: dept.id,
        departamentoNombre: dept.nombre,
        seccionalId: sec.id,
        seccionalNombre: sec.nombre,
        observaciones: observaciones?.trim() || undefined,
        fecha: fechaBogota,
        isNew: true,
      };

      const updatedDept: DepartmentData = {
        ...dept,
        seccionales: dept.seccionales.map((s) => {
          if (s.id !== seccionalId) return s;
          const newDisp = s.cuposDisponibles - 1;
          const newOcu = s.cuposOcupados + 1;
          return {
            ...s,
            cuposDisponibles: newDisp,
            cuposOcupados: newOcu,
            disponible: s.automatico ? newDisp > 0 : s.disponible,
          };
        }),
      };

      setDepartments((prev) => prev.map((d) => (d.id === deptId ? updatedDept : d)));
      setEscogencias((prev) => [nuevoRegistro, ...prev]);

      (async () => {
        try {
          await setDoc(doc(db, 'escogencias', nuevoRegistro.id), nuevoRegistro);
          await setDoc(doc(db, 'departments', deptId), updatedDept);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `escogencias/${nuevoRegistro.id}`);
        }
      })();

      addToast(`Escogencia registrada: ${aspirante} -> ${dept.nombre}`, true, 'success');
      return true;
    },
    [departments, pushUndoSnapshot, addToast, clearTyping]
  );

  // Liberate an escogencia (syncs to Firestore)
  const liberarEscogencia = useCallback(
    async (registroId: string) => {
      if (isHearingFinished) {
        addToast(
          'La audiencia oficial ha concluido a las 17:00. Las asignaciones están congeladas para comprobación.',
          false,
          'warning'
        );
        return;
      }

      if (!isAdminAuthenticated) {
        addToast(
          'Solo se libera para quien administra opciones (Mesa Técnica FGN). Acceso restringido.',
          false,
          'warning'
        );
        return;
      }

      const registro = escogencias.find((e) => e.id === registroId);
      if (!registro) return;

      pushUndoSnapshot(`Liberación de vacante de ${registro.aspirante}`);

      const targetDept = departments.find((d) => d.id === registro.departamentoId);
      let updatedDept: DepartmentData | null = null;

      if (targetDept) {
        updatedDept = {
          ...targetDept,
          seccionales: targetDept.seccionales.map((s) => {
            if (s.id !== registro.seccionalId) return s;
            const newDisp = Math.min(s.cuposOfertados, s.cuposDisponibles + 1);
            const newOcu = Math.max(0, s.cuposOcupados - 1);
            return {
              ...s,
              cuposDisponibles: newDisp,
              cuposOcupados: newOcu,
              disponible: s.automatico ? newDisp > 0 : s.disponible,
            };
          }),
        };
      }

      setEscogencias((prev) => prev.filter((e) => e.id !== registroId));
      if (updatedDept) {
        setDepartments((prev) => prev.map((d) => (d.id === updatedDept!.id ? updatedDept! : d)));
      }

      try {
        await deleteDoc(doc(db, 'escogencias', registroId));
        if (updatedDept) {
          await setDoc(doc(db, 'departments', updatedDept.id), updatedDept);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `escogencias/${registroId}`);
      }

      addToast(`Vacante de ${registro.aspirante} liberada exitosamente`, true, 'info');
    },
    [escogencias, departments, pushUndoSnapshot, addToast]
  );

  // Undo Last Action
  const undoLastAction = useCallback(async () => {
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));

    setDepartments(last.departments);
    setEscogencias(last.escogencias);

    try {
      const batch = writeBatch(db);
      last.departments.forEach((d) => {
        batch.set(doc(db, 'departments', d.id), d);
      });
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'departments');
    }

    addToast(`Deshecho: ${last.description}`, false, 'warning');
  }, [undoStack, addToast]);

  // Reset to factory defaults in Firestore
  const restablecerDatosFabrica = useCallback(async () => {
    if (isHearingDay || isHearingFinished) {
      addToast(
        '⛔ Acción bloqueada: En día de Audiencia Oficial (23 de octubre), el restablecimiento está inhabilitado para proteger las escogencias de los elegibles.',
        false,
        'warning'
      );
      return;
    }
    pushUndoSnapshot('Restablecimiento de datos de fábrica');
    setDepartments(INITIAL_DEPARTMENTS);
    setEscogencias([]);
    setSelectedDeptId(null);
    setExpandedDeptIds({});

    try {
      localStorage.removeItem(STORAGE_KEY_DEPTS);
      localStorage.removeItem(STORAGE_KEY_ESCOGENCIAS);

      const batch = writeBatch(db);
      INITIAL_DEPARTMENTS.forEach((dept) => {
        batch.set(doc(db, 'departments', dept.id), dept);
      });
      const currentEscogencias = await getDocs(collection(db, 'escogencias'));
      currentEscogencias.forEach((d) => {
        batch.delete(d.ref);
      });
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'departments');
    }

    addToast('Datos restablecidos a las 347 vacantes oficiales en Google Cloud', true, 'info');
  }, [pushUndoSnapshot, addToast]);

  // Set simulated date (e.g. '2026-10-22' for simulations vs '2026-10-23' for official hearing)
  const setSimulatedDate = useCallback((newDate: string) => {
    setAdminDateOverride(newDate);
    try {
      localStorage.setItem('fgn_audiencia_date_v1', newDate);
    } catch {}
    if (newDate >= '2026-10-23') {
      addToast('🔴 23 de Octubre de 2026: AUDIENCIA REAL OFICIAL activada. Simulaciones y restablecimientos bloqueados.', false, 'info');
    } else {
      addToast('🟢 22 de Octubre de 2026: FASE DE SIMULACIÓN PREVIA habilitada (Cargos: Asistente de Fiscal I).', false, 'info');
    }
  }, [addToast]);

  // Clean database completely for October 23 Official Hearing Day
  const limpiarBaseDatosParaAudienciaReal = useCallback(async () => {
    pushUndoSnapshot('Limpieza total para Audiencia Real del 23 de octubre');

    const pristineDepts = INITIAL_DEPARTMENTS.map((dept) => ({
      ...dept,
      seccionales: dept.seccionales.map((sec) => ({
        ...sec,
        cuposDisponibles: sec.cuposOfertados,
        cuposOcupados: 0,
        disponible: true,
        automatico: true,
      })),
    }));

    setDepartments(pristineDepts);
    setEscogencias([]);
    localStorage.setItem(STORAGE_KEY_DEPTS, JSON.stringify(pristineDepts));
    localStorage.removeItem(STORAGE_KEY_ESCOGENCIAS);

    try {
      const batch = writeBatch(db);
      // Clean all previous simulation escogencias in Firestore
      const currentEscogencias = await getDocs(collection(db, 'escogencias'));
      currentEscogencias.forEach((d) => {
        batch.delete(d.ref);
      });
      // Clean live audience presence drafts
      const liveDocs = await getDocs(collection(db, 'audience_live'));
      liveDocs.forEach((d) => {
        batch.delete(d.ref);
      });
      // Set all departments to 347 pristine official vacancies
      pristineDepts.forEach((dept) => {
        batch.set(doc(db, 'departments', dept.id), dept);
      });

      await batch.commit();
      addToast('🧹 Base de datos limpiada con éxito: 347 vacantes oficiales listas para la Audiencia Real del 23 de octubre de 2026', true, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'escogencias');
    }
  }, [pushUndoSnapshot, addToast]);

  // Simulate random assignment (strictly allowed until October 22, 2026, ONLY Asistente de Fiscal I)
  const simularAsignacionAleatoria = useCallback(() => {
    if (isHearingDay) {
      addToast(
        '⛔ Simulaciones prohibidas: Hoy 23 de octubre de 2026 es el día de la AUDIENCIA PÚBLICA REAL OFICIAL. Por protocolo de mérito, las simulaciones están bloqueadas.',
        false,
        'warning'
      );
      return;
    }

    const availablePool: { dept: DepartmentData; sec: typeof departments[0]['seccionales'][0] }[] = [];
    departments.forEach((d) => {
      d.seccionales.forEach((s) => {
        if (s.cuposDisponibles > 0 && s.disponible) {
          availablePool.push({ dept: d, sec: s });
        }
      });
    });

    if (availablePool.length === 0) {
      addToast('No hay vacantes disponibles para simular asignación', false, 'warning');
      return;
    }

    const randomPick = availablePool[Math.floor(Math.random() * availablePool.length)];
    
    const mockNames = [
      'Dr. Carlos Eduardo Méndez',
      'Dra. Claudia Patricia Gómez',
      'Dr. Juan Camilo Restrepo',
      'Dra. Laura Sofía Bermúdez',
      'Dr. Diego Alejandro Morales',
      'Dra. Valentina Osorio Martínez',
      'Dr. Andrés Felipe Vargas',
      'Dra. Andrea Carolina Mendoza',
      'Dr. Mateo Hernández Rojas',
      'Dra. Natalia María Cárdenas',
    ];
    const mockName = mockNames[Math.floor(Math.random() * mockNames.length)];

    registrarEscogencia(
      mockName,
      randomPick.dept.id,
      randomPick.sec.id
    );
  }, [isHearingDay, departments, registrarEscogencia, addToast]);

  // Compute live KPIs
  const kpis = useMemo(() => {
    let totalOfertados = 0;
    let totalOcupados = 0;
    let totalDisponibles = 0;
    let deptosEspecialesOcupados = 0;
    let totalDeptosEspeciales = 0;
    let deptosSinCupoCount = 0;
    let deptosConCupoCount = 0;

    departments.forEach((d) => {
      let deptDisp = 0;
      let deptOcu = 0;
      let deptOf = 0;

      d.seccionales.forEach((s) => {
        deptOf += s.cuposOfertados;
        deptDisp += s.cuposDisponibles;
        deptOcu += s.cuposOcupados;
      });

      totalOfertados += deptOf;
      totalOcupados += deptOcu;
      totalDisponibles += deptDisp;

      if (d.esEspecial) {
        totalDeptosEspeciales++;
        if (deptDisp === 0) {
          deptosEspecialesOcupados++;
        }
      }

      if (deptDisp === 0) {
        deptosSinCupoCount++;
      } else {
        deptosConCupoCount++;
      }
    });

    const porcentajeOcupacion = totalOfertados > 0 ? (totalOcupados / totalOfertados) * 100 : 0;

    return {
      totalOfertados,
      totalOcupados,
      totalDisponibles,
      porcentajeOcupacion,
      deptosEspecialesOcupados,
      totalDeptosEspeciales,
      deptosSinCupoCount,
      deptosConCupoCount,
    };
  }, [departments]);

  return (
    <VacantesContext.Provider
      value={{
        departments,
        selectedDeptId,
        setSelectedDeptId,
        hoveredDeptId,
        setHoveredDeptId,
        viewMode,
        setViewMode,
        filterStatus,
        setFilterStatus,
        searchTerm,
        setSearchTerm,
        sortBarBy,
        setSortBarBy,
        escogencias,
        expandedDeptIds,
        toggleExpandDept,
        expandOnlyDept,
        updateSeccionalCupo,
        toggleSeccionalDisponibilidad,
        toggleSeccionalAutomatico,
        registrarEscogencia,
        liberarEscogencia,
        restablecerDatosFabrica,
        simularAsignacionAleatoria,
        isHearingDay,
        isHearingFinished,
        simulatedDate,
        setSimulatedDate,
        isAdminAuthenticated,
        setIsAdminAuthenticated,
        limpiarBaseDatosParaAudienciaReal,
        toasts,
        dismissToast,
        undoLastAction,
        canUndo: undoStack.length > 0,
        lastUndoText: undoStack.length > 0 ? undoStack[undoStack.length - 1].description : null,
        cloudSyncStatus,
        lastCloudSyncTime,
        soundEnabled,
        setSoundEnabled,
        liveTypingUsers,
        broadcastTyping,
        clearTyping,
        kpis,
      }}
    >
      {children}
    </VacantesContext.Provider>
  );
};

export const useVacantes = () => {
  const context = useContext(VacantesContext);
  if (!context) {
    throw new Error('useVacantes must be used within a VacantesProvider');
  }
  return context;
};
