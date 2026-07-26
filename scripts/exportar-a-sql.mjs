#!/usr/bin/env node
/* Exporta los datos de la app a sentencias SQL del esquema de
   docs/06-esquema-base-datos.sql.

   Sirve para la migración de localStorage a base de datos: genera un .sql
   listo para `psql -f`. Las claves legibles ('a-yape', 'g-comida') se
   resuelven a UUID con una CTE, así que el volcado no depende de que los
   UUID se generen fuera.

   Uso:
     node scripts/exportar-a-sql.mjs                 # usa src/datos/historico.js
     node scripts/exportar-a-sql.mjs datos.json      # usa un volcado del navegador
     node scripts/exportar-a-sql.mjs > balance.sql

   Para exportar lo que tengas en el navegador, en la consola de la app:
     copy(JSON.stringify({
       cuentas: JSON.parse(localStorage.balance_cuentas),
       transacciones: JSON.parse(localStorage.balance_transacciones)
     }))
*/

import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";

const AQUI = dirname(fileURLToPath(import.meta.url));

const INSTRUMENTOS_SQL = {
  efectivo: "efectivo",
  "cuenta-bancaria": "cuenta_bancaria",
  billetera: "billetera",
  "tarjeta-debito": "tarjeta_debito",
  ahorros: "ahorros",
  inversion: "inversion",
  "tarjeta-credito": "tarjeta_credito",
  prestamo: "prestamo",
  otros: "otros",
};

/** Comilla simple duplicada: es el escapado de literales de SQL estándar. */
const q = (v) =>
  v === null || v === undefined || v === "" ? "NULL" : `'${String(v).replace(/'/g, "''")}'`;

const num = (v) => (Number.isFinite(Number(v)) ? Number(v).toFixed(2) : "0.00");

function inferirInstrumento(cuenta) {
  if (cuenta.instrumento) return cuenta.instrumento;
  const n = String(cuenta.nombre || "").toLowerCase();
  if (cuenta.tipo === "pasivo") return n.includes("prest") ? "prestamo" : "tarjeta-credito";
  if (n.includes("efectivo")) return "efectivo";
  if (/yape|plin|efectybank/.test(n)) return "billetera";
  if (/tyba|ward|agora|inversion/.test(n)) return "inversion";
  if (/ahorro|chanchito/.test(n)) return "ahorros";
  if (cuenta.tipo === "activo") return "cuenta-bancaria";
  return null;
}

async function cargarDatos(rutaJson) {
  if (rutaJson) {
    const json = JSON.parse(readFileSync(rutaJson, "utf8"));
    return { cuentas: json.cuentas ?? [], transacciones: json.transacciones ?? [] };
  }
  // En Windows, import() dinámico exige una URL file:// y no una ruta suelta.
  const url = (rel) => pathToFileURL(resolve(AQUI, rel)).href;
  const semillas = await import(url("../src/datos/semillas.js"));
  const historico = await import(url("../src/datos/historico.js"));
  return {
    cuentas: [...semillas.CUENTAS_DEFAULT, ...historico.CATEGORIAS_HISTORICO],
    transacciones: historico.TX_HISTORICO,
  };
}

function generar({ cuentas, transacciones }) {
  const L = [];
  const p = (s = "") => L.push(s);

  p("-- Volcado generado por scripts/exportar-a-sql.mjs");
  p(`-- ${transacciones.length} transacciones, ${cuentas.length} cuentas`);
  p("-- Ejecutar sobre el esquema de docs/06-esquema-base-datos.sql");
  p();
  p("BEGIN;");
  p();
  p("-- El cuadre se comprueba al COMMIT, no fila a fila: durante la carga hay");
  p("-- instantes con un solo movimiento insertado.");
  p("SET CONSTRAINTS ALL DEFERRED;");
  p();

  p("INSERT INTO usuario (id, email, nombre, nombre_titular, moneda_base) VALUES");
  p("  ('00000000-0000-0000-0000-000000000001', 'titular@balance.local', 'Titular', NULL, 'PEN')");
  p("ON CONFLICT (email) DO NOTHING;");
  p();

  // Padres antes que hijos: una subcuenta necesita que su padre exista.
  const ordenadas = [...cuentas].sort((a, b) => (a.idPadre ? 1 : 0) - (b.idPadre ? 1 : 0));

  p("-- Plan de cuentas -----------------------------------------------------------");
  for (const c of ordenadas) {
    const esDinero = c.tipo === "activo" || c.tipo === "pasivo";
    const inst = esDinero ? INSTRUMENTOS_SQL[inferirInstrumento(c)] ?? "otros" : null;
    const padre = c.idPadre
      ? `(SELECT id FROM cuenta WHERE clave = ${q(c.idPadre)} AND id_usuario = u.id)`
      : "NULL";

    p(
      `INSERT INTO cuenta (id_usuario, clave, nombre, tipo, instrumento, id_padre, activa)\n` +
        `SELECT u.id, ${q(c.id)}, ${q(c.nombre)}, ${q(c.tipo)}::tipo_cuenta, ` +
        `${inst ? `${q(inst)}::tipo_instrumento` : "NULL"}, ${padre}, ${c.activa === false ? "false" : "true"}\n` +
        `FROM usuario u WHERE u.email = 'titular@balance.local'\n` +
        `ON CONFLICT (id_usuario, clave) DO NOTHING;`
    );
  }
  p();

  p("-- Transacciones -------------------------------------------------------------");
  for (const t of transacciones) {
    const cp = t.contraparte ?? {};
    p(
      `WITH u AS (SELECT id FROM usuario WHERE email = 'titular@balance.local'),\n` +
        `tx AS (\n` +
        `  INSERT INTO transaccion (id_usuario, fecha, descripcion, contraparte_nombre,\n` +
        `                           contraparte_tipo, contraparte_direccion, contraparte_institucion,\n` +
        `                           eliminada_en, creado_por)\n` +
        `  SELECT u.id, ${q(t.fecha)}::timestamptz, ${q(t.descripcion)}, ${q(cp.nombre)},\n` +
        `         ${cp.tipo ? `${q(cp.tipo)}::tipo_contraparte` : "NULL"}, ${q(cp.direccion)}, ${q(cp.institucion)},\n` +
        `         ${t.eliminada ? `${q(t.eliminada.fecha)}::timestamptz` : "NULL"}, ${q(t.metadatos?.fuente ? "import" : "manual")}\n` +
        `  FROM u RETURNING id\n` +
        `)`
    );

    const movs = (t.movimientos ?? [])
      .map(
        (m) =>
          `  SELECT tx.id, (SELECT id FROM cuenta WHERE clave = ${q(m.idCuenta)} ` +
          `AND id_usuario = (SELECT id FROM usuario WHERE email = 'titular@balance.local')), ` +
          `${num(m.monto)}, ${q(m.nombreCuenta ?? m.idCuenta)} FROM tx`
      )
      .join("\n  UNION ALL\n");

    p(`INSERT INTO movimiento (id_transaccion, id_cuenta, monto, nombre_cuenta)\n${movs};`);

    if (t.metadatos?.fingerprint) {
      p(
        `INSERT INTO transaccion_origen (id_transaccion, fuente, fingerprint, crudo)\n` +
          `SELECT id, ${q(t.metadatos.fuente)}, ${q(t.metadatos.fingerprint)}, ${q(
            JSON.stringify(t.metadatos)
          )}::jsonb\n` +
          `FROM transaccion WHERE fecha = ${q(t.fecha)}::timestamptz AND descripcion = ${q(
            t.descripcion
          )}\n` +
          `ON CONFLICT DO NOTHING;`
      );
    }
    p();
  }

  p("COMMIT;");
  p();
  p("-- Comprobación: debe devolver 0 filas.");
  p("-- SELECT id_transaccion, SUM(monto) FROM movimiento");
  p("-- GROUP BY id_transaccion HAVING ABS(SUM(monto)) > 0.005;");

  return L.join("\n");
}

const datos = await cargarDatos(process.argv[2]);
const sql = generar(datos);

// Resumen por stderr para no ensuciar el .sql cuando se redirige la salida.
console.error(
  `Generado: ${datos.transacciones.length} transacciones, ${datos.cuentas.length} cuentas`
);
process.stdout.write(sql);
