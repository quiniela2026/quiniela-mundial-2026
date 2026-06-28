// Estructura del Bracket completo — Mundial 2026
// IDs de 16avos (101-116) mapeados 1:1 con los partidos oficiales FIFA 73-88
// La progresión de octavos/cuartos/semis/final replica EXACTAMENTE el bracket oficial de FIFA
// Fuente verificada: bracket oficial FIFA / FOX Sports (partidos 73-102)
//
// Mapeo de partido oficial FIFA -> nuestro ID interno de 16avos:
//   FIFA 73 (Alemania-Paraguay)    -> 102
//   FIFA 74 (Francia-Suecia)       -> 105
//   FIFA 75 (Sudáfrica-Canadá)     -> 101
//   FIFA 76 (P.Bajos-Marruecos)    -> 103
//   FIFA 77 (Brasil-Japón)         -> 104
//   FIFA 78 (C.Marfil-Noruega)     -> 106
//   FIFA 79 (México-Ecuador)       -> 107
//   FIFA 80 (Inglaterra-RDCongo)   -> 108
//   FIFA 81 (Bélgica-Senegal)      -> 110
//   FIFA 82 (EEUU-Bosnia)          -> 109
//   FIFA 83 (Portugal-Croacia)     -> 111
//   FIFA 84 (España-Austria)       -> 112
//   FIFA 85 (Suiza-Argelia)        -> 113
//   FIFA 86 (Argentina-CaboVerde)  -> 114
//   FIFA 87 (Colombia-Ghana)       -> 115
//   FIFA 88 (Australia-Egipto)    -> 116
//
// CORRECCIÓN (28-jun-2026): las llaves 201/202 y 207/208 tenían los rivales
// cruzados entre sí. Verificado contra el bracket oficial (imagen FIFA):
//   201 = Alemania/Paraguay (102) x Francia/Suecia (105)
//   202 = Sudáfrica/Canadá (101) x P.Bajos/Marruecos (103)
//   207 = Argentina/CaboVerde (114) x Australia/Egipto (116)
//   208 = Suiza/Argelia (113) x Colombia/Ghana (115)

// Octavos de final — cada llave indica qué dos partidos de 16avos alimentan el cruce
export const LLAVES_OCTAVOS = [
  { id: 201, fifaId: 89, equipoA: { ronda: 102 }, equipoB: { ronda: 105 }, fecha: '2026-07-04', estadio: 'Houston' },   // W73 x W74 -> Alemania/Paraguay x Francia/Suecia
  { id: 202, fifaId: 90, equipoA: { ronda: 101 }, equipoB: { ronda: 103 }, fecha: '2026-07-04', estadio: 'Philadelphia' }, // W75 x W76 -> Sudáfrica/Canadá x P.Bajos/Marruecos
  { id: 203, fifaId: 93, equipoA: { ronda: 104 }, equipoB: { ronda: 106 }, fecha: '2026-07-06', estadio: 'Dallas' },   // W77 x W78 -> Brasil/Japón x C.Marfil/Noruega
  { id: 204, fifaId: 96, equipoA: { ronda: 107 }, equipoB: { ronda: 108 }, fecha: '2026-07-05', estadio: 'Mexico City' }, // W79 x W80 -> México/Ecuador x Inglaterra/RDCongo
  { id: 205, fifaId: 94, equipoA: { ronda: 110 }, equipoB: { ronda: 109 }, fecha: '2026-07-06', estadio: 'Seattle' },  // W81 x W82 -> Bélgica/Senegal x EEUU/Bosnia
  { id: 206, fifaId: 95, equipoA: { ronda: 112 }, equipoB: { ronda: 111 }, fecha: '2026-07-06', estadio: 'Vancouver' }, // W84 x W83 -> España/Austria x Portugal/Croacia
  { id: 207, fifaId: 91, equipoA: { ronda: 114 }, equipoB: { ronda: 116 }, fecha: '2026-07-07', estadio: 'Miami' },    // W86 x W88 -> Argentina/CaboVerde x Australia/Egipto
  { id: 208, fifaId: 92, equipoA: { ronda: 113 }, equipoB: { ronda: 115 }, fecha: '2026-07-07', estadio: 'Atlanta' },  // W85 x W87 -> Suiza/Argelia x Colombia/Ghana
]

// Cuartos de final
export const LLAVES_CUARTOS = [
  { id: 301, fifaId: 97,  equipoA: { ronda: 201 }, equipoB: { ronda: 202 }, fecha: '2026-07-09', estadio: 'Boston' },
  { id: 302, fifaId: 98,  equipoA: { ronda: 203 }, equipoB: { ronda: 204 }, fecha: '2026-07-10', estadio: 'Los Angeles' },
  { id: 303, fifaId: 99,  equipoA: { ronda: 207 }, equipoB: { ronda: 208 }, fecha: '2026-07-11', estadio: 'Miami' },
  { id: 304, fifaId: 100, equipoA: { ronda: 205 }, equipoB: { ronda: 206 }, fecha: '2026-07-11', estadio: 'Kansas City' },
]

// Semifinales
export const LLAVES_SEMIS = [
  { id: 401, fifaId: 101, equipoA: { ronda: 301 }, equipoB: { ronda: 302 }, fecha: '2026-07-14', estadio: 'Dallas' },
  { id: 402, fifaId: 102, equipoA: { ronda: 303 }, equipoB: { ronda: 304 }, fecha: '2026-07-15', estadio: 'Atlanta' },
]

// Final
export const LLAVE_FINAL = { id: 501, equipoA: { ronda: 401 }, equipoB: { ronda: 402 }, fecha: '2026-07-19', estadio: 'East Rutherford, NJ' }
