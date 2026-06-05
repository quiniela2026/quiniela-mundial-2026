/**
 * Sistema de puntos Quiniela Mundial 2026
 *
 * 5 pts — Marcador exacto (ambos equipos)
 * 4 pts — Ganador/empate correcto + marcador de un equipo correcto
 * 3 pts — Solo ganador o empate correcto
 * 1 pt  — Solo marcador de un equipo correcto (sin acertar ganador)
 * 0 pts — Todo incorrecto
 */
export function calcularPuntos(pred, resultado) {
  if (!resultado || resultado.goles_local === null || resultado.goles_local === undefined) return null
  if (pred?.goles_local_pred === undefined || pred?.goles_local_pred === null ||
      pred?.goles_visita_pred === undefined || pred?.goles_visita_pred === null) return null

  const pL = parseInt(pred.goles_local_pred)
  const pV = parseInt(pred.goles_visita_pred)
  const rL = resultado.goles_local
  const rV = resultado.goles_visita

  if (isNaN(pL) || isNaN(pV)) return null

  const marcadorExacto = pL === rL && pV === rV
  const ganadorPred = pL > pV ? 'L' : pL < pV ? 'V' : 'E'
  const ganadorReal = rL > rV ? 'L' : rL < rV ? 'V' : 'E'
  const aciertoGanador = ganadorPred === ganadorReal
  const aciertoLocal = pL === rL
  const aciertoVisita = pV === rV
  const aciertoUnEquipo = aciertoLocal || aciertoVisita

  if (marcadorExacto) return 5
  if (aciertoGanador && aciertoUnEquipo) return 4
  if (aciertoGanador) return 3
  if (aciertoUnEquipo) return 1
  return 0
}

export function labelPuntos(pts) {
  if (pts === 5) return { texto: '⭐ +5 exacto', clase: 'puntos-5' }
  if (pts === 4) return { texto: '🎯 +4 ganador+gol', clase: 'puntos-4' }
  if (pts === 3) return { texto: '✅ +3 ganador', clase: 'puntos-3' }
  if (pts === 1) return { texto: '〽️ +1 un marcador', clase: 'puntos-1' }
  return { texto: '+0', clase: 'puntos-0' }
}

export const MAX_PUNTOS_POR_PARTIDO = 5
export const TOTAL_PARTIDOS = 72
export const MAX_PUNTOS_TOTAL = TOTAL_PARTIDOS * MAX_PUNTOS_POR_PARTIDO // 360
