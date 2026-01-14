# Notificationes Resilientes – Arquitectura

Este proyecto implementa el núcleo de un **sistema de notificaciones resiliente con prioridad**, diseñado para ser simple en su implementación inicial (in-memory) pero preparado para escalar sin reescribir la lógica central.

La arquitectura sigue un enfoque de **Ports & Adapters (arquitectura hexagonal)**: el core de negocio no depende de detalles de infraestructura, sino de interfaces. Las implementaciones concretas pueden cambiar sin afectar el comportamiento del sistema.

---

## Principios de diseño

- Prioridad de notificaciones (**TRANSACTIONAL** sobre **MARKETING**)
- Resiliencia ante fallos de proveedores (failover)
- Rate limiting por usuario
- Componentes desacoplados mediante interfaces
- Preparado para escalar cambiando implementaciones (ej. Redis, colas externas)

---

## Open/Closed: ¿Cómo agregas un nuevo canal (ej. WhatsApp)?

El principio **Open/Closed** se garantiza porque el sistema no depende de proveedores concretos para el envío de notificaciones, sino de una abstracción común.

El `NotificationManager` orquesta el envío utilizando una lista de proveedores que implementan la misma interfaz. Para agregar un nuevo canal, como WhatsApp:

1. Se crea un nuevo adaptador (por ejemplo `WhatsAppProvider`) que implemente la interfaz de proveedor.
2. Se registra ese nuevo proveedor al inicializar el `NotificationManager`.

No es necesario modificar la lógica del core.  
La prioridad, el rate limiting y el failover permanecen intactos.

---

## Concurrencia: ¿Qué pasa si dos procesos notifican al mismo usuario al mismo tiempo?

Si dos procesos/instancias intentan notificar al mismo usuario al mismo tiempo:

- En la versión **in-memory**, **no hay coordinación entre procesos**, porque **cada proceso tiene su propia memoria**. Esto significa que **no se puede garantizar globalmente** ni el **rate limit** ni la **deduplicación** entre instancias.

- Para manejarlo correctamente en producción, el estado que debe ser consistente se mueve a un componente **compartido y atómico**:
  1. **Rate limiting distribuido**: reemplazar `InMemoryRateLimiter` por un `RedisRateLimiter` (o similar), donde todas las instancias consultan y actualizan el mismo contador o ventana mediante operaciones atómicas.
  2. **Idempotencia / deduplicación**: reemplazar `InMemoryCache` por Redis utilizando una operación atómica, de modo que solo una instancia "gane" el derecho a enviar la notificación.
  3. **Cola externa**: usar un broker como SQS, RabbitMQ o Kafka para centralizar el consumo y evitar que dos procesos procesen el mismo evento.

**Resultado:** aunque dos procesos reciban el evento al mismo tiempo, **solo uno envía** y el rate limit se respeta **globalmente**, sin modificar la lógica del core, únicamente cambiando las implementaciones de infraestructura.

---

## Cómo ejecutar el proyecto

### Requisitos

- Node.js **>= 18**
- npm

---

### Instalación

```bash
npm install
```

## Configuración de entorno

### Crea un archivo .env en la raíz del proyecto:

```
PORT=3000
RATE_LIMIT_MAX=5
RATE_LIMIT_WINDOW=10
SENDGRID_FAILURE_RATE=0.5
```

## Levantar la API en local

`npm run dev:api`

### Salida esperada:

`Local API running on http://localhost:3000`

## Probar el endpoint

### Envío simple

curl -X POST http://localhost:3000/sendNotification \
 -H "Content-Type: application/json" \
 -d '{"userId":"user1","message":"hello","type":"TRANSACTIONAL"}'

### Batch con prioridad

```
curl -X POST http://localhost:3000/sendNotification \
 -H "Content-Type: application/json" \
 -d '[
{"userId":"user1","message":"mkt-1","type":"MARKETING"},
{"userId":"user1","message":"tx-1","type":"TRANSACTIONAL"},
{"userId":"user1","message":"mkt-2","type":"MARKETING"}
]'
```

### La respuesta incluye un resumen por notificación (sent, rate_limited, skipped_cache, failed).

**Cómo correr los tests**

El proyecto incluye tests unitarios para validar componentes clave como el rate limiter.

Ejecutar todos los tests
`npm test` o, dependiendo del setup:

`npm run test`

**Qué validan los tests**

- Comportamiento del Rate Limiter

- Permite envíos dentro del límite

- Bloquea envíos cuando se excede la ventana
