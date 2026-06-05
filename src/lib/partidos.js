// 72 partidos — Fase de Grupos Mundial 2026
// Sorteo oficial FIFA: 5 de diciembre de 2025, Kennedy Center, Washington D.C.

export const GRUPOS = {
  A: ['México', 'Sudáfrica', 'Corea del Sur', 'Chequia'],
  B: ['Canadá', 'Qatar', 'Suiza', 'Bosnia y Herzegovina'],
  C: ['Brasil', 'Marruecos', 'Haití', 'Escocia'],
  D: ['Estados Unidos', 'Paraguay', 'Australia', 'Turquía'],
  E: ['Alemania', 'Curazao', 'Costa de Marfil', 'Ecuador'],
  F: ['Países Bajos', 'Japón', 'Túnez', 'Suecia'],
  G: ['Bélgica', 'Egipto', 'Irán', 'Nueva Zelanda'],
  H: ['España', 'Cabo Verde', 'Arabia Saudita', 'Uruguay'],
  I: ['Francia', 'Senegal', 'Noruega', 'Irak'],
  J: ['Argentina', 'Argelia', 'Austria', 'Jordania'],
  K: ['Portugal', 'Colombia', 'Uzbekistán', 'RD Congo'],
  L: ['Inglaterra', 'Croacia', 'Ghana', 'Panamá'],
}

export const FLAGS = {
  'México': '🇲🇽', 'Sudáfrica': '🇿🇦', 'Corea del Sur': '🇰🇷', 'Chequia': '🇨🇿',
  'Canadá': '🇨🇦', 'Qatar': '🇶🇦', 'Suiza': '🇨🇭', 'Bosnia y Herzegovina': '🇧🇦',
  'Brasil': '🇧🇷', 'Marruecos': '🇲🇦', 'Haití': '🇭🇹', 'Escocia': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Estados Unidos': '🇺🇸', 'Paraguay': '🇵🇾', 'Australia': '🇦🇺', 'Turquía': '🇹🇷',
  'Alemania': '🇩🇪', 'Curazao': '🇨🇼', 'Costa de Marfil': '🇨🇮', 'Ecuador': '🇪🇨',
  'Países Bajos': '🇳🇱', 'Japón': '🇯🇵', 'Túnez': '🇹🇳', 'Suecia': '🇸🇪',
  'Bélgica': '🇧🇪', 'Egipto': '🇪🇬', 'Irán': '🇮🇷', 'Nueva Zelanda': '🇳🇿',
  'España': '🇪🇸', 'Cabo Verde': '🇨🇻', 'Arabia Saudita': '🇸🇦', 'Uruguay': '🇺🇾',
  'Francia': '🇫🇷', 'Senegal': '🇸🇳', 'Noruega': '🇳🇴', 'Irak': '🇮🇶',
  'Argentina': '🇦🇷', 'Argelia': '🇩🇿', 'Austria': '🇦🇹', 'Jordania': '🇯🇴',
  'Portugal': '🇵🇹', 'Colombia': '🇨🇴', 'Uzbekistán': '🇺🇿', 'RD Congo': '🇨🇩',
  'Inglaterra': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Croacia': '🇭🇷', 'Ghana': '🇬🇭', 'Panamá': '🇵🇦',
}

export const PARTIDOS = [
  // GRUPO A — México, Sudáfrica, Corea del Sur, Chequia
  { id: 1,  grupo: 'A', fecha: '2026-06-11', hora: '13:00', local: 'México',          visita: 'Sudáfrica',           estadio: 'Ciudad de México' },
  { id: 2,  grupo: 'A', fecha: '2026-06-11', hora: '22:00', local: 'Corea del Sur',   visita: 'Chequia',             estadio: 'Guadalajara' },
  { id: 3,  grupo: 'A', fecha: '2026-06-16', hora: '16:00', local: 'México',          visita: 'Corea del Sur',       estadio: 'Ciudad de México' },
  { id: 4,  grupo: 'A', fecha: '2026-06-16', hora: '16:00', local: 'Sudáfrica',       visita: 'Chequia',             estadio: 'Guadalajara' },
  { id: 5,  grupo: 'A', fecha: '2026-06-22', hora: '20:00', local: 'México',          visita: 'Chequia',             estadio: 'Monterrey' },
  { id: 6,  grupo: 'A', fecha: '2026-06-22', hora: '20:00', local: 'Sudáfrica',       visita: 'Corea del Sur',       estadio: 'Dallas' },

  // GRUPO B — Canadá, Qatar, Suiza, Bosnia y Herzegovina
  { id: 7,  grupo: 'B', fecha: '2026-06-12', hora: '15:00', local: 'Canadá',          visita: 'Bosnia y Herzegovina',estadio: 'Toronto' },
  { id: 8,  grupo: 'B', fecha: '2026-06-12', hora: '21:00', local: 'Qatar',           visita: 'Suiza',               estadio: 'Seattle' },
  { id: 9,  grupo: 'B', fecha: '2026-06-17', hora: '16:00', local: 'Canadá',          visita: 'Qatar',               estadio: 'Vancouver' },
  { id: 10, grupo: 'B', fecha: '2026-06-17', hora: '16:00', local: 'Bosnia y Herzegovina', visita: 'Suiza',          estadio: 'Houston' },
  { id: 11, grupo: 'B', fecha: '2026-06-23', hora: '20:00', local: 'Canadá',          visita: 'Suiza',               estadio: 'Kansas City' },
  { id: 12, grupo: 'B', fecha: '2026-06-23', hora: '20:00', local: 'Bosnia y Herzegovina', visita: 'Qatar',          estadio: 'Philadelphia' },

  // GRUPO C — Brasil, Marruecos, Haití, Escocia
  { id: 13, grupo: 'C', fecha: '2026-06-12', hora: '12:00', local: 'Brasil',          visita: 'Marruecos',           estadio: 'Nueva York/NJ' },
  { id: 14, grupo: 'C', fecha: '2026-06-12', hora: '18:00', local: 'Haití',           visita: 'Escocia',             estadio: 'Boston' },
  { id: 15, grupo: 'C', fecha: '2026-06-17', hora: '16:00', local: 'Brasil',          visita: 'Haití',               estadio: 'Atlanta' },
  { id: 16, grupo: 'C', fecha: '2026-06-17', hora: '16:00', local: 'Marruecos',       visita: 'Escocia',             estadio: 'Miami' },
  { id: 17, grupo: 'C', fecha: '2026-06-23', hora: '20:00', local: 'Brasil',          visita: 'Escocia',             estadio: 'Los Ángeles' },
  { id: 18, grupo: 'C', fecha: '2026-06-23', hora: '20:00', local: 'Marruecos',       visita: 'Haití',               estadio: 'Dallas' },

  // GRUPO D — Estados Unidos, Paraguay, Australia, Turquía
  { id: 19, grupo: 'D', fecha: '2026-06-12', hora: '21:00', local: 'Estados Unidos',  visita: 'Paraguay',            estadio: 'Los Ángeles' },
  { id: 20, grupo: 'D', fecha: '2026-06-13', hora: '13:00', local: 'Australia',       visita: 'Turquía',             estadio: 'Boston' },
  { id: 21, grupo: 'D', fecha: '2026-06-18', hora: '16:00', local: 'Estados Unidos',  visita: 'Australia',           estadio: 'Dallas' },
  { id: 22, grupo: 'D', fecha: '2026-06-18', hora: '16:00', local: 'Paraguay',        visita: 'Turquía',             estadio: 'Seattle' },
  { id: 23, grupo: 'D', fecha: '2026-06-24', hora: '20:00', local: 'Estados Unidos',  visita: 'Turquía',             estadio: 'Atlanta' },
  { id: 24, grupo: 'D', fecha: '2026-06-24', hora: '20:00', local: 'Paraguay',        visita: 'Australia',           estadio: 'Miami' },

  // GRUPO E — Alemania, Curazao, Costa de Marfil, Ecuador
  { id: 25, grupo: 'E', fecha: '2026-06-13', hora: '15:00', local: 'Alemania',        visita: 'Curazao',             estadio: 'Miami' },
  { id: 26, grupo: 'E', fecha: '2026-06-13', hora: '21:00', local: 'Costa de Marfil', visita: 'Ecuador',             estadio: 'Houston' },
  { id: 27, grupo: 'E', fecha: '2026-06-18', hora: '16:00', local: 'Alemania',        visita: 'Costa de Marfil',     estadio: 'Kansas City' },
  { id: 28, grupo: 'E', fecha: '2026-06-18', hora: '16:00', local: 'Curazao',         visita: 'Ecuador',             estadio: 'Nueva York/NJ' },
  { id: 29, grupo: 'E', fecha: '2026-06-24', hora: '20:00', local: 'Alemania',        visita: 'Ecuador',             estadio: 'Boston' },
  { id: 30, grupo: 'E', fecha: '2026-06-24', hora: '20:00', local: 'Curazao',         visita: 'Costa de Marfil',     estadio: 'Philadelphia' },

  // GRUPO F — Países Bajos, Japón, Túnez, Suecia
  { id: 31, grupo: 'F', fecha: '2026-06-13', hora: '18:00', local: 'Países Bajos',    visita: 'Japón',               estadio: 'Philadelphia' },
  { id: 32, grupo: 'F', fecha: '2026-06-14', hora: '13:00', local: 'Túnez',           visita: 'Suecia',              estadio: 'Kansas City' },
  { id: 33, grupo: 'F', fecha: '2026-06-19', hora: '16:00', local: 'Países Bajos',    visita: 'Túnez',               estadio: 'Boston' },
  { id: 34, grupo: 'F', fecha: '2026-06-19', hora: '16:00', local: 'Japón',           visita: 'Suecia',              estadio: 'Atlanta' },
  { id: 35, grupo: 'F', fecha: '2026-06-25', hora: '20:00', local: 'Países Bajos',    visita: 'Suecia',              estadio: 'Nueva York/NJ' },
  { id: 36, grupo: 'F', fecha: '2026-06-25', hora: '20:00', local: 'Japón',           visita: 'Túnez',               estadio: 'Seattle' },

  // GRUPO G — Bélgica, Egipto, Irán, Nueva Zelanda
  { id: 37, grupo: 'G', fecha: '2026-06-14', hora: '15:00', local: 'Bélgica',         visita: 'Egipto',              estadio: 'Los Ángeles' },
  { id: 38, grupo: 'G', fecha: '2026-06-14', hora: '21:00', local: 'Irán',            visita: 'Nueva Zelanda',       estadio: 'Miami' },
  { id: 39, grupo: 'G', fecha: '2026-06-19', hora: '16:00', local: 'Bélgica',         visita: 'Irán',                estadio: 'Seattle' },
  { id: 40, grupo: 'G', fecha: '2026-06-19', hora: '16:00', local: 'Egipto',          visita: 'Nueva Zelanda',       estadio: 'Houston' },
  { id: 41, grupo: 'G', fecha: '2026-06-25', hora: '20:00', local: 'Bélgica',         visita: 'Nueva Zelanda',       estadio: 'Dallas' },
  { id: 42, grupo: 'G', fecha: '2026-06-25', hora: '20:00', local: 'Egipto',          visita: 'Irán',                estadio: 'Kansas City' },

  // GRUPO H — España, Cabo Verde, Arabia Saudita, Uruguay
  { id: 43, grupo: 'H', fecha: '2026-06-14', hora: '18:00', local: 'España',          visita: 'Cabo Verde',          estadio: 'Nueva York/NJ' },
  { id: 44, grupo: 'H', fecha: '2026-06-15', hora: '13:00', local: 'Arabia Saudita',  visita: 'Uruguay',             estadio: 'Atlanta' },
  { id: 45, grupo: 'H', fecha: '2026-06-20', hora: '16:00', local: 'España',          visita: 'Arabia Saudita',      estadio: 'Boston' },
  { id: 46, grupo: 'H', fecha: '2026-06-20', hora: '16:00', local: 'Cabo Verde',      visita: 'Uruguay',             estadio: 'Miami' },
  { id: 47, grupo: 'H', fecha: '2026-06-26', hora: '20:00', local: 'España',          visita: 'Uruguay',             estadio: 'Philadelphia' },
  { id: 48, grupo: 'H', fecha: '2026-06-26', hora: '20:00', local: 'Cabo Verde',      visita: 'Arabia Saudita',      estadio: 'Los Ángeles' },

  // GRUPO I — Francia, Senegal, Noruega, Irak
  { id: 49, grupo: 'I', fecha: '2026-06-15', hora: '15:00', local: 'Francia',         visita: 'Senegal',             estadio: 'Houston' },
  { id: 50, grupo: 'I', fecha: '2026-06-15', hora: '21:00', local: 'Noruega',         visita: 'Irak',                estadio: 'Seattle' },
  { id: 51, grupo: 'I', fecha: '2026-06-20', hora: '16:00', local: 'Francia',         visita: 'Noruega',             estadio: 'Dallas' },
  { id: 52, grupo: 'I', fecha: '2026-06-20', hora: '16:00', local: 'Senegal',         visita: 'Irak',                estadio: 'Kansas City' },
  { id: 53, grupo: 'I', fecha: '2026-06-26', hora: '20:00', local: 'Francia',         visita: 'Irak',                estadio: 'Los Ángeles' },
  { id: 54, grupo: 'I', fecha: '2026-06-26', hora: '20:00', local: 'Noruega',         visita: 'Senegal',             estadio: 'Dallas' },

  // GRUPO J — Argentina, Argelia, Austria, Jordania
  { id: 55, grupo: 'J', fecha: '2026-06-15', hora: '18:00', local: 'Argentina',       visita: 'Argelia',             estadio: 'Kansas City' },
  { id: 56, grupo: 'J', fecha: '2026-06-16', hora: '13:00', local: 'Austria',         visita: 'Jordania',            estadio: 'Philadelphia' },
  { id: 57, grupo: 'J', fecha: '2026-06-21', hora: '16:00', local: 'Argentina',       visita: 'Austria',             estadio: 'Seattle' },
  { id: 58, grupo: 'J', fecha: '2026-06-21', hora: '16:00', local: 'Argelia',         visita: 'Jordania',            estadio: 'Los Ángeles' },
  { id: 59, grupo: 'J', fecha: '2026-06-27', hora: '20:00', local: 'Argentina',       visita: 'Jordania',            estadio: 'Houston' },
  { id: 60, grupo: 'J', fecha: '2026-06-27', hora: '20:00', local: 'Argelia',         visita: 'Austria',             estadio: 'Dallas' },

  // GRUPO K — Portugal, Colombia, Uzbekistán, RD Congo
  { id: 61, grupo: 'K', fecha: '2026-06-16', hora: '18:00', local: 'Portugal',        visita: 'Uzbekistán',          estadio: 'Atlanta' },
  { id: 62, grupo: 'K', fecha: '2026-06-16', hora: '21:00', local: 'Colombia',        visita: 'RD Congo',            estadio: 'Miami' },
  { id: 63, grupo: 'K', fecha: '2026-06-21', hora: '16:00', local: 'Portugal',        visita: 'Colombia',            estadio: 'Boston' },
  { id: 64, grupo: 'K', fecha: '2026-06-21', hora: '16:00', local: 'Uzbekistán',      visita: 'RD Congo',            estadio: 'Houston' },
  { id: 65, grupo: 'K', fecha: '2026-06-27', hora: '20:00', local: 'Portugal',        visita: 'RD Congo',            estadio: 'Nueva York/NJ' },
  { id: 66, grupo: 'K', fecha: '2026-06-27', hora: '20:00', local: 'Colombia',        visita: 'Uzbekistán',          estadio: 'Kansas City' },

  // GRUPO L — Inglaterra, Croacia, Ghana, Panamá
  { id: 67, grupo: 'L', fecha: '2026-06-17', hora: '13:00', local: 'Inglaterra',      visita: 'Croacia',             estadio: 'Guadalajara' },
  { id: 68, grupo: 'L', fecha: '2026-06-17', hora: '18:00', local: 'Ghana',           visita: 'Panamá',              estadio: 'Monterrey' },
  { id: 69, grupo: 'L', fecha: '2026-06-22', hora: '16:00', local: 'Inglaterra',      visita: 'Ghana',               estadio: 'Ciudad de México' },
  { id: 70, grupo: 'L', fecha: '2026-06-22', hora: '16:00', local: 'Croacia',         visita: 'Panamá',              estadio: 'Monterrey' },
  { id: 71, grupo: 'L', fecha: '2026-06-27', hora: '20:00', local: 'Inglaterra',      visita: 'Panamá',              estadio: 'Guadalajara' },
  { id: 72, grupo: 'L', fecha: '2026-06-27', hora: '20:00', local: 'Croacia',         visita: 'Ghana',               estadio: 'Dallas' },
]
