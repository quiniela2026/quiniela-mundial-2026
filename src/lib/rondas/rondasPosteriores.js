// src/lib/rondas/rondasPosteriores.js
//
// Lógica de resolución en cascada para octavos, cuartos, semis y final.
// Regla: si existe RESULTADO REAL de un partido, se usa ese resultado.
// Si NO existe resultado real, se usa la PREDICCIÓN del usuario para ese
// partido como insumo para saber quién "avanza" a la siguiente ronda.
//
// Esto permite que el Bracket muestre el camino proyectado de cada usuario
// aunque el partido todavía no se haya jugado.

import { supabase } from '../supabase'

/**
 * Determina quién avanza de un partido dado su resultado (real o predicho).
 * @param {Object} partido - { goles_local, goles_visita, avanza }
 * @returns {'local' | 'visita' | null}
 */
function calcularGanador(partido) {
  if (!partido) return null
  const { goles_local, goles_visita, avanza } = partido

  if (goles_local == null || goles_visita == null) return null

  if (goles_local > goles_visita) return 'local'
  if (goles_visita > goles_local) return 'visita'

  // Empate en 90 min -> se decide por penales, usando el campo "avanza"
  if (goles_local === goles_visita) {
    if (avanza === 'local' || avanza === 'visita') return avanza
    return null // empate sin definir penales todavía
  }

  return null
}

/**
 * Resuelve un partido de una ronda específica para un usuario:
 * primero busca resultado real, si no existe usa la predicción del usuario.
 *
 * @param {string} ronda - 'octavos' | 'cuartos' | 'semis' | 'final'
 * @param {number} partidoId
 * @param {string} userId
 * @returns {Promise<{ ganador: 'local'|'visita'|null, esReal: boolean, datos: Object|null }>}
 */
export async function resolverPartido(ronda, partidoId, userId) {
  const tablaResultados = `resultados_${ronda}`
  const tablaPredicciones = `predicciones_${ronda}`

  // 1. Intentar resultado real
  const { data: resultado, error: errorResultado } = await supabase
    .from(tablaResultados)
    .select('*')
    .eq('id', partidoId)
    .maybeSingle()

  if (errorResultado) {
    console.error(`Error consultando ${tablaResultados}:`, errorResultado)
  }

  if (resultado && resultado.goles_local != null && resultado.goles_visita != null) {
    const ganador = calcularGanador(resultado)
    return { ganador, esReal: true, datos: resultado }
  }

  // 2. No hay resultado real -> usar predicción del usuario
  if (!userId) {
    return { ganador: null, esReal: false, datos: null }
  }

  const { data: prediccion, error: errorPrediccion } = await supabase
    .from(tablaPredicciones)
    .select('*')
    .eq('partido_id', partidoId)
    .eq('user_id', userId)
    .maybeSingle()

  if (errorPrediccion) {
    console.error(`Error consultando ${tablaPredicciones}:`, errorPrediccion)
  }

  if (!prediccion) {
    return { ganador: null, esReal: false, datos: null }
  }

  const ganador = calcularGanador({
    goles_local: prediccion.goles_local_pred,
    goles_visita: prediccion.goles_visita_pred,
    avanza: prediccion.avanza_pred,
  })

  return { ganador, esReal: false, datos: prediccion }
}

/**
 * Carga TODOS los resultados reales y predicciones de un usuario para una ronda,
 * en dos consultas (en vez de una por partido), y devuelve un mapa para resolver
 * rápido en memoria. Más eficiente que llamar resolverPartido() en loop.
 *
 * @param {string} ronda
 * @param {string} userId
 * @returns {Promise<{ resultados: Map, predicciones: Map }>}
 */
export async function cargarDatosRonda(ronda, userId) {
  const tablaResultados = `resultados_${ronda}`
  const tablaPredicciones = `predicciones_${ronda}`

  const [{ data: resultadosData, error: errR }, { data: prediccionesData, error: errP }] =
    await Promise.all([
      supabase.from(tablaResultados).select('*'),
      userId
        ? supabase.from(tablaPredicciones).select('*').eq('user_id', userId)
        : Promise.resolve({ data: [], error: null }),
    ])

  if (errR) console.error(`Error cargando ${tablaResultados}:`, errR)
  if (errP) console.error(`Error cargando ${tablaPredicciones}:`, errP)

  const resultados = new Map()
  ;(resultadosData || []).forEach((r) => resultados.set(r.id, r))

  const predicciones = new Map()
  ;(prediccionesData || []).forEach((p) => predicciones.set(p.partido_id, p))

  return { resultados, predicciones }
}

/**
 * Versión en memoria de resolverPartido, usando los mapas ya cargados.
 * Úsala dentro de un loop para no hacer una consulta por partido.
 *
 * @param {number} partidoId
 * @param {Map} resultados
 * @param {Map} predicciones
 * @returns {{ ganador: 'local'|'visita'|null, esReal: boolean, datos: Object|null }}
 */
export function resolverPartidoEnMemoria(partidoId, resultados, predicciones) {
  const resultado = resultados.get(partidoId)

  if (resultado && resultado.goles_local != null && resultado.goles_visita != null) {
    const ganador = calcularGanador(resultado)
    return { ganador, esReal: true, datos: resultado }
  }

  const prediccion = predicciones.get(partidoId)
  if (!prediccion) {
    return { ganador: null, esReal: false, datos: null }
  }

  const ganador = calcularGanador({
    goles_local: prediccion.goles_local_pred,
    goles_visita: prediccion.goles_visita_pred,
    avanza: prediccion.avanza_pred,
  })

  return { ganador, esReal: false, datos: prediccion }
}

export { calcularGanador }
