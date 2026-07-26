import CryptoJS from 'crypto-js';

/**
 * Procesa transacciones de YAPE y BCP
 * Detecta duplicados y genera reporte de decisiones
 */
export function deduplicarTransacciones(yapeTransacciones, bcpTransacciones, transaccionesExistentes = []) {
  const resultado = {
    nuevas: [],
    duplicados: [],
    posiblesDuplicados: [],
    ignorar: [],
    totalProcessadas: 0,
  };

  // El lote completo, en orden: una fila solo puede ser "repetida" de otra
  // anterior, nunca de una posterior (si no, se descartarían ambas).
  const lote = [...yapeTransacciones, ...bcpTransacciones];

  // Los fingerprints ya guardados se indexan una vez: comparar contra el
  // historial fila por fila es O(n·m) y el historial solo crece.
  const fingerprintsGuardados = new Set(
    transaccionesExistentes.map((t) => t.metadatos?.fingerprint).filter(Boolean)
  );

  lote.forEach((tx, indice) => {
    const decision = clasificarTransaccion(tx, indice, lote, fingerprintsGuardados);
    resultado[decision.tipo].push({ ...tx, decision });
  });

  resultado.totalProcessadas = lote.length;

  return resultado;
}

/**
 * Clasifica una transacción como: nueva, duplicado o posibleDuplicado.
 * `indice` es su posición en `lote`; hace falta para no descartar el original
 * cuando el extracto trae varias filas idénticas.
 */
function clasificarTransaccion(transaccion, indice, lote, fingerprintsGuardados) {
  // 1. Ya importada antes: el fingerprint viaja en los metadatos de la guardada.
  if (fingerprintsGuardados.has(transaccion.fingerprint)) {
    return {
      tipo: 'duplicados',
      motivo: 'en-historial',
      razon: 'Ya la importaste antes',
      confianza: 100,
    };
  }

  // 2. Repetida dentro del propio archivo. Solo se marcan las posteriores:
  //    dos pasajes idénticos el mismo día son dos gastos reales, y descartar
  //    ambos haría desaparecer dinero del balance.
  const primeraIgual = lote.findIndex((t) => t.fingerprint === transaccion.fingerprint);
  if (primeraIgual !== -1 && primeraIgual < indice) {
    return {
      tipo: 'duplicados',
      motivo: 'repetida-en-archivo',
      razon: `Idéntica a otra fila del mismo archivo (#${primeraIgual + 1})`,
      confianza: 60,
    };
  }

  // 3. Mismo movimiento visto por dos bancos (YAPE lo liquida contra BCP).
  const duplicadoProbable = lote.find((t, i) => {
    if (i === indice) return false;
    return (
      esMismaFecha(t.fecha, transaccion.fecha, 1) &&
      esMontSimilar(t.monto, transaccion.monto, 0.5) &&
      esYAPEvsBC(transaccion, t)
    );
  });

  if (duplicadoProbable) {
    return {
      tipo: 'posiblesDuplicados',
      motivo: 'yape-vs-bcp',
      razon: 'Mismo movimiento en YAPE y BCP (misma fecha y monto)',
      duplicadoWith: duplicadoProbable.id,
      confianza: 85,
    };
  }

  return {
    tipo: 'nuevas',
    motivo: 'nueva',
    razon: 'Nueva transacción',
    confianza: 100,
  };
}

/**
 * Verifica si es YAPE vs BCP (más probable duplicado)
 */
function esYAPEvsBC(tx1, tx2) {
  const sonDiferentesFuentes = (tx1.fuente === 'YAPE' && tx2.fuente === 'BCP') ||
                                (tx1.fuente === 'BCP' && tx2.fuente === 'YAPE');
  return sonDiferentesFuentes;
}

/**
 * Compara si dos fechas son iguales (con tolerancia en días)
 */
function esMismaFecha(fecha1, fecha2, tolerancia = 0) {
  const d1 = new Date(fecha1);
  const d2 = new Date(fecha2);

  const diff = Math.abs(d1.getTime() - d2.getTime());
  const diasDiff = diff / (1000 * 60 * 60 * 24);

  return diasDiff <= tolerancia;
}

/**
 * Compara si dos montos son similares (con tolerancia)
 */
function esMontSimilar(monto1, monto2, tolerancia = 0) {
  const diff = Math.abs(monto1 - monto2);
  return diff <= tolerancia;
}

/**
 * Genera reporte visual para mostrar al usuario
 */
export function generarReporteDeduplicacion(resultado) {
  return {
    resumen: {
      totalProcessadas: resultado.totalProcessadas,
      nuevas: resultado.nuevas.length,
      duplicados: resultado.duplicados.length,
      posiblesDuplicados: resultado.posiblesDuplicados.length,
    },
    detalles: {
      nuevas: resultado.nuevas.map((t) => ({
        id: t.id,
        fuente: t.fuente,
        fecha: t.fecha,
        monto: t.monto,
        descripcion: t.descripcion || t.mensaje,
        categor: t.tipoTransaccion,
      })),
      posiblesDuplicados: resultado.posiblesDuplicados.map((t) => ({
        id: t.id,
        fuente: t.fuente,
        fecha: t.fecha,
        monto: t.monto,
        descripcion: t.descripcion || t.mensaje,
        duplicadoCon: t.decision.duplicadoWith,
        confianza: t.decision.confianza,
      })),
      duplicados: resultado.duplicados.map((t) => ({
        id: t.id,
        razon: t.decision.razon,
        duplicadoCon: t.decision.duplicadoWith || 'N/A',
      })),
    },
  };
}

/**
 * Resolve la decisión del usuario sobre duplicados
 * decision: { id, accion: "importar-yape" | "importar-bcp" | "importar-ambos" | "ignorar" }
 */
export function aplicarDecisionesDuplicados(resultado, decisiones) {
  const resultadoFinal = {
    paraImportar: [],
    ignorados: [],
    errores: [],
  };

  // Agregar todas las nuevas
  resultadoFinal.paraImportar.push(...resultado.nuevas);

  // Procesar decisiones de duplicados
  decisiones.forEach((decision) => {
    const tx = resultado.posiblesDuplicados.find((t) => t.id === decision.id);
    if (!tx) return;

    switch (decision.accion) {
      case 'importar-yape':
        if (tx.fuente === 'YAPE') {
          resultadoFinal.paraImportar.push(tx);
        }
        break;
      case 'importar-bcp':
        if (tx.fuente === 'BCP') {
          resultadoFinal.paraImportar.push(tx);
        }
        break;
      case 'importar-ambos':
        resultadoFinal.paraImportar.push(tx);
        break;
      case 'ignorar':
        resultadoFinal.ignorados.push(tx.id);
        break;
      default:
        resultadoFinal.ignorados.push(tx.id);
    }
  });

  return resultadoFinal;
}
