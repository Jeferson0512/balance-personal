-- =============================================================================
-- BALANCE — Esquema de base de datos
--
-- Dialecto: PostgreSQL. Portable a MySQL cambiando JSONB por JSON, TEXT[] por
-- JSON y las funciones de fecha.
--
-- Principio rector: PARTIDA DOBLE REAL. Un asiento no existe si sus
-- movimientos no suman cero. La restricción no es documental, se valida con
-- un trigger: es lo que permitió detectar S/1,910 mal clasificados en la
-- migración desde Money Manager, error que un modelo de partida simple
-- (una fila = un movimiento) nunca habría hecho visible.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Usuario y configuración
-- -----------------------------------------------------------------------------

CREATE TABLE usuario (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           TEXT NOT NULL UNIQUE,
    nombre          TEXT NOT NULL,

    -- El nombre del titular no es decorativo: es lo que permite distinguir un
    -- traspaso entre cuentas propias de un ingreso real. Sin él, mover dinero
    -- del PLIN propio al YAPE propio infla los ingresos.
    nombre_titular  TEXT,
    alias_titular   TEXT[] DEFAULT '{}',

    moneda_base     CHAR(3) NOT NULL DEFAULT 'PEN',
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- -----------------------------------------------------------------------------
-- Plan de cuentas
-- -----------------------------------------------------------------------------

-- Naturaleza contable: decide el signo con el que crece la cuenta.
CREATE TYPE tipo_cuenta AS ENUM ('activo', 'pasivo', 'patrimonio', 'ingreso', 'gasto');

-- Qué es la cuenta en el mundo real. Dimensión ORTOGONAL al tipo contable:
-- "YAPE" y "Tyba" son ambos activo, pero uno es dinero disponible hoy y el
-- otro está invertido. Sin esta separación no se puede responder
-- "¿cuánto tengo disponible?" frente a "¿cuánto invertido?".
CREATE TYPE tipo_instrumento AS ENUM (
    'efectivo', 'cuenta_bancaria', 'billetera', 'tarjeta_debito',
    'ahorros', 'inversion', 'tarjeta_credito', 'prestamo', 'otros'
);

CREATE TABLE cuenta (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario   UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,

    -- Clave estable legible ('a-yape', 'g-comida'). Permite que los datos
    -- semilla y los importadores referencien cuentas sin conocer el UUID.
    clave        TEXT NOT NULL,
    nombre       TEXT NOT NULL,
    tipo         tipo_cuenta NOT NULL,

    -- Solo para cuentas de dinero (activo/pasivo); NULL en categorías.
    instrumento  tipo_instrumento,

    -- Jerarquía: "Renta" cuelga de "Vivienda". Profundidad libre.
    id_padre     UUID REFERENCES cuenta(id) ON DELETE RESTRICT,

    -- Las cuentas cerradas conservan su historial pero desaparecen de los
    -- selectores. Borrarlas dejaría movimientos apuntando a la nada.
    activa       BOOLEAN NOT NULL DEFAULT true,

    creado_en    TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (id_usuario, clave),
    -- Un instrumento solo tiene sentido donde vive el dinero.
    CONSTRAINT instrumento_solo_en_cuentas_de_dinero CHECK (
        (tipo IN ('activo', 'pasivo') AND instrumento IS NOT NULL)
        OR (tipo NOT IN ('activo', 'pasivo') AND instrumento IS NULL)
    )
);

CREATE INDEX idx_cuenta_usuario ON cuenta (id_usuario) WHERE activa;
CREATE INDEX idx_cuenta_padre   ON cuenta (id_padre);


-- -----------------------------------------------------------------------------
-- Transacciones y movimientos
-- -----------------------------------------------------------------------------

CREATE TYPE tipo_contraparte AS ENUM (
    'persona', 'servicio', 'comercio', 'propia', 'retiro', 'recarga', 'desconocido'
);

CREATE TABLE transaccion (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario    UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,

    fecha         TIMESTAMPTZ NOT NULL,
    descripcion   TEXT NOT NULL,

    -- Con quién se movió el dinero. Es campo propio y no una cuenta del plan
    -- contable a propósito: con ~66 contrapartes distintas (46 de una sola
    -- aparición) el plan de cuentas se volvería inmanejable.
    contraparte_nombre     TEXT,
    contraparte_tipo       tipo_contraparte,
    contraparte_direccion  TEXT CHECK (contraparte_direccion IN ('enviado', 'recibido')),
    contraparte_institucion TEXT,

    -- Borrado lógico: nada se destruye. Un borrado accidental de 129
    -- movimientos importados no puede ser irreversible.
    eliminada_en      TIMESTAMPTZ,
    eliminada_motivo  TEXT,

    -- Saldo de apertura: cuánto había en la cuenta antes del primer
    -- movimiento registrado. Un extracto trae movimientos, nunca el punto de
    -- partida, así que sin esto una cuenta con historia previa queda en
    -- negativo (Efectivo salía en -S/2.532 solo por eso).
    -- Se modela como transacción y no como columna de `cuenta` para que entre
    -- en el balance, respete la partida doble y se pueda corregir o borrar.
    apertura_de_cuenta UUID REFERENCES cuenta(id) ON DELETE CASCADE,

    creado_en     TIMESTAMPTZ NOT NULL DEFAULT now(),
    creado_por    TEXT NOT NULL DEFAULT 'manual'  -- manual | import | recurrencia | cuota | apertura
);

-- Una cuenta tiene como mucho una apertura: refijarla sustituye, no acumula.
CREATE UNIQUE INDEX idx_tx_apertura_unica ON transaccion (apertura_de_cuenta)
    WHERE apertura_de_cuenta IS NOT NULL AND eliminada_en IS NULL;

CREATE INDEX idx_tx_usuario_fecha ON transaccion (id_usuario, fecha DESC)
    WHERE eliminada_en IS NULL;
CREATE INDEX idx_tx_contraparte   ON transaccion (id_usuario, contraparte_nombre)
    WHERE eliminada_en IS NULL;
CREATE INDEX idx_tx_eliminadas    ON transaccion (id_usuario, eliminada_en)
    WHERE eliminada_en IS NOT NULL;


CREATE TABLE movimiento (
    id             BIGSERIAL PRIMARY KEY,
    id_transaccion UUID NOT NULL REFERENCES transaccion(id) ON DELETE CASCADE,
    id_cuenta      UUID NOT NULL REFERENCES cuenta(id) ON DELETE RESTRICT,

    -- Convención interna (el usuario NUNCA la ve): débito = +, crédito = −.
    -- NUMERIC y no float: en dinero, 0.1 + 0.2 != 0.3 es inaceptable.
    monto          NUMERIC(14,2) NOT NULL CHECK (monto <> 0),

    -- Nombre de la cuenta EN EL MOMENTO del registro. Si mañana renombras
    -- "Comida" a "Alimentación", el histórico recuerda cómo se llamaba.
    -- El cálculo siempre usa id_cuenta, nunca este texto.
    nombre_cuenta  TEXT NOT NULL
);

CREATE INDEX idx_mov_transaccion ON movimiento (id_transaccion);
CREATE INDEX idx_mov_cuenta      ON movimiento (id_cuenta);


-- -----------------------------------------------------------------------------
-- Invariante de partida doble
-- -----------------------------------------------------------------------------

-- Sin este trigger, la partida doble es una convención que el primer bug
-- rompe en silencio. Con él, es imposible guardar un asiento descuadrado.
CREATE OR REPLACE FUNCTION validar_cuadre() RETURNS TRIGGER AS $$
DECLARE
    v_tx    UUID := COALESCE(NEW.id_transaccion, OLD.id_transaccion);
    v_suma  NUMERIC(14,2);
    v_n     INT;
BEGIN
    SELECT COALESCE(SUM(monto), 0), COUNT(*) INTO v_suma, v_n
    FROM movimiento WHERE id_transaccion = v_tx;

    -- Una transacción a medio construir (0 movimientos) es válida durante la
    -- inserción; el cuadre se exige en cuanto hay al menos uno.
    IF v_n > 0 AND ABS(v_suma) > 0.005 THEN
        RAISE EXCEPTION 'Asiento descuadrado en %: los movimientos suman %, deben sumar 0', v_tx, v_suma;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER trg_cuadre
    AFTER INSERT OR UPDATE OR DELETE ON movimiento
    DEFERRABLE INITIALLY DEFERRED   -- se comprueba al COMMIT, no fila a fila
    FOR EACH ROW EXECUTE FUNCTION validar_cuadre();


-- -----------------------------------------------------------------------------
-- Trazabilidad de importaciones
-- -----------------------------------------------------------------------------

CREATE TABLE importacion (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario    UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    fuente        TEXT NOT NULL,          -- YAPE | BCP | MoneyManager
    archivo       TEXT,
    importado_en  TIMESTAMPTZ NOT NULL DEFAULT now(),
    total         INT NOT NULL DEFAULT 0
);

CREATE TABLE transaccion_origen (
    id_transaccion UUID PRIMARY KEY REFERENCES transaccion(id) ON DELETE CASCADE,
    id_importacion UUID REFERENCES importacion(id) ON DELETE SET NULL,
    fuente         TEXT NOT NULL,

    -- Huella para deduplicar. Comparar por monto+fecha NO funciona: se
    -- probó y falló porque una transacción guardada no tiene "monto", tiene
    -- movimientos. Reimportar el mismo archivo duplicaba todo el historial.
    fingerprint    TEXT NOT NULL,

    -- Crudo del extracto, para poder re-derivar cualquier cosa (categoría,
    -- contraparte) sin volver a pedir el archivo al usuario.
    crudo          JSONB NOT NULL DEFAULT '{}'
);

-- Un mismo movimiento no puede entrar dos veces para el mismo usuario.
CREATE UNIQUE INDEX idx_origen_fingerprint
    ON transaccion_origen (fingerprint, (crudo->>'id_usuario'));
CREATE INDEX idx_origen_importacion ON transaccion_origen (id_importacion);


-- -----------------------------------------------------------------------------
-- Compras en cuotas y comisiones
-- -----------------------------------------------------------------------------

-- En Perú una compra a 12 meses no es un gasto de S/1,200 hoy: es una deuda
-- en 12 tramos. Registrarla entera distorsiona el mes de la compra y deja
-- invisibles los 11 siguientes.
CREATE TABLE compra_financiada (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario   UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    descripcion  TEXT NOT NULL,
    monto_total  NUMERIC(14,2) NOT NULL CHECK (monto_total > 0),
    cuotas       INT NOT NULL CHECK (cuotas >= 2),
    fecha_compra DATE NOT NULL,
    id_cuenta_financia UUID NOT NULL REFERENCES cuenta(id)
);

ALTER TABLE transaccion
    ADD COLUMN id_compra_financiada UUID REFERENCES compra_financiada(id) ON DELETE CASCADE,
    ADD COLUMN numero_cuota INT,
    -- El ITF va ligado al movimiento que lo generó: sumarlo al importe de la
    -- compra falsearía cuánto costó realmente lo comprado.
    ADD COLUMN id_transaccion_origen_comision UUID REFERENCES transaccion(id) ON DELETE CASCADE;

CREATE INDEX idx_tx_cuotas ON transaccion (id_compra_financiada) WHERE id_compra_financiada IS NOT NULL;


-- -----------------------------------------------------------------------------
-- Etiquetas, presupuestos y recurrencias
-- -----------------------------------------------------------------------------

CREATE TABLE etiqueta (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario  UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    nombre      TEXT NOT NULL,
    color       TEXT NOT NULL DEFAULT 'blue',
    UNIQUE (id_usuario, nombre)
);

-- Transversal: una etiqueta cruza categorías ("Viaje 2026" toca comida,
-- transporte y hotel a la vez).
CREATE TABLE transaccion_etiqueta (
    id_transaccion UUID REFERENCES transaccion(id) ON DELETE CASCADE,
    id_etiqueta    UUID REFERENCES etiqueta(id) ON DELETE CASCADE,
    PRIMARY KEY (id_transaccion, id_etiqueta)
);

CREATE TABLE presupuesto (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario  UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    id_cuenta   UUID NOT NULL REFERENCES cuenta(id) ON DELETE CASCADE,
    limite      NUMERIC(14,2) NOT NULL CHECK (limite > 0),
    periodo     TEXT NOT NULL DEFAULT 'mensual',
    UNIQUE (id_usuario, id_cuenta, periodo)
);

CREATE TABLE recurrencia (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario    UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    nombre        TEXT NOT NULL,
    monto         NUMERIC(14,2) NOT NULL,
    frecuencia    TEXT NOT NULL DEFAULT 'mensual',
    dia_del_mes   INT CHECK (dia_del_mes BETWEEN 1 AND 31),
    id_cuenta_categoria UUID NOT NULL REFERENCES cuenta(id),
    id_cuenta_fondos    UUID NOT NULL REFERENCES cuenta(id),
    activa        BOOLEAN NOT NULL DEFAULT true,
    ultima_aplicada DATE
);

-- Reglas de categorización que el usuario puede ver y editar. La app adivina
-- por palabras clave, pero debe poder corregirse y aprender de la corrección.
CREATE TABLE regla_categorizacion (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario  UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    campo       TEXT NOT NULL,   -- contraparte | descripcion | institucion
    operador    TEXT NOT NULL DEFAULT 'contiene',
    valor       TEXT NOT NULL,
    id_cuenta_destino UUID NOT NULL REFERENCES cuenta(id) ON DELETE CASCADE,
    prioridad   INT NOT NULL DEFAULT 100,
    activa      BOOLEAN NOT NULL DEFAULT true
);


-- -----------------------------------------------------------------------------
-- Vistas de consulta
-- -----------------------------------------------------------------------------

-- Saldo por cuenta. El signo mostrado depende del lado normal: activo y gasto
-- crecen por débito (+); pasivo, patrimonio e ingreso por crédito (−).
CREATE VIEW v_saldo_cuenta AS
SELECT
    c.id_usuario,
    c.id            AS id_cuenta,
    c.clave,
    c.nombre,
    c.tipo,
    c.instrumento,
    COALESCE(SUM(m.monto), 0) AS saldo_crudo,
    CASE WHEN c.tipo IN ('activo', 'gasto')
         THEN COALESCE(SUM(m.monto), 0)
         ELSE -COALESCE(SUM(m.monto), 0)
    END AS saldo_mostrado
FROM cuenta c
LEFT JOIN movimiento m  ON m.id_cuenta = c.id
LEFT JOIN transaccion t ON t.id = m.id_transaccion AND t.eliminada_en IS NULL
GROUP BY c.id_usuario, c.id, c.clave, c.nombre, c.tipo, c.instrumento;


-- Liquidez: no es lo mismo tener S/2,000 en YAPE que en Tyba.
CREATE VIEW v_liquidez AS
SELECT
    id_usuario,
    SUM(saldo_mostrado) FILTER (
        WHERE instrumento IN ('efectivo','cuenta_bancaria','billetera','tarjeta_debito')
    ) AS disponible,
    SUM(saldo_mostrado) FILTER (
        WHERE instrumento IN ('ahorros','inversion')
    ) AS invertido,
    SUM(saldo_mostrado) FILTER (WHERE tipo = 'pasivo') AS pasivos
FROM v_saldo_cuenta
WHERE tipo IN ('activo','pasivo')
GROUP BY id_usuario;


-- Flujo por periodo. date_trunc admite 'day','week','month','year': los
-- mismos periodos que ofrece el dashboard.
CREATE VIEW v_flujo_mensual AS
SELECT
    t.id_usuario,
    date_trunc('month', t.fecha) AS periodo,
    SUM(m.monto) FILTER (WHERE c.tipo = 'ingreso') * -1 AS ingresos,
    SUM(m.monto) FILTER (WHERE c.tipo = 'gasto')       AS gastos
FROM transaccion t
JOIN movimiento m ON m.id_transaccion = t.id
JOIN cuenta c     ON c.id = m.id_cuenta
WHERE t.eliminada_en IS NULL
GROUP BY t.id_usuario, date_trunc('month', t.fecha);


-- Con quién se mueve el dinero. Excluye los traspasos entre cuentas propias:
-- contarlos como ingreso infló los totales un 25% en los datos reales.
CREATE VIEW v_contrapartes AS
SELECT
    t.id_usuario,
    t.contraparte_nombre AS nombre,
    t.contraparte_tipo   AS tipo,
    COUNT(*)             AS movimientos,
    SUM(ABS(m.monto)) FILTER (WHERE t.contraparte_direccion = 'enviado')  AS enviado,
    SUM(ABS(m.monto)) FILTER (WHERE t.contraparte_direccion = 'recibido') AS recibido
FROM transaccion t
JOIN LATERAL (
    SELECT monto FROM movimiento WHERE id_transaccion = t.id ORDER BY id LIMIT 1
) m ON true
WHERE t.eliminada_en IS NULL
  AND t.contraparte_nombre IS NOT NULL
  AND t.contraparte_tipo <> 'propia'
GROUP BY t.id_usuario, t.contraparte_nombre, t.contraparte_tipo;
