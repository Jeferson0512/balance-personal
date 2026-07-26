/* Histórico real de mayo 2024 a enero 2025, migrado desde Money Manager.

   Se guarda en el repo para no depender del Excel exportado: es el punto de
   partida de la app y lo que se ve al abrirla sin datos guardados.
   Generado desde "Registro Contable_26-7-2026.xlsx" — no editar a mano. */

export const CATEGORIAS_HISTORICO = [
  {
    "id": "g-mm-comida",
    "nombre": "🍜 Comida",
    "tipo": "gasto",
    "idPadre": null,
    "activa": true
  },
  {
    "id": "g-mm-deudas",
    "nombre": "📉 Deudas",
    "tipo": "gasto",
    "idPadre": null,
    "activa": true
  },
  {
    "id": "g-mm-fuxion",
    "nombre": "📈 Fuxion",
    "tipo": "gasto",
    "idPadre": null,
    "activa": true
  },
  {
    "id": "g-mm-hotel",
    "nombre": "🏩 Hotel",
    "tipo": "gasto",
    "idPadre": null,
    "activa": true
  },
  {
    "id": "g-mm-otros",
    "nombre": "Otros",
    "tipo": "gasto",
    "idPadre": null,
    "activa": true
  },
  {
    "id": "g-mm-pasajes",
    "nombre": "🪙 Pasajes",
    "tipo": "gasto",
    "idPadre": null,
    "activa": true
  },
  {
    "id": "g-mm-regalos",
    "nombre": "🎁 Regalos",
    "tipo": "gasto",
    "idPadre": null,
    "activa": true
  },
  {
    "id": "g-mm-transporte",
    "nombre": "🚖 Transporte",
    "tipo": "gasto",
    "idPadre": null,
    "activa": true
  },
  {
    "id": "i-mm-dinero-extra",
    "nombre": "💵 Dinero extra",
    "tipo": "ingreso",
    "idPadre": null,
    "activa": true
  },
  {
    "id": "i-mm-dinero-prestado",
    "nombre": "Dinero Prestado 😫😩",
    "tipo": "ingreso",
    "idPadre": null,
    "activa": true
  },
  {
    "id": "i-mm-fuxion",
    "nombre": "🌐 Fuxion",
    "tipo": "ingreso",
    "idPadre": null,
    "activa": true
  },
  {
    "id": "i-mm-madre",
    "nombre": "🙎Madre",
    "tipo": "ingreso",
    "idPadre": null,
    "activa": true
  },
  {
    "id": "i-mm-modificar-saldo",
    "nombre": "Modificar saldo",
    "tipo": "ingreso",
    "idPadre": null,
    "activa": true
  },
  {
    "id": "i-mm-otro",
    "nombre": "Otro",
    "tipo": "ingreso",
    "idPadre": null,
    "activa": true
  },
  {
    "id": "g-mm-comida-almuerzo-diana",
    "nombre": "Almuerzo Diana",
    "tipo": "gasto",
    "idPadre": "g-mm-comida",
    "activa": true
  },
  {
    "id": "g-mm-comida-almuerzo-jeferson",
    "nombre": "Almuerzo Jeferson",
    "tipo": "gasto",
    "idPadre": "g-mm-comida",
    "activa": true
  },
  {
    "id": "g-mm-comida-cena",
    "nombre": "Cena",
    "tipo": "gasto",
    "idPadre": "g-mm-comida",
    "activa": true
  },
  {
    "id": "g-mm-comida-cena-diana",
    "nombre": "Cena Diana",
    "tipo": "gasto",
    "idPadre": "g-mm-comida",
    "activa": true
  },
  {
    "id": "g-mm-comida-cena-jeferson",
    "nombre": "Cena Jeferson",
    "tipo": "gasto",
    "idPadre": "g-mm-comida",
    "activa": true
  },
  {
    "id": "g-mm-deudas-credito-interbank",
    "nombre": "Crédito Interbank",
    "tipo": "gasto",
    "idPadre": "g-mm-deudas",
    "activa": true
  },
  {
    "id": "g-mm-fuxion-entrada-evento",
    "nombre": "Entrada Evento",
    "tipo": "gasto",
    "idPadre": "g-mm-fuxion",
    "activa": true
  },
  {
    "id": "g-mm-fuxion-productos-del-evento",
    "nombre": "Productos del Evento",
    "tipo": "gasto",
    "idPadre": "g-mm-fuxion",
    "activa": true
  },
  {
    "id": "g-mm-fuxion-productos-para-cliente",
    "nombre": "Productos para Cliente",
    "tipo": "gasto",
    "idPadre": "g-mm-fuxion",
    "activa": true
  },
  {
    "id": "g-mm-hotel-deli",
    "nombre": "🥵 Deli",
    "tipo": "gasto",
    "idPadre": "g-mm-hotel",
    "activa": true
  },
  {
    "id": "g-mm-pasajes-pasaje-ida-con-compania",
    "nombre": "Pasaje ida con compañía",
    "tipo": "gasto",
    "idPadre": "g-mm-pasajes",
    "activa": true
  },
  {
    "id": "g-mm-pasajes-pasaje-ida-jyd",
    "nombre": "Pasaje Ida JyD",
    "tipo": "gasto",
    "idPadre": "g-mm-pasajes",
    "activa": true
  },
  {
    "id": "g-mm-pasajes-pasaje-ida-solo",
    "nombre": "Pasaje Ida Solo",
    "tipo": "gasto",
    "idPadre": "g-mm-pasajes",
    "activa": true
  },
  {
    "id": "g-mm-pasajes-pasaje-vuelta-con-compania",
    "nombre": "Pasaje vuelta con compañia",
    "tipo": "gasto",
    "idPadre": "g-mm-pasajes",
    "activa": true
  },
  {
    "id": "g-mm-pasajes-pasaje-vuelta-solo",
    "nombre": "Pasaje Vuelta Solo",
    "tipo": "gasto",
    "idPadre": "g-mm-pasajes",
    "activa": true
  },
  {
    "id": "g-mm-transporte-autobus",
    "nombre": "Autobús",
    "tipo": "gasto",
    "idPadre": "g-mm-transporte",
    "activa": true
  },
  {
    "id": "i-mm-dinero-extra-tienda-agarre",
    "nombre": "Tienda Agarre",
    "tipo": "ingreso",
    "idPadre": "i-mm-dinero-extra",
    "activa": true
  },
  {
    "id": "i-mm-fuxion-venta-de-producto",
    "nombre": "Venta de Producto",
    "tipo": "ingreso",
    "idPadre": "i-mm-fuxion",
    "activa": true
  },
  {
    "id": "i-mm-madre-yape",
    "nombre": "Yape",
    "tipo": "ingreso",
    "idPadre": "i-mm-madre",
    "activa": true
  }
];

export const TX_HISTORICO = [
  {
    "id": "tx-mm-681e0f203816",
    "fecha": "2024-05-01T12:57:59.000Z",
    "descripcion": "Se gasto todo y se debe de pagar",
    "movimientos": [
      {
        "idCuenta": "g-mm-otros",
        "monto": 700.0,
        "nombreCuenta": "Otros"
      },
      {
        "idCuenta": "p-tarjeta",
        "monto": -700.0,
        "nombreCuenta": "Tarjeta de crédito"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "681e0f203816de3bab34412b1aa284638573460bfdf380d657f68b6e32855b87",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "Otros",
      "subcategoria": null,
      "detalle": null,
      "cuentaOriginal": "Tarjetas de crédito Interbank"
    }
  },
  {
    "id": "tx-mm-f74bf1f05e7a",
    "fecha": "2024-09-13T12:50:34.000Z",
    "descripcion": "Ingresos",
    "movimientos": [
      {
        "idCuenta": "p-tarjeta",
        "monto": 700.0,
        "nombreCuenta": "Tarjeta de crédito"
      },
      {
        "idCuenta": "pt-inicial",
        "monto": -700.0,
        "nombreCuenta": "Saldo inicial"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "f74bf1f05e7a6ce5910af90d0c9b8d53dc66e4c784e866732b7cb9a2a686a052",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "Modificar saldo",
      "subcategoria": null,
      "detalle": null,
      "cuentaOriginal": "Tarjetas de crédito Interbank"
    }
  },
  {
    "id": "tx-mm-cbb2c4730736",
    "fecha": "2024-09-13T12:54:18.000Z",
    "descripcion": "Ya se tenia",
    "movimientos": [
      {
        "idCuenta": "a-banco",
        "monto": 7.61,
        "nombreCuenta": "BCP"
      },
      {
        "idCuenta": "i-mm-otro",
        "monto": -7.61,
        "nombreCuenta": "Otro"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "cbb2c47307369577bc7807c35ec3096617e5deb31050b2eb2f80a3cafb193622",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "Otro",
      "subcategoria": null,
      "detalle": null,
      "cuentaOriginal": "BCP"
    }
  },
  {
    "id": "tx-mm-413c59de7be6",
    "fecha": "2024-09-13T12:54:48.000Z",
    "descripcion": "Diana en yapeo de BBVA de lo que le preste 100",
    "movimientos": [
      {
        "idCuenta": "a-yape",
        "monto": 100.0,
        "nombreCuenta": "YAPE"
      },
      {
        "idCuenta": "i-mm-dinero-prestado",
        "monto": -100.0,
        "nombreCuenta": "Dinero Prestado 😫😩"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "413c59de7be6a0cc1af1d21849248fe059800c404a9659c5c2a074b3d73a2d0d",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "Dinero Prestado 😫😩",
      "subcategoria": null,
      "detalle": null,
      "cuentaOriginal": "YAPE"
    }
  },
  {
    "id": "tx-mm-c9d9ec2ca84f",
    "fecha": "2024-09-13T13:01:07.000Z",
    "descripcion": "Tienda",
    "movimientos": [
      {
        "idCuenta": "a-efectivo",
        "monto": 20.0,
        "nombreCuenta": "Efectivo"
      },
      {
        "idCuenta": "i-mm-dinero-extra-tienda-agarre",
        "monto": -20.0,
        "nombreCuenta": "Tienda Agarre"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "c9d9ec2ca84f99f3566eac9aa42c640172802704056c29d3c8375fae6134985c",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "💵 Dinero extra",
      "subcategoria": "Tienda Agarre",
      "detalle": null,
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-c9d9ec2ca84f",
    "fecha": "2024-09-13T13:02:14.000Z",
    "descripcion": "Tienda",
    "movimientos": [
      {
        "idCuenta": "a-efectivo",
        "monto": 20.0,
        "nombreCuenta": "Efectivo"
      },
      {
        "idCuenta": "i-mm-dinero-extra-tienda-agarre",
        "monto": -20.0,
        "nombreCuenta": "Tienda Agarre"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "c9d9ec2ca84f99f3566eac9aa42c640172802704056c29d3c8375fae6134985c",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "💵 Dinero extra",
      "subcategoria": "Tienda Agarre",
      "detalle": null,
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-695136d8e5ee",
    "fecha": "2024-09-13T13:04:08.000Z",
    "descripcion": "Tienda",
    "movimientos": [
      {
        "idCuenta": "a-efectivo",
        "monto": 160.0,
        "nombreCuenta": "Efectivo"
      },
      {
        "idCuenta": "i-mm-dinero-extra-tienda-agarre",
        "monto": -160.0,
        "nombreCuenta": "Tienda Agarre"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "695136d8e5ee12daa15a9481d84c18d6990afe93cf047dc0b48432d78eb4211d",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "💵 Dinero extra",
      "subcategoria": "Tienda Agarre",
      "detalle": null,
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-d8c3a484a82a",
    "fecha": "2024-09-13T13:04:20.000Z",
    "descripcion": "Jardinera plus Ceviche",
    "movimientos": [
      {
        "idCuenta": "g-mm-comida-almuerzo-jeferson",
        "monto": 10.0,
        "nombreCuenta": "Almuerzo Jeferson"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -10.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "d8c3a484a82a1e0fe3858e7499a2eef66b14727902e349a23afaa63c502bed36",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🍜 Comida",
      "subcategoria": "Almuerzo Jeferson",
      "detalle": null,
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-f6099c147e03",
    "fecha": "2024-09-13T13:05:19.000Z",
    "descripcion": "Menú Jardinera",
    "movimientos": [
      {
        "idCuenta": "g-mm-comida-almuerzo-diana",
        "monto": 9.0,
        "nombreCuenta": "Almuerzo Diana"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -9.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "f6099c147e03208687d03d8b3364d8e9c17f6c8e9a1cfc269a1188289c2a82c5",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🍜 Comida",
      "subcategoria": "Almuerzo Diana",
      "detalle": null,
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-bb837e7cecb0",
    "fecha": "2024-09-13T13:05:32.000Z",
    "descripcion": "Caldo de Gallina",
    "movimientos": [
      {
        "idCuenta": "g-mm-comida-cena-diana",
        "monto": 7.0,
        "nombreCuenta": "Cena Diana"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -7.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "bb837e7cecb07e26c336ac8387248ad86e23cf72eaa2617f7e8c086407351fa5",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🍜 Comida",
      "subcategoria": "Cena Diana",
      "detalle": null,
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-69c75e78860a",
    "fecha": "2024-09-13T13:05:44.000Z",
    "descripcion": "Pollo Broaster",
    "movimientos": [
      {
        "idCuenta": "g-mm-comida-cena-jeferson",
        "monto": 13.0,
        "nombreCuenta": "Cena Jeferson"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -13.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "69c75e78860a6e8075177aa69581e0ce31622e73fa0943151d4a6a4defb10d35",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🍜 Comida",
      "subcategoria": "Cena Jeferson",
      "detalle": null,
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-b5425d24198b",
    "fecha": "2024-09-13T13:07:08.000Z",
    "descripcion": "Casa a Puente Huachipa",
    "movimientos": [
      {
        "idCuenta": "g-mm-pasajes-pasaje-ida-jyd",
        "monto": 3.0,
        "nombreCuenta": "Pasaje Ida JyD"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -3.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "b5425d24198b77becb8a31ebc45920092a50e165ccb2e6061fa80317d0563b71",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🪙 Pasajes",
      "subcategoria": "Pasaje Ida JyD",
      "detalle": null,
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-a2f2b9888e36",
    "fecha": "2024-09-13T13:09:35.000Z",
    "descripcion": "Puente Huachipa a Acho",
    "movimientos": [
      {
        "idCuenta": "g-mm-pasajes-pasaje-ida-jyd",
        "monto": 6.0,
        "nombreCuenta": "Pasaje Ida JyD"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -6.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "a2f2b9888e3678006f4f4fbf525d2c7f3158943e799837b3d167229ccbf718af",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🪙 Pasajes",
      "subcategoria": "Pasaje Ida JyD",
      "detalle": null,
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-1e865d52e805",
    "fecha": "2024-09-13T13:10:02.000Z",
    "descripcion": "Acho a Metro",
    "movimientos": [
      {
        "idCuenta": "g-mm-pasajes-pasaje-ida-jyd",
        "monto": 3.0,
        "nombreCuenta": "Pasaje Ida JyD"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -3.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "1e865d52e8057671d41e6fabf67d4acc50cf5c499456d336c2908a46fbe5fc70",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🪙 Pasajes",
      "subcategoria": "Pasaje Ida JyD",
      "detalle": null,
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-9e289cf228af",
    "fecha": "2024-09-13T13:10:33.000Z",
    "descripcion": "Metro a Mayorazgo",
    "movimientos": [
      {
        "idCuenta": "g-mm-pasajes-pasaje-ida-jyd",
        "monto": 3.0,
        "nombreCuenta": "Pasaje Ida JyD"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -3.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "9e289cf228af7f800266875ab1dde69ce1aade9502be9bf7798de9e238d4b3a9",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🪙 Pasajes",
      "subcategoria": "Pasaje Ida JyD",
      "detalle": null,
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-5999e2fc2c43",
    "fecha": "2024-09-13T13:10:57.000Z",
    "descripcion": "Mayorazgo a Metro",
    "movimientos": [
      {
        "idCuenta": "g-mm-pasajes-pasaje-vuelta-solo",
        "monto": 1.5,
        "nombreCuenta": "Pasaje Vuelta Solo"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -1.5,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "5999e2fc2c43e7a28599a7171a21222acdb5c0c781ffbb3db531cfa426969f2f",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🪙 Pasajes",
      "subcategoria": "Pasaje Vuelta Solo",
      "detalle": null,
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-9f93eabbf3c6",
    "fecha": "2024-09-13T13:12:23.000Z",
    "descripcion": "Metro a Puente Nuevo",
    "movimientos": [
      {
        "idCuenta": "g-mm-pasajes-pasaje-vuelta-solo",
        "monto": 3.0,
        "nombreCuenta": "Pasaje Vuelta Solo"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -3.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "9f93eabbf3c613e4d0625c8c22e710ed1ce50cf790793f66a969576d5835a38d",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🪙 Pasajes",
      "subcategoria": "Pasaje Vuelta Solo",
      "detalle": null,
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-95f4f2f81e1a",
    "fecha": "2024-09-13T13:12:41.000Z",
    "descripcion": "Puente Nuevo a Puente Huachipa",
    "movimientos": [
      {
        "idCuenta": "g-mm-pasajes-pasaje-vuelta-solo",
        "monto": 4.0,
        "nombreCuenta": "Pasaje Vuelta Solo"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -4.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "95f4f2f81e1a66552c22c717d698f89b4861e841372eac594f319c395a1c4286",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🪙 Pasajes",
      "subcategoria": "Pasaje Vuelta Solo",
      "detalle": null,
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-9d1200a32a79",
    "fecha": "2024-09-13T13:13:03.000Z",
    "descripcion": "Puente Huachipa a Casa",
    "movimientos": [
      {
        "idCuenta": "g-mm-pasajes-pasaje-vuelta-solo",
        "monto": 3.0,
        "nombreCuenta": "Pasaje Vuelta Solo"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -3.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "9d1200a32a79e17fadc0767e4c6ef345797308f8f482df5b4e733dee3e5da59f",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🪙 Pasajes",
      "subcategoria": "Pasaje Vuelta Solo",
      "detalle": null,
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-9a6ab14739e7",
    "fecha": "2024-09-13T13:15:29.000Z",
    "descripcion": "Casa a Escalera",
    "movimientos": [
      {
        "idCuenta": "g-mm-pasajes-pasaje-ida-solo",
        "monto": 1.0,
        "nombreCuenta": "Pasaje Ida Solo"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -1.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "9a6ab14739e74003f2dfc326f3b2925f33df0dce11a495b672bb3b5eb1607ebe",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🪙 Pasajes",
      "subcategoria": "Pasaje Ida Solo",
      "detalle": null,
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-726b665c8720",
    "fecha": "2024-09-13T13:16:00.000Z",
    "descripcion": "Escalera a Cesal",
    "movimientos": [
      {
        "idCuenta": "g-mm-pasajes-pasaje-ida-solo",
        "monto": 2.0,
        "nombreCuenta": "Pasaje Ida Solo"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -2.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "726b665c8720e0c47150342ce5a91d9aa52684ef873736cdb16bcb53b4c35f9f",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🪙 Pasajes",
      "subcategoria": "Pasaje Ida Solo",
      "detalle": null,
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-db31659e1b5b",
    "fecha": "2024-09-13T13:16:19.000Z",
    "descripcion": "Cesal a Escalera",
    "movimientos": [
      {
        "idCuenta": "g-mm-pasajes-pasaje-vuelta-solo",
        "monto": 2.0,
        "nombreCuenta": "Pasaje Vuelta Solo"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -2.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "db31659e1b5b68399fdc9903fe3ba4f950ad37395cee7f0d7e9ef53e51db75e9",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🪙 Pasajes",
      "subcategoria": "Pasaje Vuelta Solo",
      "detalle": null,
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-c54232e05c73",
    "fecha": "2024-09-13T13:16:44.000Z",
    "descripcion": "Escalera a Casa",
    "movimientos": [
      {
        "idCuenta": "g-mm-pasajes-pasaje-vuelta-solo",
        "monto": 1.0,
        "nombreCuenta": "Pasaje Vuelta Solo"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -1.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "c54232e05c73227e7bba267b3206f075cb9b661ed5f7f19f59c202ed4684955d",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🪙 Pasajes",
      "subcategoria": "Pasaje Vuelta Solo",
      "detalle": null,
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-c8f898353639",
    "fecha": "2024-09-13T13:52:21.000Z",
    "descripcion": "Tienda",
    "movimientos": [
      {
        "idCuenta": "a-efectivo",
        "monto": 30.0,
        "nombreCuenta": "Efectivo"
      },
      {
        "idCuenta": "i-mm-dinero-extra-tienda-agarre",
        "monto": -30.0,
        "nombreCuenta": "Tienda Agarre"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "c8f8983536398adf35acad823801889d3961f37beafdf58ca1d6238e1f380ff4",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "💵 Dinero extra",
      "subcategoria": "Tienda Agarre",
      "detalle": null,
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-9a6ab14739e7",
    "fecha": "2024-09-13T15:46:03.000Z",
    "descripcion": "Casa a Escalera",
    "movimientos": [
      {
        "idCuenta": "g-mm-pasajes-pasaje-ida-solo",
        "monto": 1.0,
        "nombreCuenta": "Pasaje Ida Solo"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -1.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "9a6ab14739e74003f2dfc326f3b2925f33df0dce11a495b672bb3b5eb1607ebe",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🪙 Pasajes",
      "subcategoria": "Pasaje Ida Solo",
      "detalle": null,
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-726b665c8720",
    "fecha": "2024-09-13T15:46:15.000Z",
    "descripcion": "Escalera a Cesal",
    "movimientos": [
      {
        "idCuenta": "g-mm-pasajes-pasaje-ida-solo",
        "monto": 2.0,
        "nombreCuenta": "Pasaje Ida Solo"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -2.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "726b665c8720e0c47150342ce5a91d9aa52684ef873736cdb16bcb53b4c35f9f",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🪙 Pasajes",
      "subcategoria": "Pasaje Ida Solo",
      "detalle": null,
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-70b33fc3a016",
    "fecha": "2024-09-13T15:52:29.000Z",
    "descripcion": "Prestobarba",
    "movimientos": [
      {
        "idCuenta": "g-mm-otros",
        "monto": 1.8,
        "nombreCuenta": "Otros"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -1.8,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "70b33fc3a016554aeadb631b038312570502621bca2abd905279c8747ebb9fc0",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "Otros",
      "subcategoria": null,
      "detalle": null,
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-63d1e1ab1c43",
    "fecha": "2024-09-14T08:00:11.000Z",
    "descripcion": "Casa a Puente Huachipa",
    "movimientos": [
      {
        "idCuenta": "g-mm-pasajes-pasaje-ida-solo",
        "monto": 1.5,
        "nombreCuenta": "Pasaje Ida Solo"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -1.5,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "63d1e1ab1c437ea83235a28afaa5598d02db0479c8fdfed614e07c7538cb2ef9",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🪙 Pasajes",
      "subcategoria": "Pasaje Ida Solo",
      "detalle": null,
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-be91798890a8",
    "fecha": "2024-09-14T08:00:23.000Z",
    "descripcion": "Puente Huachipa a Puente Nuevo",
    "movimientos": [
      {
        "idCuenta": "g-mm-pasajes-pasaje-ida-solo",
        "monto": 3.0,
        "nombreCuenta": "Pasaje Ida Solo"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -3.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "be91798890a854d60e277b9b1bd86900424358b4f274991bb144283fd09ba1f4",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🪙 Pasajes",
      "subcategoria": "Pasaje Ida Solo",
      "detalle": null,
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-2705bd45ce3e",
    "fecha": "2024-09-14T08:00:49.000Z",
    "descripcion": "Puente Nuevo a Mega Plaza",
    "movimientos": [
      {
        "idCuenta": "g-mm-pasajes-pasaje-ida-jyd",
        "monto": 3.0,
        "nombreCuenta": "Pasaje Ida JyD"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -3.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "2705bd45ce3edd0a1b9bedd9eeaeef107f076aad7c0946270c57378ad3d512b4",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🪙 Pasajes",
      "subcategoria": "Pasaje Ida JyD",
      "detalle": null,
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-a121cf925227",
    "fecha": "2024-09-14T17:11:04.000Z",
    "descripcion": "Chillies Cena",
    "movimientos": [
      {
        "idCuenta": "g-mm-comida-cena-diana",
        "monto": 83.6,
        "nombreCuenta": "Cena Diana"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -83.6,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "a121cf925227504afe315db10e257c928186e921e22530e1f090767369be80bc",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🍜 Comida",
      "subcategoria": "Cena Diana",
      "detalle": null,
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-a345ee1f8323",
    "fecha": "2024-09-15T18:09:49.000Z",
    "descripcion": "Ceviche Acho",
    "movimientos": [
      {
        "idCuenta": "g-mm-comida-almuerzo-diana",
        "monto": 20.0,
        "nombreCuenta": "Almuerzo Diana"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -20.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "a345ee1f8323991a96abe71855d21ef245376f6155781272d6c161adb457d3b9",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🍜 Comida",
      "subcategoria": "Almuerzo Diana",
      "detalle": null,
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-7c88d31d21bf",
    "fecha": "2024-09-15T18:10:41.000Z",
    "descripcion": "Tajador Diana",
    "movimientos": [
      {
        "idCuenta": "g-mm-regalos",
        "monto": 6.0,
        "nombreCuenta": "🎁 Regalos"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -6.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "7c88d31d21bf2fe86592fd07287bbd64ff73b466732ab2f7ae1081439629b372",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🎁 Regalos",
      "subcategoria": null,
      "detalle": null,
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-08c13c7a1698",
    "fecha": "2024-09-15T18:11:02.000Z",
    "descripcion": "Frugos Coreano Diana",
    "movimientos": [
      {
        "idCuenta": "g-mm-regalos",
        "monto": 6.0,
        "nombreCuenta": "🎁 Regalos"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -6.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "08c13c7a1698fff01bbe711a39c0a26ed9065c39e9ac27baf2436f72e77f6dfc",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🎁 Regalos",
      "subcategoria": null,
      "detalle": null,
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-e3c8b8e5a901",
    "fecha": "2024-09-15T18:11:31.000Z",
    "descripcion": "Papas Coreanos Diana",
    "movimientos": [
      {
        "idCuenta": "g-mm-regalos",
        "monto": 6.0,
        "nombreCuenta": "🎁 Regalos"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -6.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "e3c8b8e5a9016e7a1295165d9d96752b1584284da8cdb5e9b5e9243b1a938d5a",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🎁 Regalos",
      "subcategoria": null,
      "detalle": null,
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-0ce946b62f49",
    "fecha": "2024-09-16T18:12:01.000Z",
    "descripcion": "Tienda",
    "movimientos": [
      {
        "idCuenta": "a-efectivo",
        "monto": 70.0,
        "nombreCuenta": "Efectivo"
      },
      {
        "idCuenta": "i-mm-dinero-extra-tienda-agarre",
        "monto": -70.0,
        "nombreCuenta": "Tienda Agarre"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "0ce946b62f49f8f5c032e08596b4ee7931794880389e6d2ccc92526b3bd5b767",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "💵 Dinero extra",
      "subcategoria": "Tienda Agarre",
      "detalle": null,
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-e0cd13ee0898",
    "fecha": "2024-10-22T20:38:37.000Z",
    "descripcion": "Pollo Broaster",
    "movimientos": [
      {
        "idCuenta": "g-mm-comida-cena-diana",
        "monto": 11.5,
        "nombreCuenta": "Cena Diana"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -11.5,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "e0cd13ee089865a9ce0a3bcb53d5f8908778f5b3a615f9abac1e0085093939c1",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🍜 Comida",
      "subcategoria": "Cena Diana",
      "detalle": null,
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-64c406f94bfc",
    "fecha": "2024-10-22T20:40:57.000Z",
    "descripcion": "Pollo Broaster",
    "movimientos": [
      {
        "idCuenta": "g-mm-comida-cena-jeferson",
        "monto": 13.0,
        "nombreCuenta": "Cena Jeferson"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -13.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "64c406f94bfc28eb85e1c33df3b053ddadf12e6f43e264834ee499201e4efa1a",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🍜 Comida",
      "subcategoria": "Cena Jeferson",
      "detalle": null,
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-4888a4ca1245",
    "fecha": "2024-10-30T13:40:50.000Z",
    "descripcion": "Ingresos",
    "movimientos": [
      {
        "idCuenta": "a-efectivo",
        "monto": 200.9,
        "nombreCuenta": "Efectivo"
      },
      {
        "idCuenta": "pt-inicial",
        "monto": -200.9,
        "nombreCuenta": "Saldo inicial"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "4888a4ca1245d72df56b41322561e424256f7e10c00658d0b42eab403405510f",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "Modificar saldo",
      "subcategoria": null,
      "detalle": null,
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-cb60e7337092",
    "fecha": "2024-10-30T13:41:10.000Z",
    "descripcion": "Casa a Puente Huachipa",
    "movimientos": [
      {
        "idCuenta": "g-mm-pasajes-pasaje-ida-solo",
        "monto": 1.0,
        "nombreCuenta": "Pasaje Ida Solo"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -1.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "cb60e7337092cb72182dab118925a9061f6dd207c7e62f61a1df47d3f71b9f07",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🪙 Pasajes",
      "subcategoria": "Pasaje Ida Solo",
      "detalle": null,
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-43b01463639d",
    "fecha": "2024-10-30T14:07:13.000Z",
    "descripcion": "Puente Huachipa a Santa Clara",
    "movimientos": [
      {
        "idCuenta": "g-mm-pasajes-pasaje-ida-jyd",
        "monto": 2.0,
        "nombreCuenta": "Pasaje Ida JyD"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -2.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "43b01463639d79ba01d3c65aa3e6fe82bf9bc6c1df3331d984cab3a05c0f3ff9",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🪙 Pasajes",
      "subcategoria": "Pasaje Ida JyD",
      "detalle": null,
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-b0ea338a9d02",
    "fecha": "2025-01-06T16:05:36.000Z",
    "descripcion": "Casa a Puente Huachipa",
    "movimientos": [
      {
        "idCuenta": "g-mm-pasajes-pasaje-ida-solo",
        "monto": 1.5,
        "nombreCuenta": "Pasaje Ida Solo"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -1.5,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "b0ea338a9d0204ef5220849a6224305c087800f94ea1fb1d5c4e79c6a22da64b",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🪙 Pasajes",
      "subcategoria": "Pasaje Ida Solo",
      "detalle": "Ir al Hotel de Fuxion",
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-d18d920ac277",
    "fecha": "2025-01-06T16:45:35.000Z",
    "descripcion": "Puente Huachipa a Puente Benavides",
    "movimientos": [
      {
        "idCuenta": "g-mm-pasajes-pasaje-ida-solo",
        "monto": 4.0,
        "nombreCuenta": "Pasaje Ida Solo"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -4.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "d18d920ac277fe7d579acf41c909bf6c70439a668bad1e32a28686fb7e78595e",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🪙 Pasajes",
      "subcategoria": "Pasaje Ida Solo",
      "detalle": "Ir al Evento de Fuxion",
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-54532ad2c38b",
    "fecha": "2025-01-06T17:00:21.000Z",
    "descripcion": "Ricardo Palma a Parque Kennedy",
    "movimientos": [
      {
        "idCuenta": "g-mm-pasajes-pasaje-ida-con-compania",
        "monto": 3.0,
        "nombreCuenta": "Pasaje ida con compañía"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -3.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "54532ad2c38b30dd4c1ec9f63745d03b9a05ebd2bae968748ebccfb93d910fdf",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🪙 Pasajes",
      "subcategoria": "Pasaje ida con compañía",
      "detalle": "Alcance a Noelia y nos fuimos",
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-3e7d0e98ae67",
    "fecha": "2025-01-06T18:30:09.000Z",
    "descripcion": "Mi entrada",
    "movimientos": [
      {
        "idCuenta": "g-mm-fuxion-entrada-evento",
        "monto": 20.0,
        "nombreCuenta": "Entrada Evento"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -20.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "3e7d0e98ae673ce8d4e75092b285540c422219bc3a87b9f8dede8a5001029f84",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "📈 Fuxion",
      "subcategoria": "Entrada Evento",
      "detalle": "Entrada del mío a Fuxion",
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-a91934ef917f",
    "fecha": "2025-01-06T18:30:12.000Z",
    "descripcion": "Tomatodo Fuxion",
    "movimientos": [
      {
        "idCuenta": "g-mm-fuxion-productos-del-evento",
        "monto": 50.0,
        "nombreCuenta": "Productos del Evento"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -50.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "a91934ef917f7047e8965ce074da6c7baa810982fe864825384b174a16059760",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "📈 Fuxion",
      "subcategoria": "Productos del Evento",
      "detalle": "Noelia le preste para que compre su Tomatodo",
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-9b02218b5202",
    "fecha": "2025-01-06T18:30:58.000Z",
    "descripcion": "Entrada de Noelia",
    "movimientos": [
      {
        "idCuenta": "g-mm-fuxion-entrada-evento",
        "monto": 20.0,
        "nombreCuenta": "Entrada Evento"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -20.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "9b02218b5202cf1f06709adc31c6d439c00102ed93a5aaeeeaccad6daff9ee58",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "📈 Fuxion",
      "subcategoria": "Entrada Evento",
      "detalle": "Pague de Noelia su entrada a el evento",
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-7844468f1457",
    "fecha": "2025-01-06T22:30:07.000Z",
    "descripcion": "Parque Kennedy a Ricardo Palma",
    "movimientos": [
      {
        "idCuenta": "g-mm-pasajes-pasaje-vuelta-con-compania",
        "monto": 3.0,
        "nombreCuenta": "Pasaje vuelta con compañia"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -3.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "7844468f1457598731ddbca3700744fd11c7dec94ddc8f1ebc0a3ac475c63cc0",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🪙 Pasajes",
      "subcategoria": "Pasaje vuelta con compañia",
      "detalle": "Nos vamos a Puente Benavides con Noelia",
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-26a53ef3133e",
    "fecha": "2025-01-06T22:39:03.000Z",
    "descripcion": "Puente Benavides a Puente Huachipa",
    "movimientos": [
      {
        "idCuenta": "g-mm-pasajes-pasaje-vuelta-con-compania",
        "monto": 8.0,
        "nombreCuenta": "Pasaje vuelta con compañia"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -8.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "26a53ef3133e2d67b7deb1b148f4ad0645d32d7a252ffd69c3b9f6398e4e3c14",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🪙 Pasajes",
      "subcategoria": "Pasaje vuelta con compañia",
      "detalle": "Regresamos a casa con Noelia y Tia",
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-61bc84d0770c",
    "fecha": "2025-01-06T23:00:58.000Z",
    "descripcion": "Puente Huachipa a Casa",
    "movimientos": [
      {
        "idCuenta": "g-mm-pasajes-pasaje-vuelta-con-compania",
        "monto": 3.0,
        "nombreCuenta": "Pasaje vuelta con compañia"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -3.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "61bc84d0770c0d40271dae9a40b693768c7778a1f3ea45962cd65dbd7c4a6bec",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🪙 Pasajes",
      "subcategoria": "Pasaje vuelta con compañia",
      "detalle": "Ya nos vamos a casa con Noelia y Tía",
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-b0d5ba00ead6",
    "fecha": "2025-01-07T05:46:50.000Z",
    "descripcion": "Noelia devolvio",
    "movimientos": [
      {
        "idCuenta": "a-banco",
        "monto": 70.0,
        "nombreCuenta": "BCP"
      },
      {
        "idCuenta": "i-mm-dinero-prestado",
        "monto": -70.0,
        "nombreCuenta": "Dinero Prestado 😫😩"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "b0d5ba00ead60ab0ae941a391d6bbf8d19841491831bea3d7b958847ad607767",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "Dinero Prestado 😫😩",
      "subcategoria": null,
      "detalle": "Noelia me devolvió de Fuxion",
      "cuentaOriginal": "BCP"
    }
  },
  {
    "id": "tx-mm-75d2110f7971",
    "fecha": "2025-01-07T18:00:15.000Z",
    "descripcion": "Casa a Puente Huachipa",
    "movimientos": [
      {
        "idCuenta": "g-mm-pasajes-pasaje-ida-solo",
        "monto": 1.5,
        "nombreCuenta": "Pasaje Ida Solo"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -1.5,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "75d2110f797184465b05ebdea0adda798b7c4c639a4315f93e0ba6b1a958b03c",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🪙 Pasajes",
      "subcategoria": "Pasaje Ida Solo",
      "detalle": null,
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-ed658bc20763",
    "fecha": "2025-01-07T18:00:37.000Z",
    "descripcion": "Caqueta a Plaza Norte",
    "movimientos": [
      {
        "idCuenta": "g-mm-pasajes-pasaje-ida-jyd",
        "monto": 6.0,
        "nombreCuenta": "Pasaje Ida JyD"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -6.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "ed658bc2076306703cb3da9f9eae84d6c08985c74c40506c0b14289efb6b4910",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🪙 Pasajes",
      "subcategoria": "Pasaje Ida JyD",
      "detalle": "Fue un viaje Directo",
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-e45899997eca",
    "fecha": "2025-01-07T18:00:47.000Z",
    "descripcion": "Puente Huachipa a Caqueta",
    "movimientos": [
      {
        "idCuenta": "g-mm-pasajes-pasaje-ida-jyd",
        "monto": 6.0,
        "nombreCuenta": "Pasaje Ida JyD"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -6.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "e45899997eca79d15772a15e8db987b79a7bc89f4da94a14b304b8d152241117",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🪙 Pasajes",
      "subcategoria": "Pasaje Ida JyD",
      "detalle": null,
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-ca5d28af6053",
    "fecha": "2025-01-07T20:00:08.000Z",
    "descripcion": "Mediterráneo Plaza Norte",
    "movimientos": [
      {
        "idCuenta": "g-mm-comida-cena-diana",
        "monto": 16.5,
        "nombreCuenta": "Cena Diana"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -16.5,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "ca5d28af6053e927d0c59f2a33c72b5058038946a2251b5b6d31fbd215a02fc2",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🍜 Comida",
      "subcategoria": "Cena Diana",
      "detalle": null,
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-bab5b4bf9351",
    "fecha": "2025-01-07T20:00:32.000Z",
    "descripcion": "Mediterranl Plaza Norte",
    "movimientos": [
      {
        "idCuenta": "g-mm-comida-cena-jeferson",
        "monto": 14.0,
        "nombreCuenta": "Cena Jeferson"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -14.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "bab5b4bf9351a96e21856ea1c49d319ef76dcfb8a5964baad1b828ab2b72956b",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🍜 Comida",
      "subcategoria": "Cena Jeferson",
      "detalle": "Se le antojo",
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-7c616e4f3799",
    "fecha": "2025-01-07T21:00:53.000Z",
    "descripcion": "WiniKunka",
    "movimientos": [
      {
        "idCuenta": "g-mm-hotel-deli",
        "monto": 15.0,
        "nombreCuenta": "🥵 Deli"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -15.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "7c616e4f37998a47e531632fbbd0105ccaef81f21c3dc57c584c524d99cd6233",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🏩 Hotel",
      "subcategoria": "🥵 Deli",
      "detalle": "Plaza Norte Hotel Winikunka, Diana me dió 20",
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-779b338d2c5e",
    "fecha": "2025-01-07T22:00:20.000Z",
    "descripcion": "Regale",
    "movimientos": [
      {
        "idCuenta": "g-mm-otros",
        "monto": 5.0,
        "nombreCuenta": "Otros"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -5.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "779b338d2c5ee8656b2e3e963e542bade16a14d1c05323d91b88a0a8b8672143",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "Otros",
      "subcategoria": null,
      "detalle": "Le Dina Diana para su pasaje",
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-d31433a97253",
    "fecha": "2025-01-07T23:00:01.000Z",
    "descripcion": "Taxi a su casa",
    "movimientos": [
      {
        "idCuenta": "g-mm-otros",
        "monto": 10.0,
        "nombreCuenta": "Otros"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -10.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "d31433a9725331fc12c49a24004bf6a7dc3a8c3ad870eca1806c96e62621b398",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "Otros",
      "subcategoria": null,
      "detalle": "De Plaza Norte a su casa después del Deli",
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-a3912fe675b6",
    "fecha": "2025-01-07T23:30:03.000Z",
    "descripcion": "Plaza Norte a Puente Nuevo",
    "movimientos": [
      {
        "idCuenta": "g-mm-pasajes-pasaje-vuelta-solo",
        "monto": 2.0,
        "nombreCuenta": "Pasaje Vuelta Solo"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -2.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "a3912fe675b6eb493928cfee9917d86a85f2c6e0516e62e9a0e7e9ecbdd984d2",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🪙 Pasajes",
      "subcategoria": "Pasaje Vuelta Solo",
      "detalle": "Camine a tomar la C",
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-16a1dde967d3",
    "fecha": "2025-01-07T23:45:36.000Z",
    "descripcion": "Puente Nuevo a Puente Huachipa",
    "movimientos": [
      {
        "idCuenta": "g-mm-pasajes-pasaje-vuelta-solo",
        "monto": 3.0,
        "nombreCuenta": "Pasaje Vuelta Solo"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -3.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "16a1dde967d3c869cd9a6e06332753cd5bdb35ff06e8094387accfc4e416fb17",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🪙 Pasajes",
      "subcategoria": "Pasaje Vuelta Solo",
      "detalle": "Subí a uno que me dejó a 3 soles en la noche",
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-1bf42cc15305",
    "fecha": "2025-01-07T23:50:20.000Z",
    "descripcion": "Deuda Interbank",
    "movimientos": [
      {
        "idCuenta": "g-mm-deudas-credito-interbank",
        "monto": 70.0,
        "nombreCuenta": "Crédito Interbank"
      },
      {
        "idCuenta": "a-banco",
        "monto": -70.0,
        "nombreCuenta": "BCP"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "1bf42cc15305890510fcf4fca97e49e0376d4f8e4416a04c89a166a58fd4a8b9",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "📉 Deudas",
      "subcategoria": "Crédito Interbank",
      "detalle": "Pagar deuda de Interbank",
      "cuentaOriginal": "BCP"
    }
  },
  {
    "id": "tx-mm-4cc980a9ee2b",
    "fecha": "2025-01-07T23:58:08.000Z",
    "descripcion": "Taxi a mi casa",
    "movimientos": [
      {
        "idCuenta": "g-mm-pasajes-pasaje-vuelta-solo",
        "monto": 4.0,
        "nombreCuenta": "Pasaje Vuelta Solo"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -4.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "4cc980a9ee2baefcdae72e637f3decb7333c6d87d5f38b6e680da58c2e404a04",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🪙 Pasajes",
      "subcategoria": "Pasaje Vuelta Solo",
      "detalle": "No había carros ni Minivans, tome un taxi con otros pasajeros",
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-9831da6cb1fe",
    "fecha": "2025-01-08T16:30:07.000Z",
    "descripcion": "Almuerzo Restaurante de Casa",
    "movimientos": [
      {
        "idCuenta": "g-mm-comida-almuerzo-diana",
        "monto": 10.0,
        "nombreCuenta": "Almuerzo Diana"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -10.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "9831da6cb1fe261ac81b0c951d944cd115aef84dd08bbe7b874a194091575dd4",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🍜 Comida",
      "subcategoria": "Almuerzo Diana",
      "detalle": "Chicharrón de pescado con entrada de tequeños",
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-9831da6cb1fe",
    "fecha": "2025-01-08T16:30:46.000Z",
    "descripcion": "Almuerzo Restaurante de Casa",
    "movimientos": [
      {
        "idCuenta": "g-mm-comida-almuerzo-jeferson",
        "monto": 10.0,
        "nombreCuenta": "Almuerzo Jeferson"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -10.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "9831da6cb1fe261ac81b0c951d944cd115aef84dd08bbe7b874a194091575dd4",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🍜 Comida",
      "subcategoria": "Almuerzo Jeferson",
      "detalle": "Chicharrón de pescado con entrada de tequeños",
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-9162b11e1873",
    "fecha": "2025-01-08T19:44:13.000Z",
    "descripcion": "Casa a Puente Huachipa",
    "movimientos": [
      {
        "idCuenta": "g-mm-pasajes-pasaje-ida-jyd",
        "monto": 3.0,
        "nombreCuenta": "Pasaje Ida JyD"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -3.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "9162b11e1873b0fff476a60527d5bb69eca141669d81c36472153338ed6af6e7",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🪙 Pasajes",
      "subcategoria": "Pasaje Ida JyD",
      "detalle": "Hubo deli",
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-40df6b6c8787",
    "fecha": "2025-01-08T19:44:53.000Z",
    "descripcion": "Puente Huachipa a Caqueta",
    "movimientos": [
      {
        "idCuenta": "g-mm-pasajes-pasaje-ida-jyd",
        "monto": 6.0,
        "nombreCuenta": "Pasaje Ida JyD"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -6.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "40df6b6c87878beabf88692afa82f22120683cbf4e3404e6580331f90c354248",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🪙 Pasajes",
      "subcategoria": "Pasaje Ida JyD",
      "detalle": "Le acompañe",
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-b862fb1fd5df",
    "fecha": "2025-01-08T19:46:16.000Z",
    "descripcion": "Emoliente Puente Huachipa",
    "movimientos": [
      {
        "idCuenta": "g-mm-comida-cena-diana",
        "monto": 3.0,
        "nombreCuenta": "Cena Diana"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -3.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "b862fb1fd5dfcec5e9451d07d90fc1ab286bd7eb78fa2c5a52c5bf0af08424d5",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🍜 Comida",
      "subcategoria": "Cena Diana",
      "detalle": "Compro un quinua en una emolientera",
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-1e5457cc6dc0",
    "fecha": "2025-01-08T19:52:20.000Z",
    "descripcion": "Me devolvió de mi pasaje y le di 50 en dies centimosb",
    "movimientos": [
      {
        "idCuenta": "a-efectivo",
        "monto": 2.5,
        "nombreCuenta": "Efectivo"
      },
      {
        "idCuenta": "i-mm-otro",
        "monto": -2.5,
        "nombreCuenta": "Otro"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "1e5457cc6dc055df053b0c9620f06829b3e6fe820836b224c04b42688170a426",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "Otro",
      "subcategoria": null,
      "detalle": "Me devolvió de mi pasaje y le di 50 en dies centimosb",
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-f6d88a4d594c",
    "fecha": "2025-01-10T12:56:12.000Z",
    "descripcion": "Venta de Prunex",
    "movimientos": [
      {
        "idCuenta": "a-efectivo",
        "monto": 76.0,
        "nombreCuenta": "Efectivo"
      },
      {
        "idCuenta": "i-mm-fuxion-venta-de-producto",
        "monto": -76.0,
        "nombreCuenta": "Venta de Producto"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "f6d88a4d594cd1eb7535542f7daf7da26e2bd7a87dbe59741937c0495ad20547",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🌐 Fuxion",
      "subcategoria": "Venta de Producto",
      "detalle": "Tío David me compro para su colón",
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-6c20e13b8836",
    "fecha": "2025-01-16T13:23:34.000Z",
    "descripcion": "Cenamos juntos Pizza",
    "movimientos": [
      {
        "idCuenta": "g-mm-comida-cena",
        "monto": 20.0,
        "nombreCuenta": "Cena"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -20.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "6c20e13b8836a69113abdb8b8ca7c633aa0567345ca907a1bcb434923fa55c18",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🍜 Comida",
      "subcategoria": "Cena",
      "detalle": "Compramos de la mi tía Magaly",
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-05941453817d",
    "fecha": "2025-01-16T13:24:17.000Z",
    "descripcion": "Pasaje de Diana",
    "movimientos": [
      {
        "idCuenta": "g-mm-transporte-autobus",
        "monto": 3.0,
        "nombreCuenta": "Autobús"
      },
      {
        "idCuenta": "a-efectivo",
        "monto": -3.0,
        "nombreCuenta": "Efectivo"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "05941453817d855f450eb4bb19d3d7722ad64abc8bffbaa6d547aed5546378fe",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🚖 Transporte",
      "subcategoria": "Autobús",
      "detalle": "Le di 3 soles para que llegue bien a casa",
      "cuentaOriginal": "Efectivo"
    }
  },
  {
    "id": "tx-mm-e11e9f5c0281",
    "fecha": "2025-01-16T13:27:44.000Z",
    "descripcion": "Me presto 100",
    "movimientos": [
      {
        "idCuenta": "a-yape",
        "monto": 100.0,
        "nombreCuenta": "YAPE"
      },
      {
        "idCuenta": "i-mm-madre-yape",
        "monto": -100.0,
        "nombreCuenta": "Yape"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "e11e9f5c0281a578e1984a54fdac705869290f7d2dc78720bdb4cd2fa18162d8",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "🙎Madre",
      "subcategoria": "Yape",
      "detalle": "Me dió para poder completar la compra de Rexet y Prunex",
      "cuentaOriginal": "YAPE"
    }
  },
  {
    "id": "tx-mm-985e88dbab57",
    "fecha": "2025-01-16T13:28:25.000Z",
    "descripcion": "Pague tarjeta directa",
    "movimientos": [
      {
        "idCuenta": "g-mm-fuxion-productos-para-cliente",
        "monto": 214.51,
        "nombreCuenta": "Productos para Cliente"
      },
      {
        "idCuenta": "a-banco",
        "monto": -214.51,
        "nombreCuenta": "BCP"
      }
    ],
    "metadatos": {
      "fuente": "MoneyManager",
      "fingerprint": "985e88dbab57cfa3962895715fdd7113ad5e18d29efa2f5d94e745f59240dc00",
      "archivoOrigen": "Registro Contable.xlsx",
      "importadoEl": "2026-07-26T00:00:00.000Z",
      "categoria": "📈 Fuxion",
      "subcategoria": "Productos para Cliente",
      "detalle": "Pague para completar los 80 puntos",
      "cuentaOriginal": "BCP"
    }
  }
];
