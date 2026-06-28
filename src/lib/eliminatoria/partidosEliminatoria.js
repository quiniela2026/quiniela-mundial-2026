// 16 partidos — Dieciseisavos de Final Mundial 2026
// Fase de eliminación directa. Independiente de la fase de grupos.

export const FLAGS_ELIM = {
  'Sudáfrica': '🇿🇦', 'Canadá': '🇨🇦',
  'Alemania': '🇩🇪', 'Paraguay': '🇵🇾',
  'Países Bajos': '🇳🇱', 'Marruecos': '🇲🇦',
  'Brasil': '🇧🇷', 'Japón': '🇯🇵',
  'Francia': '🇫🇷', 'Suecia': '🇸🇪',
  'Costa de Marfil': '🇨🇮', 'Noruega': '🇳🇴',
  'México': '🇲🇽', 'Ecuador': '🇪🇨',
  'Inglaterra': '🏴', 'RD Congo': '🇨🇩',
  'Estados Unidos': '🇺🇸', 'Bosnia': '🇧🇦',
  'Bélgica': '🇧🇪', 'Senegal': '🇸🇳',
  'Portugal': '🇵🇹', 'Croacia': '🇭🇷',
  'España': '🇪🇸', 'Austria': '🇦🇹',
  'Suiza': '🇨🇭', 'Argelia': '🇩🇿',
  'Argentina': '🇦🇷', 'Cabo Verde': '🇨🇻',
  'Colombia': '🇨🇴', 'Ghana': '🇬🇭',
  'Australia': '🇦🇺', 'Egipto': '🇪🇬',
}

export const PARTIDOS_ELIMINATORIA = [
  { id: 101, ronda: '16avos', fecha: '2026-06-28', hora: '14:00', local: 'Sudáfrica',       visita: 'Canadá',     estadio: 'Los Ángeles' },
  { id: 102, ronda: '16avos', fecha: '2026-06-29', hora: '16:30', local: 'Alemania',        visita: 'Paraguay',   estadio: 'Boston' },
  { id: 103, ronda: '16avos', fecha: '2026-06-29', hora: '19:00', local: 'Países Bajos',    visita: 'Marruecos',  estadio: 'Monterrey' },
  { id: 104, ronda: '16avos', fecha: '2026-06-29', hora: '12:00', local: 'Brasil',          visita: 'Japón',      estadio: 'Houston' },
  { id: 105, ronda: '16avos', fecha: '2026-06-30', hora: '15:00', local: 'Francia',         visita: 'Suecia',     estadio: 'Nueva York/NJ' },
  { id: 106, ronda: '16avos', fecha: '2026-06-30', hora: '12:00', local: 'Costa de Marfil', visita: 'Noruega',    estadio: 'Dallas' },
  { id: 107, ronda: '16avos', fecha: '2026-06-30', hora: '19:00', local: 'México',          visita: 'Ecuador',    estadio: 'Ciudad de México' },
  { id: 108, ronda: '16avos', fecha: '2026-07-01', hora: '12:00', local: 'Inglaterra',      visita: 'RD Congo',   estadio: 'Atlanta' },
  { id: 109, ronda: '16avos', fecha: '2026-07-01', hora: '15:00', local: 'Estados Unidos',  visita: 'Bosnia',     estadio: 'San Francisco' },
  { id: 110, ronda: '16avos', fecha: '2026-07-01', hora: '13:00', local: 'Bélgica',         visita: 'Senegal',    estadio: 'Seattle' },
  { id: 111, ronda: '16avos', fecha: '2026-07-02', hora: '16:00', local: 'Portugal',        visita: 'Croacia',    estadio: 'Toronto' },
  { id: 112, ronda: '16avos', fecha: '2026-07-02', hora: '21:00', local: 'España',          visita: 'Austria',    estadio: 'Los Ángeles' },
  { id: 113, ronda: '16avos', fecha: '2026-07-02', hora: '13:00', local: 'Suiza',           visita: 'Argelia',    estadio: 'Vancouver' },
  { id: 114, ronda: '16avos', fecha: '2026-07-03', hora: '23:00', local: 'Argentina',       visita: 'Cabo Verde', estadio: 'Miami' },
  { id: 115, ronda: '16avos', fecha: '2026-07-03', hora: '20:00', local: 'Colombia',        visita: 'Ghana',      estadio: 'Kansas City' },
  { id: 116, ronda: '16avos', fecha: '2026-07-03', hora: '19:00', local: 'Australia',       visita: 'Egipto',     estadio: 'Dallas' },
]

export const RONDAS_LABEL = {
  '16avos': '16avos de Final',
  octavos: 'Octavos de Final',
  cuartos: 'Cuartos de Final',
  semis: 'Semifinal',
  final: 'Final',
}
