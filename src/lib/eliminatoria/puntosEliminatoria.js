// Sistema de puntos — Fase Eliminatoria (16avos en adelante)
//
// 5 pts → marcador exacto en 90 minutos
// 3 pts → acierta quién avanza Y la diferencia de gol es correcta (sin ser exacto)
// 2 pts → solo acierta quién avanza (incluye penales si predijo el equipo correcto)
// 1 pt  → predijo empate en 90 min y el partido terminó empatado en 90 min
//         (independiente de si acertó quién avanza en penales)
// 0 pts → no acierta nada
//
// pred: { goles_local_pred, goles_visita_pred, avanza_pred }
//   avanza_pred solo se usa si pred predice empate en 90 min — nombre del equipo
// res:  { goles_local, goles_visita, avanza }
//   avanza solo se llena si el resultado en 90 min fue empate — nombre del equipo ganador

export const MAX_PUNTOS_ELIMINATORIA = 5

function esEmpate(golesLocal, golesVisita) {
  return golesLocal === golesVisita
}

// Determina qué equipo avanza dado un resultado y partido (local/visita)
function quienAvanza(partido, resultado) {
  if (resultado.goles_local > resultado.goles_visita) return partido.local
  if (resultado.goles_visita > resultado.goles_local) return partido.visita
  // empate en 90 min -> se decide por penales, usamos el campo 'avanza'
  return resultado.avanza || null
}

// Determina qué equipo predijo el usuario que avanza
function quienPredijoAvanza(partido, pred) {
  if (pred.goles_local_pred > pred.goles_visita_pred) return partido.local
  if (pred.goles_visita_pred > pred.goles_local_pred) return partido.visita
  // predijo empate -> usamos avanza_pred
  return pred.avanza_pred || null
}

/**
 * Calcula los puntos de una predicción de eliminatoria.
 * Devuelve null si el partido no tiene resultado cargado todavía.
 */
export function calcularPuntosEliminatoria(partido, pred, resultado) {
  if (!resultado || resultado.goles_local === null || resultado.goles_local === undefined) return null
  if (!pred || pred.goles_local_pred === null || pred.goles_local_pred === undefined) return 0

  const { goles_local_pred, goles_visita_pred } = pred
  const { goles_local, goles_visita } = resultado

  // 5 pts — marcador exacto en 90 minutos
  if (goles_local_pred === goles_local && goles_visita_pred === goles_visita) {
    return 5
  }

  const avanceReal = quienAvanza(partido, resultado)
  const avancePred = quienPredijoAvanza(partido, pred)
  const acertoAvance = avanceReal && avancePred && avanceReal === avancePred

  // 3 pts — acierta quién avanza Y la diferencia de gol es correcta (en 90 min)
  const diferenciaReal = goles_local - goles_visita
  const diferenciaPred = goles_local_pred - goles_visita_pred
  if (acertoAvance && diferenciaReal === diferenciaPred && !esEmpate(goles_local, goles_visita)) {
    return 3
  }

  // 2 pts — solo acierta quién avanza (incluye vía penales)
  if (acertoAvance) {
    return 2
  }

  // 1 pt — predijo empate en 90 min y el resultado fue empate en 90 min,
  // pero no acertó quién avanza en penales
  if (esEmpate(goles_local_pred, goles_visita_pred) && esEmpate(goles_local, goles_visita)) {
    return 1
  }

  return 0
}

export function labelPuntosEliminatoria(puntos) {
  switch (puntos) {
    case 5: return { texto: '⭐ Exacto', clase: 'puntos-5' }
    case 3: return { texto: '🎯 Avance + diferencia', clase: 'puntos-4' }
    case 2: return { texto: '✅ Avance correcto', clase: 'puntos-3' }
    case 1: return { texto: '〽️ Empate 90′', clase: 'puntos-1' }
    default: return null
  }
}
