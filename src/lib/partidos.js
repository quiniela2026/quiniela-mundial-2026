// 72 partidos — Fase de Grupos Mundial 2026
// Fuente: FIFA / TUDN (sorteo dic 2025)
// kickoff en UTC-4 (ET)

export const GRUPOS = {
  A: ['México', 'Sudáfrica', 'Corea del Sur', 'República Checa'],
  B: ['Canadá', 'Bosnia y Herzegovina', 'Nueva Zelanda', 'Arabia Saudita'],
  C: ['Francia', 'Senegal', 'Noruega', 'Irak'],
  D: ['Estados Unidos', 'Brasil', 'Marruecos', 'Islandia'],
  E: ['España', 'Países Bajos', 'Ecuador', 'Ruanda'],
  F: ['Alemania', 'Camerún', 'Uruguay', 'Hungría'],
  G: ['Japón', 'Ghana', 'Chile', 'Bélgica'],
  H: ['Inglaterra', 'Croacia', 'Panamá', 'Ghana'],
  I: ['Argentina', 'Jordania', 'Argelia', 'Austria'],
  J: ['Portugal', 'Colombia', 'Uzbekistán', 'RD Congo'],
  K: ['Italia', 'México (bis)', 'Haití', 'Venezuela'],
  L: ['Australia', 'Irán', 'Eslovaquia', 'Eslovenia'],
}

export const FLAGS = {
  'México': '🇲🇽', 'Sudáfrica': '🇿🇦', 'Corea del Sur': '🇰🇷', 'República Checa': '🇨🇿',
  'Canadá': '🇨🇦', 'Bosnia y Herzegovina': '🇧🇦', 'Nueva Zelanda': '🇳🇿', 'Arabia Saudita': '🇸🇦',
  'Francia': '🇫🇷', 'Senegal': '🇸🇳', 'Noruega': '🇳🇴', 'Irak': '🇮🇶',
  'Estados Unidos': '🇺🇸', 'Brasil': '🇧🇷', 'Marruecos': '🇲🇦', 'Islandia': '🇮🇸',
  'España': '🇪🇸', 'Países Bajos': '🇳🇱', 'Ecuador': '🇪🇨', 'Ruanda': '🇷🇼',
  'Alemania': '🇩🇪', 'Camerún': '🇨🇲', 'Uruguay': '🇺🇾', 'Hungría': '🇭🇺',
  'Japón': '🇯🇵', 'Ghana': '🇬🇭', 'Chile': '🇨🇱', 'Bélgica': '🇧🇪',
  'Inglaterra': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Croacia': '🇭🇷', 'Panamá': '🇵🇦',
  'Argentina': '🇦🇷', 'Jordania': '🇯🇴', 'Argelia': '🇩🇿', 'Austria': '🇦🇹',
  'Portugal': '🇵🇹', 'Colombia': '🇨🇴', 'Uzbekistán': '🇺🇿', 'RD Congo': '🇨🇩',
  'Italia': '🇮🇹', 'Haití': '🇭🇹', 'Venezuela': '🇻🇪',
  'Australia': '🇦🇺', 'Irán': '🇮🇷', 'Eslovaquia': '🇸🇰', 'Eslovenia': '🇸🇮',
}

// Genera los 72 partidos (3 por grupo, cada equipo juega 1 vez contra cada rival)
export const PARTIDOS = [
  // GRUPO A
  { id: 1,  grupo: 'A', fecha: '2026-06-11', hora: '13:00', local: 'México',            visita: 'Sudáfrica',           estadio: 'Ciudad de México' },
  { id: 2,  grupo: 'A', fecha: '2026-06-11', hora: '22:00', local: 'Corea del Sur',     visita: 'República Checa',    estadio: 'Guadalajara' },
  { id: 3,  grupo: 'A', fecha: '2026-06-16', hora: '16:00', local: 'México',            visita: 'Corea del Sur',      estadio: 'Ciudad de México' },
  { id: 4,  grupo: 'A', fecha: '2026-06-16', hora: '16:00', local: 'Sudáfrica',         visita: 'República Checa',    estadio: 'Guadalajara' },
  { id: 5,  grupo: 'A', fecha: '2026-06-22', hora: '20:00', local: 'México',            visita: 'República Checa',    estadio: 'Monterrey' },
  { id: 6,  grupo: 'A', fecha: '2026-06-22', hora: '20:00', local: 'Sudáfrica',         visita: 'Corea del Sur',      estadio: 'Dallas' },

  // GRUPO B
  { id: 7,  grupo: 'B', fecha: '2026-06-12', hora: '15:00', local: 'Canadá',            visita: 'Bosnia y Herzegovina', estadio: 'Toronto' },
  { id: 8,  grupo: 'B', fecha: '2026-06-12', hora: '21:00', local: 'Nueva Zelanda',     visita: 'Arabia Saudita',      estadio: 'Seattle' },
  { id: 9,  grupo: 'B', fecha: '2026-06-17', hora: '16:00', local: 'Canadá',            visita: 'Nueva Zelanda',       estadio: 'Vancouver' },
  { id: 10, grupo: 'B', fecha: '2026-06-17', hora: '16:00', local: 'Bosnia y Herzegovina', visita: 'Arabia Saudita',  estadio: 'Houston' },
  { id: 11, grupo: 'B', fecha: '2026-06-23', hora: '20:00', local: 'Canadá',            visita: 'Arabia Saudita',      estadio: 'Kansas City' },
  { id: 12, grupo: 'B', fecha: '2026-06-23', hora: '20:00', local: 'Bosnia y Herzegovina', visita: 'Nueva Zelanda',   estadio: 'Philadelphia' },

  // GRUPO C
  { id: 13, grupo: 'C', fecha: '2026-06-12', hora: '12:00', local: 'Francia',           visita: 'Senegal',             estadio: 'Nueva York/NJ' },
  { id: 14, grupo: 'C', fecha: '2026-06-12', hora: '18:00', local: 'Noruega',           visita: 'Irak',                estadio: 'Boston' },
  { id: 15, grupo: 'C', fecha: '2026-06-17', hora: '16:00', local: 'Francia',           visita: 'Noruega',             estadio: 'Atlanta' },
  { id: 16, grupo: 'C', fecha: '2026-06-17', hora: '16:00', local: 'Senegal',           visita: 'Irak',                estadio: 'Miami' },
  { id: 17, grupo: 'C', fecha: '2026-06-23', hora: '20:00', local: 'Francia',           visita: 'Irak',                estadio: 'Los Ángeles' },
  { id: 18, grupo: 'C', fecha: '2026-06-23', hora: '20:00', local: 'Senegal',           visita: 'Noruega',             estadio: 'Dallas' },

  // GRUPO D
  { id: 19, grupo: 'D', fecha: '2026-06-12', hora: '21:00', local: 'Estados Unidos',    visita: 'Brasil',              estadio: 'Los Ángeles' },
  { id: 20, grupo: 'D', fecha: '2026-06-13', hora: '13:00', local: 'Marruecos',         visita: 'Islandia',            estadio: 'Boston' },
  { id: 21, grupo: 'D', fecha: '2026-06-18', hora: '16:00', local: 'Estados Unidos',    visita: 'Marruecos',           estadio: 'Dallas' },
  { id: 22, grupo: 'D', fecha: '2026-06-18', hora: '16:00', local: 'Brasil',            visita: 'Islandia',            estadio: 'Seattle' },
  { id: 23, grupo: 'D', fecha: '2026-06-24', hora: '20:00', local: 'Estados Unidos',    visita: 'Islandia',            estadio: 'Atlanta' },
  { id: 24, grupo: 'D', fecha: '2026-06-24', hora: '20:00', local: 'Brasil',            visita: 'Marruecos',           estadio: 'Miami' },

  // GRUPO E
  { id: 25, grupo: 'E', fecha: '2026-06-13', hora: '15:00', local: 'España',            visita: 'Países Bajos',        estadio: 'Miami' },
  { id: 26, grupo: 'E', fecha: '2026-06-13', hora: '21:00', local: 'Ecuador',           visita: 'Ruanda',              estadio: 'Houston' },
  { id: 27, grupo: 'E', fecha: '2026-06-18', hora: '16:00', local: 'España',            visita: 'Ecuador',             estadio: 'Kansas City' },
  { id: 28, grupo: 'E', fecha: '2026-06-18', hora: '16:00', local: 'Países Bajos',      visita: 'Ruanda',              estadio: 'Nueva York/NJ' },
  { id: 29, grupo: 'E', fecha: '2026-06-24', hora: '20:00', local: 'España',            visita: 'Ruanda',              estadio: 'Boston' },
  { id: 30, grupo: 'E', fecha: '2026-06-24', hora: '20:00', local: 'Países Bajos',      visita: 'Ecuador',             estadio: 'Philadelphia' },

  // GRUPO F
  { id: 31, grupo: 'F', fecha: '2026-06-13', hora: '18:00', local: 'Alemania',          visita: 'Camerún',             estadio: 'Philadelphia' },
  { id: 32, grupo: 'F', fecha: '2026-06-14', hora: '13:00', local: 'Uruguay',           visita: 'Hungría',             estadio: 'Kansas City' },
  { id: 33, grupo: 'F', fecha: '2026-06-19', hora: '16:00', local: 'Alemania',          visita: 'Uruguay',             estadio: 'Boston' },
  { id: 34, grupo: 'F', fecha: '2026-06-19', hora: '16:00', local: 'Camerún',           visita: 'Hungría',             estadio: 'Atlanta' },
  { id: 35, grupo: 'F', fecha: '2026-06-25', hora: '20:00', local: 'Alemania',          visita: 'Hungría',             estadio: 'Nueva York/NJ' },
  { id: 36, grupo: 'F', fecha: '2026-06-25', hora: '20:00', local: 'Camerún',           visita: 'Uruguay',             estadio: 'Seattle' },

  // GRUPO G
  { id: 37, grupo: 'G', fecha: '2026-06-14', hora: '15:00', local: 'Japón',             visita: 'Ghana',               estadio: 'Los Ángeles' },
  { id: 38, grupo: 'G', fecha: '2026-06-14', hora: '21:00', local: 'Chile',             visita: 'Bélgica',             estadio: 'Miami' },
  { id: 39, grupo: 'G', fecha: '2026-06-19', hora: '16:00', local: 'Japón',             visita: 'Chile',               estadio: 'Seattle' },
  { id: 40, grupo: 'G', fecha: '2026-06-19', hora: '16:00', local: 'Ghana',             visita: 'Bélgica',             estadio: 'Houston' },
  { id: 41, grupo: 'G', fecha: '2026-06-25', hora: '20:00', local: 'Japón',             visita: 'Bélgica',             estadio: 'Dallas' },
  { id: 42, grupo: 'G', fecha: '2026-06-25', hora: '20:00', local: 'Chile',             visita: 'Ghana',               estadio: 'Kansas City' },

  // GRUPO H
  { id: 43, grupo: 'H', fecha: '2026-06-14', hora: '18:00', local: 'Inglaterra',        visita: 'Croacia',             estadio: 'Nueva York/NJ' },
  { id: 44, grupo: 'H', fecha: '2026-06-15', hora: '13:00', local: 'Panamá',            visita: 'Ghana',               estadio: 'Atlanta' },
  { id: 45, grupo: 'H', fecha: '2026-06-20', hora: '16:00', local: 'Inglaterra',        visita: 'Panamá',              estadio: 'Boston' },
  { id: 46, grupo: 'H', fecha: '2026-06-20', hora: '16:00', local: 'Croacia',           visita: 'Ghana',               estadio: 'Miami' },
  { id: 47, grupo: 'H', fecha: '2026-06-26', hora: '20:00', local: 'Inglaterra',        visita: 'Ghana',               estadio: 'Philadelphia' },
  { id: 48, grupo: 'H', fecha: '2026-06-26', hora: '20:00', local: 'Croacia',           visita: 'Panamá',              estadio: 'Los Ángeles' },

  // GRUPO I
  { id: 49, grupo: 'I', fecha: '2026-06-15', hora: '15:00', local: 'Argentina',         visita: 'Argelia',             estadio: 'Houston' },
  { id: 50, grupo: 'I', fecha: '2026-06-15', hora: '21:00', local: 'Jordania',          visita: 'Austria',             estadio: 'Seattle' },
  { id: 51, grupo: 'I', fecha: '2026-06-20', hora: '16:00', local: 'Argentina',         visita: 'Jordania',            estadio: 'Dallas' },
  { id: 52, grupo: 'I', fecha: '2026-06-20', hora: '16:00', local: 'Argelia',           visita: 'Austria',             estadio: 'Kansas City' },
  { id: 53, grupo: 'I', fecha: '2026-06-26', hora: '20:00', local: 'Argentina',         visita: 'Austria',             estadio: 'Los Ángeles' },
  { id: 54, grupo: 'I', fecha: '2026-06-26', hora: '20:00', local: 'Jordania',          visita: 'Argelia',             estadio: 'Dallas' },

  // GRUPO J
  { id: 55, grupo: 'J', fecha: '2026-06-15', hora: '18:00', local: 'Portugal',          visita: 'Uzbekistán',          estadio: 'Kansas City' },
  { id: 56, grupo: 'J', fecha: '2026-06-16', hora: '13:00', local: 'Colombia',          visita: 'RD Congo',            estadio: 'Philadelphia' },
  { id: 57, grupo: 'J', fecha: '2026-06-21', hora: '16:00', local: 'Portugal',          visita: 'Colombia',            estadio: 'Seattle' },
  { id: 58, grupo: 'J', fecha: '2026-06-21', hora: '16:00', local: 'Uzbekistán',        visita: 'RD Congo',            estadio: 'Los Ángeles' },
  { id: 59, grupo: 'J', fecha: '2026-06-27', hora: '20:00', local: 'Portugal',          visita: 'RD Congo',            estadio: 'Houston' },
  { id: 60, grupo: 'J', fecha: '2026-06-27', hora: '20:00', local: 'Colombia',          visita: 'Uzbekistán',          estadio: 'Dallas' },

  // GRUPO K
  { id: 61, grupo: 'K', fecha: '2026-06-16', hora: '18:00', local: 'Italia',            visita: 'Haití',               estadio: 'Atlanta' },
  { id: 62, grupo: 'K', fecha: '2026-06-16', hora: '21:00', local: 'Ecuador',           visita: 'Venezuela',           estadio: 'Miami' },
  { id: 63, grupo: 'K', fecha: '2026-06-21', hora: '16:00', local: 'Italia',            visita: 'Ecuador',             estadio: 'Boston' },
  { id: 64, grupo: 'K', fecha: '2026-06-21', hora: '16:00', local: 'Haití',             visita: 'Venezuela',           estadio: 'Houston' },
  { id: 65, grupo: 'K', fecha: '2026-06-27', hora: '20:00', local: 'Italia',            visita: 'Venezuela',           estadio: 'Nueva York/NJ' },
  { id: 66, grupo: 'K', fecha: '2026-06-27', hora: '20:00', local: 'Haití',             visita: 'Ecuador',             estadio: 'Kansas City' },

  // GRUPO L
  { id: 67, grupo: 'L', fecha: '2026-06-17', hora: '13:00', local: 'Australia',         visita: 'Irán',                estadio: 'Guadalajara' },
  { id: 68, grupo: 'L', fecha: '2026-06-17', hora: '18:00', local: 'Eslovaquia',        visita: 'Eslovenia',           estadio: 'Monterrey' },
  { id: 69, grupo: 'L', fecha: '2026-06-22', hora: '16:00', local: 'Australia',         visita: 'Eslovaquia',          estadio: 'Ciudad de México' },
  { id: 70, grupo: 'L', fecha: '2026-06-22', hora: '16:00', local: 'Irán',              visita: 'Eslovenia',           estadio: 'Monterrey' },
  { id: 71, grupo: 'L', fecha: '2026-06-27', hora: '20:00', local: 'Australia',         visita: 'Eslovenia',           estadio: 'Guadalajara' },
  { id: 72, grupo: 'L', fecha: '2026-06-27', hora: '20:00', local: 'Irán',              visita: 'Eslovaquia',          estadio: 'Dallas' },
]
