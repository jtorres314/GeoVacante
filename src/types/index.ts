export interface Seccional {
  id: string;
  nombre: string;
  cuposOfertados: number;
  cuposDisponibles: number;
  cuposOcupados: number;
  disponible: boolean;
  automatico: boolean;
}

export interface DepartmentData {
  id: string; // matches geo id (e.g. 'san', 'tol', 'met')
  nombre: string;
  esEspecial?: boolean;
  seccionales: Seccional[];
}

export interface EscogenciaRegistro {
  id: string;
  aspirante: string;
  departamentoId: string;
  departamentoNombre: string;
  seccionalId: string;
  seccionalNombre: string;
  fecha: string;
  isNew?: boolean;
}

export interface LiveTypingUser {
  id: string;
  aspirante: string;
  departamentoNombre: string;
  seccionalNombre: string;
  lastActive: number;
}

export type ViewMode = 'proponente' | 'solo_libera' | 'administrar';

export type FilterStatus = 'todos' | 'disponibles' | 'sin_cupo';

export type SortBarBy = 'mayor_ocupacion' | 'mas_disponibles' | 'alfabetico';

export interface ToastMessage {
  id: string;
  texto: string;
  tipo?: 'info' | 'success' | 'warning';
  canUndo?: boolean;
  timestamp: number;
}
