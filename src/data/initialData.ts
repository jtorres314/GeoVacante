import { DepartmentData } from '../types';

export const OFFICIAL_CONVOCATORIA_INFO = {
  cargo: 'ASISTENTE DE FISCAL I',
  codigoOpece: 'I-204-M-01 (357)',
  acuerdo: 'Acuerdo No. 001 de 2025 (Art. 46)',
  resolucion: 'Resolución No. 09008 del 11 de diciembre de 2025',
  modalidad: 'Modalidad Ingreso - Concurso de Méritos FGN 2024',
  resolucionesElegibles: 'Resoluciones 30700-00198 del 28 de mayo de 2026 y 30700-00223 del 09 de julio de 2026',
  totalVacantes: 357
};

export const INITIAL_DEPARTMENTS: DepartmentData[] = [
  {
    "id": "dc",
    "nombre": "Bogotá D.C.",
    "esEspecial": false,
    "seccionales": [
      {
        "id": "dc-1",
        "nombre": "NIVEL CENTRAL - BOGOTA — DELEGADA PARA LA SEGURIDAD TERRITORIAL",
        "cuposOfertados": 3,
        "cuposDisponibles": 3,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      },
      {
        "id": "dc-2",
        "nombre": "NIVEL CENTRAL - BOGOTA — DIRECCION ESPECIALIZADA DE EXTINCION DEL DERECHO DE DOMINIO",
        "cuposOfertados": 3,
        "cuposDisponibles": 3,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      },
      {
        "id": "dc-3",
        "nombre": "NIVEL CENTRAL - BOGOTA — FISCALIA DELEGADA ANTE LA CORTE SUPREMA DE JUSTICIA",
        "cuposOfertados": 3,
        "cuposDisponibles": 3,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      },
      {
        "id": "dc-4",
        "nombre": "NIVEL CENTRAL - BOGOTA — UNIDAD ESPECIAL DE INVESTIGACION",
        "cuposOfertados": 2,
        "cuposDisponibles": 2,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      },
      {
        "id": "dc-5",
        "nombre": "NIVEL CENTRAL - BOGOTA — DIRECCION DE JUSTICIA TRANSICIONAL",
        "cuposOfertados": 1,
        "cuposDisponibles": 1,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      },
      {
        "id": "dc-6",
        "nombre": "NIVEL CENTRAL - BOGOTA — DIRECCION ESPECIALIZADA CONTRA LA CORRUPCION",
        "cuposOfertados": 3,
        "cuposDisponibles": 3,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      },
      {
        "id": "dc-7",
        "nombre": "NIVEL CENTRAL - BOGOTA — DIRECCION ESPECIALIZADA CONTRA LAS VIOLACIONES A LOS DERECHOS HUMANOS",
        "cuposOfertados": 2,
        "cuposDisponibles": 2,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      },
      {
        "id": "dc-8",
        "nombre": "DIRECCION SECCIONAL - BOGOTA",
        "cuposOfertados": 42,
        "cuposDisponibles": 42,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      }
    ]
  },
  {
    "id": "ant",
    "nombre": "Antioquia",
    "esEspecial": false,
    "seccionales": [
      {
        "id": "ant-9",
        "nombre": "NIVEL CENTRAL - MEDELLIN — DIRECCION ESPECIALIZADA CONTRA LA CORRUPCION",
        "cuposOfertados": 2,
        "cuposDisponibles": 2,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      },
      {
        "id": "ant-10",
        "nombre": "NIVEL CENTRAL - MEDELLIN — DIRECCION ESPECIALIZADA CONTRA LAS ORGANIZACIONES CRIMINALES",
        "cuposOfertados": 3,
        "cuposDisponibles": 3,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      },
      {
        "id": "ant-11",
        "nombre": "NIVEL CENTRAL - MEDELLIN — DIRECCION ESPECIALIZADA CONTRA LAS VIOLACIONES A LOS DERECHOS HUMANOS",
        "cuposOfertados": 4,
        "cuposDisponibles": 4,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      },
      {
        "id": "ant-12",
        "nombre": "DIRECCION SECCIONAL - MEDELLIN",
        "cuposOfertados": 18,
        "cuposDisponibles": 18,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      },
      {
        "id": "ant-13",
        "nombre": "DIRECCION SECCIONAL - ANTIOQUIA",
        "cuposOfertados": 16,
        "cuposDisponibles": 16,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      }
    ]
  },
  {
    "id": "vac",
    "nombre": "Valle del Cauca",
    "esEspecial": false,
    "seccionales": [
      {
        "id": "vac-14",
        "nombre": "NIVEL CENTRAL - CALI — DIRECCION ESPECIALIZADA DE EXTINCION DEL DERECHO DE DOMINIO",
        "cuposOfertados": 1,
        "cuposDisponibles": 1,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      },
      {
        "id": "vac-15",
        "nombre": "NIVEL CENTRAL - CALI — DIRECCION ESPECIALIZADA CONTRA LAS VIOLACIONES A LOS DERECHOS HUMANOS",
        "cuposOfertados": 1,
        "cuposDisponibles": 1,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      },
      {
        "id": "vac-16",
        "nombre": "DIRECCION SECCIONAL - CALI",
        "cuposOfertados": 25,
        "cuposDisponibles": 25,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      },
      {
        "id": "vac-17",
        "nombre": "DIRECCION SECCIONAL - VALLE DEL CAUCA",
        "cuposOfertados": 16,
        "cuposDisponibles": 16,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      }
    ]
  },
  {
    "id": "san",
    "nombre": "Santander",
    "esEspecial": false,
    "seccionales": [
      {
        "id": "san-18",
        "nombre": "NIVEL CENTRAL - SANTANDER — DIRECCION ESPECIALIZADA CONTRA EL LAVADO DE ACTIVOS",
        "cuposOfertados": 1,
        "cuposDisponibles": 1,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      },
      {
        "id": "san-19",
        "nombre": "NIVEL CENTRAL - SANTANDER — DIRECCION ESPECIALIZADA CONTRA EL NARCOTRAFICO",
        "cuposOfertados": 1,
        "cuposDisponibles": 1,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      },
      {
        "id": "san-20",
        "nombre": "NIVEL CENTRAL - SANTANDER — DIRECCION ESPECIALIZADA CONTRA LA CORRUPCION",
        "cuposOfertados": 1,
        "cuposDisponibles": 1,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      },
      {
        "id": "san-21",
        "nombre": "NIVEL CENTRAL - SANTANDER — DIRECCION ESPECIALIZADA CONTRA LAS VIOLACIONES A LOS DERECHOS HUMANOS",
        "cuposOfertados": 2,
        "cuposDisponibles": 2,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      },
      {
        "id": "san-22",
        "nombre": "DIRECCION SECCIONAL - SANTANDER",
        "cuposOfertados": 16,
        "cuposDisponibles": 16,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      }
    ]
  },
  {
    "id": "tol",
    "nombre": "Tolima",
    "esEspecial": false,
    "seccionales": [
      {
        "id": "tol-23",
        "nombre": "DIRECCION SECCIONAL - TOLIMA",
        "cuposOfertados": 8,
        "cuposDisponibles": 8,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      }
    ]
  },
  {
    "id": "met",
    "nombre": "Meta",
    "esEspecial": false,
    "seccionales": [
      {
        "id": "met-24",
        "nombre": "NIVEL CENTRAL - META — DIRECCION ESPECIALIZADA CONTRA LA CORRUPCION",
        "cuposOfertados": 1,
        "cuposDisponibles": 1,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      },
      {
        "id": "met-25",
        "nombre": "NIVEL CENTRAL - META — DIRECCION ESPECIALIZADA CONTRA LAS ORGANIZACIONES CRIMINALES",
        "cuposOfertados": 1,
        "cuposDisponibles": 1,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      },
      {
        "id": "met-26",
        "nombre": "NIVEL CENTRAL - META — DIRECCION ESPECIALIZADA CONTRA LAS VIOLACIONES A LOS DERECHOS HUMANOS",
        "cuposOfertados": 1,
        "cuposDisponibles": 1,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      },
      {
        "id": "met-27",
        "nombre": "DIRECCION SECCIONAL - META",
        "cuposOfertados": 7,
        "cuposDisponibles": 7,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      }
    ]
  },
  {
    "id": "cal",
    "nombre": "Caldas",
    "esEspecial": false,
    "seccionales": [
      {
        "id": "cal-28",
        "nombre": "DIRECCION SECCIONAL - CALDAS",
        "cuposOfertados": 12,
        "cuposDisponibles": 12,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      }
    ]
  },
  {
    "id": "cun",
    "nombre": "Cundinamarca",
    "esEspecial": false,
    "seccionales": [
      {
        "id": "cun-29",
        "nombre": "DIRECCION SECCIONAL - CUNDINAMARCA",
        "cuposOfertados": 11,
        "cuposDisponibles": 11,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      }
    ]
  },
  {
    "id": "cau",
    "nombre": "Cauca",
    "esEspecial": false,
    "seccionales": [
      {
        "id": "cau-30",
        "nombre": "NIVEL CENTRAL - CAUCA — DIRECCION ESPECIALIZADA CONTRA LA CORRUPCION",
        "cuposOfertados": 1,
        "cuposDisponibles": 1,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      },
      {
        "id": "cau-31",
        "nombre": "NIVEL CENTRAL - CAUCA — DIRECCION ESPECIALIZADA CONTRA LAS VIOLACIONES A LOS DERECHOS HUMANOS",
        "cuposOfertados": 1,
        "cuposDisponibles": 1,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      },
      {
        "id": "cau-32",
        "nombre": "DIRECCION SECCIONAL - CAUCA",
        "cuposOfertados": 10,
        "cuposDisponibles": 10,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      }
    ]
  },
  {
    "id": "hui",
    "nombre": "Huila",
    "esEspecial": false,
    "seccionales": [
      {
        "id": "hui-33",
        "nombre": "NIVEL CENTRAL - HUILA — DIRECCION ESPECIALIZADA CONTRA LAS ORGANIZACIONES CRIMINALES",
        "cuposOfertados": 2,
        "cuposDisponibles": 2,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      },
      {
        "id": "hui-34",
        "nombre": "NIVEL CENTRAL - HUILA — DIRECCION ESPECIALIZADA CONTRA LAS VIOLACIONES A LOS DERECHOS HUMANOS",
        "cuposOfertados": 1,
        "cuposDisponibles": 1,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      },
      {
        "id": "hui-35",
        "nombre": "DIRECCION SECCIONAL - HUILA",
        "cuposOfertados": 10,
        "cuposDisponibles": 10,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      }
    ]
  },
  {
    "id": "cho",
    "nombre": "Chocó",
    "esEspecial": true,
    "seccionales": [
      {
        "id": "cho-36",
        "nombre": "DIRECCION SECCIONAL - CHOCO",
        "cuposOfertados": 10,
        "cuposDisponibles": 10,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      }
    ]
  },
  {
    "id": "nsa",
    "nombre": "Norte de Santander",
    "esEspecial": false,
    "seccionales": [
      {
        "id": "nsa-37",
        "nombre": "NIVEL CENTRAL - NORTE DE SANTANDER — DIRECCION ESPECIALIZADA CONTRA LAS VIOLACIONES A LOS DERECHOS HUMANOS",
        "cuposOfertados": 2,
        "cuposDisponibles": 2,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      },
      {
        "id": "nsa-38",
        "nombre": "DIRECCION SECCIONAL - NORTE DE SANTANDER",
        "cuposOfertados": 8,
        "cuposDisponibles": 8,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      }
    ]
  },
  {
    "id": "atl",
    "nombre": "Atlántico",
    "esEspecial": false,
    "seccionales": [
      {
        "id": "atl-39",
        "nombre": "NIVEL CENTRAL - ATLANTICO — DIRECCION ESPECIALIZADA CONTRA EL NARCOTRAFICO",
        "cuposOfertados": 1,
        "cuposDisponibles": 1,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      },
      {
        "id": "atl-40",
        "nombre": "NIVEL CENTRAL - ATLANTICO — DIRECCION ESPECIALIZADA CONTRA LA CORRUPCION",
        "cuposOfertados": 1,
        "cuposDisponibles": 1,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      },
      {
        "id": "atl-41",
        "nombre": "NIVEL CENTRAL - ATLANTICO — DIRECCION ESPECIALIZADA CONTRA LAS VIOLACIONES A LOS DERECHOS HUMANOS",
        "cuposOfertados": 1,
        "cuposDisponibles": 1,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      },
      {
        "id": "atl-42",
        "nombre": "DIRECCION SECCIONAL - ATLANTICO",
        "cuposOfertados": 6,
        "cuposDisponibles": 6,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      }
    ]
  },
  {
    "id": "bol",
    "nombre": "Bolívar",
    "esEspecial": false,
    "seccionales": [
      {
        "id": "bol-43",
        "nombre": "NIVEL CENTRAL - BOLIVAR — DIRECCION DE JUSTICIA TRANSICIONAL",
        "cuposOfertados": 1,
        "cuposDisponibles": 1,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      },
      {
        "id": "bol-44",
        "nombre": "DIRECCION SECCIONAL - BOLIVAR",
        "cuposOfertados": 8,
        "cuposDisponibles": 8,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      }
    ]
  },
  {
    "id": "nar",
    "nombre": "Nariño",
    "esEspecial": false,
    "seccionales": [
      {
        "id": "nar-45",
        "nombre": "DIRECCION SECCIONAL - NARIÑO",
        "cuposOfertados": 9,
        "cuposDisponibles": 9,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      }
    ]
  },
  {
    "id": "ris",
    "nombre": "Risaralda",
    "esEspecial": false,
    "seccionales": [
      {
        "id": "ris-46",
        "nombre": "NIVEL CENTRAL - RISARALDA — DIRECCION ESPECIALIZADA CONTRA LAS ORGANIZACIONES CRIMINALES",
        "cuposOfertados": 2,
        "cuposDisponibles": 2,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      },
      {
        "id": "ris-47",
        "nombre": "DIRECCION SECCIONAL - RISARALDA",
        "cuposOfertados": 8,
        "cuposDisponibles": 8,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      }
    ]
  },
  {
    "id": "boy",
    "nombre": "Boyacá",
    "esEspecial": false,
    "seccionales": [
      {
        "id": "boy-48",
        "nombre": "DIRECCION SECCIONAL - BOYACA",
        "cuposOfertados": 7,
        "cuposDisponibles": 7,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      }
    ]
  },
  {
    "id": "qui",
    "nombre": "Quindío",
    "esEspecial": false,
    "seccionales": [
      {
        "id": "qui-49",
        "nombre": "DIRECCION SECCIONAL - QUINDIO",
        "cuposOfertados": 7,
        "cuposDisponibles": 7,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      }
    ]
  },
  {
    "id": "ces",
    "nombre": "Cesar",
    "esEspecial": false,
    "seccionales": [
      {
        "id": "ces-50",
        "nombre": "NIVEL CENTRAL - CESAR — DIRECCION ESPECIALIZADA CONTRA EL NARCOTRAFICO",
        "cuposOfertados": 1,
        "cuposDisponibles": 1,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      },
      {
        "id": "ces-51",
        "nombre": "NIVEL CENTRAL - CESAR — DIRECCION ESPECIALIZADA CONTRA LAS VIOLACIONES A LOS DERECHOS HUMANOS",
        "cuposOfertados": 1,
        "cuposDisponibles": 1,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      },
      {
        "id": "ces-52",
        "nombre": "DIRECCION SECCIONAL - CESAR",
        "cuposOfertados": 3,
        "cuposDisponibles": 3,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      }
    ]
  },
  {
    "id": "mag",
    "nombre": "Magdalena",
    "esEspecial": false,
    "seccionales": [
      {
        "id": "mag-53",
        "nombre": "DIRECCION SECCIONAL - MAGDALENA",
        "cuposOfertados": 5,
        "cuposDisponibles": 5,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      }
    ]
  },
  {
    "id": "lag",
    "nombre": "La Guajira",
    "esEspecial": false,
    "seccionales": [
      {
        "id": "lag-54",
        "nombre": "NIVEL CENTRAL - GUAJIRA — DIRECCION ESPECIALIZADA CONTRA LAS ORGANIZACIONES CRIMINALES",
        "cuposOfertados": 2,
        "cuposDisponibles": 2,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      },
      {
        "id": "lag-55",
        "nombre": "DIRECCION SECCIONAL - LA GUAJIRA",
        "cuposOfertados": 3,
        "cuposDisponibles": 3,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      }
    ]
  },
  {
    "id": "ara",
    "nombre": "Arauca",
    "esEspecial": true,
    "seccionales": [
      {
        "id": "ara-56",
        "nombre": "DIRECCION SECCIONAL - ARAUCA",
        "cuposOfertados": 5,
        "cuposDisponibles": 5,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      }
    ]
  },
  {
    "id": "put",
    "nombre": "Putumayo",
    "esEspecial": true,
    "seccionales": [
      {
        "id": "put-57",
        "nombre": "NIVEL CENTRAL - PUTUMAYO — DIRECCION ESPECIALIZADA CONTRA LAS ORGANIZACIONES CRIMINALES",
        "cuposOfertados": 1,
        "cuposDisponibles": 1,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      },
      {
        "id": "put-58",
        "nombre": "DIRECCION SECCIONAL - PUTUMAYO",
        "cuposOfertados": 4,
        "cuposDisponibles": 4,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      }
    ]
  },
  {
    "id": "cor",
    "nombre": "Córdoba",
    "esEspecial": false,
    "seccionales": [
      {
        "id": "cor-59",
        "nombre": "NIVEL CENTRAL - CORDOBA — DIRECCION ESPECIALIZADA CONTRA LA CORRUPCION",
        "cuposOfertados": 2,
        "cuposDisponibles": 2,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      },
      {
        "id": "cor-60",
        "nombre": "DIRECCION SECCIONAL - CORDOBA",
        "cuposOfertados": 2,
        "cuposDisponibles": 2,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      }
    ]
  },
  {
    "id": "cas",
    "nombre": "Casanare",
    "esEspecial": false,
    "seccionales": [
      {
        "id": "cas-61",
        "nombre": "DIRECCION SECCIONAL - CASANARE",
        "cuposOfertados": 4,
        "cuposDisponibles": 4,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      }
    ]
  },
  {
    "id": "caq",
    "nombre": "Caquetá",
    "esEspecial": true,
    "seccionales": [
      {
        "id": "caq-62",
        "nombre": "DIRECCION SECCIONAL - CAQUETA",
        "cuposOfertados": 4,
        "cuposDisponibles": 4,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      }
    ]
  },
  {
    "id": "guv",
    "nombre": "Guaviare",
    "esEspecial": true,
    "seccionales": [
      {
        "id": "guv-63",
        "nombre": "NIVEL CENTRAL - GUAVIARE — DIRECCION ESPECIALIZADA CONTRA LA CORRUPCION",
        "cuposOfertados": 1,
        "cuposDisponibles": 1,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      },
      {
        "id": "guv-64",
        "nombre": "NIVEL CENTRAL - GUAVIARE — DIRECCION ESPECIALIZADA PARA LOS DELITOS CONTRA LOS RECURSOS NATURALES Y EL MEDIO AMBIENTE",
        "cuposOfertados": 1,
        "cuposDisponibles": 1,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      },
      {
        "id": "guv-65",
        "nombre": "DIRECCION SECCIONAL - GUAVIARE",
        "cuposOfertados": 1,
        "cuposDisponibles": 1,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      }
    ]
  },
  {
    "id": "ama",
    "nombre": "Amazonas",
    "esEspecial": true,
    "seccionales": [
      {
        "id": "ama-66",
        "nombre": "DIRECCION SECCIONAL - AMAZONAS",
        "cuposOfertados": 3,
        "cuposDisponibles": 3,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      }
    ]
  },
  {
    "id": "suc",
    "nombre": "Sucre",
    "esEspecial": false,
    "seccionales": [
      {
        "id": "suc-67",
        "nombre": "NIVEL CENTRAL - SUCRE — DIRECCION ESPECIALIZADA CONTRA EL NARCOTRAFICO",
        "cuposOfertados": 1,
        "cuposDisponibles": 1,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      },
      {
        "id": "suc-68",
        "nombre": "DIRECCION SECCIONAL - SUCRE",
        "cuposOfertados": 2,
        "cuposDisponibles": 2,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      }
    ]
  },
  {
    "id": "gua",
    "nombre": "Guainía",
    "esEspecial": true,
    "seccionales": [
      {
        "id": "gua-69",
        "nombre": "DIRECCION SECCIONAL - GUAINIA",
        "cuposOfertados": 2,
        "cuposDisponibles": 2,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      }
    ]
  },
  {
    "id": "vid",
    "nombre": "Vichada",
    "esEspecial": true,
    "seccionales": [
      {
        "id": "vid-70",
        "nombre": "DIRECCION SECCIONAL - VICHADA",
        "cuposOfertados": 2,
        "cuposDisponibles": 2,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      }
    ]
  },
  {
    "id": "vau",
    "nombre": "Vaupés",
    "esEspecial": true,
    "seccionales": [
      {
        "id": "vau-71",
        "nombre": "DIRECCION SECCIONAL - VAUPES",
        "cuposOfertados": 2,
        "cuposDisponibles": 2,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      }
    ]
  },
  {
    "id": "sap",
    "nombre": "San Andrés y Providencia",
    "esEspecial": true,
    "seccionales": [
      {
        "id": "sap-72",
        "nombre": "DIRECCION SECCIONAL - SAN ANDRES",
        "cuposOfertados": 2,
        "cuposDisponibles": 2,
        "cuposOcupados": 0,
        "disponible": true,
        "automatico": true
      }
    ]
  }
];
