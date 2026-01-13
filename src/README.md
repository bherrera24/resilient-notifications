Arquitectura de Notificaciones Resilientes
📌 Descripción General

Este proyecto implementa el núcleo de un motor de notificaciones resiliente, diseñado para funcionar in-memory, pero preparado para escalar a proveedores externos como Redis o bases de datos SQL sin modificar la lógica de negocio.

El sistema soporta:

Múltiples proveedores de notificación

Failover automático

Rate limiting por usuario

Priorización de mensajes

Cache con TTL

Arquitectura extensible y desacoplada

🧱 Arquitectura General

El diseño sigue principios de Clean Architecture y SOLID, separando claramente:

Domain: contratos y reglas de negocio

Application: orquestación del flujo

Infrastructure: implementaciones concretas (providers, cache, rate limiter)

Las dependencias siempre apuntan hacia abstracciones, no implementaciones concretas.

🔌 ¿Cómo se garantiza el principio Open/Closed?

El sistema garantiza el principio Open/Closed (abierto para extensión, cerrado para modificación) mediante el uso del Strategy Pattern.

🔹 Ejemplo: Agregar un nuevo canal (WhatsApp)

Se crea una nueva implementación de la interfaz INotificationProvider:

class WhatsAppProvider implements INotificationProvider {
async send(notification: Notification): Promise<void> {
// lógica de envío
}
}

El nuevo provider se inyecta en el NotificationManager:

new NotificationManager(
[new SendGridProvider(), new WhatsAppProvider()],
rateLimiter,
cache
);

✅ Resultado

No se modifica el NotificationManager

No se altera la lógica de negocio

No se rompen dependencias existentes

Esto permite agregar nuevos canales (Email, SMS, WhatsApp, Push, etc.) sin tocar el core del sistema.
//
🧩 Cumplimiento de Principios SOLID
S — Single Responsibility Principle (SRP)

Cada clase tiene una única responsabilidad:

NotificationManager: orquesta el flujo de envío (rate limit, cache, failover).

SendGridMockProvider, TwilioMockProvider: encapsulan la lógica de envío de cada proveedor.

InMemoryRateLimiter: controla el rate limiting por usuario.

InMemoryCache: gestiona almacenamiento temporal y expiración (TTL).

Esto permite modificar o extender cada componente sin afectar a los demás.

O — Open/Closed Principle (OCP)

El sistema está abierto a extensión y cerrado a modificación.

Nuevos canales de notificación se agregan implementando INotificationProvider.

Nuevas estrategias de cache o rate limiting se agregan implementando ICache o IRateLimiter.

El core (NotificationManager) no necesita cambios para soportar nuevas funcionalidades.

L — Liskov Substitution Principle (LSP)

Todas las implementaciones pueden sustituirse por sus interfaces sin alterar el comportamiento del sistema.

Cualquier implementación de INotificationProvider puede reemplazar a otra.

InMemoryCache puede ser reemplazado por RedisCache.

InMemoryRateLimiter puede ser reemplazado por una versión distribuida.

El sistema funciona correctamente independientemente de la implementación concreta.

I — Interface Segregation Principle (ISP)

Las interfaces están específicamente definidas y no fuerzan dependencias innecesarias:

INotificationProvider expone solo el método send.

ICache expone únicamente operaciones de cache.

IRateLimiter se enfoca solo en control de envíos.

Esto mantiene las implementaciones simples y cohesionadas.

D — Dependency Inversion Principle (DIP)

El core del sistema depende de abstracciones, no de implementaciones concretas.

NotificationManager depende de INotificationProvider, IRateLimiter y ICache.

Las implementaciones concretas se inyectan desde el entry point.

Esto permite:

cambiar infraestructura sin afectar la lógica

facilitar testing

escalar a Redis u otros servicios externos
//
🔁 ¿Cómo se maneja la concurrencia?
Problema

¿Qué ocurre si dos procesos intentan notificar al mismo usuario al mismo tiempo?

Solución

Rate Limiting por usuario
Antes de enviar una notificación, el sistema valida si el usuario puede recibir mensajes dentro de una ventana de tiempo configurable.

Cache con TTL (Time To Live)
Se utiliza un servicio de cache (ICache) para evitar envíos duplicados:

Si una notificación ya fue enviada recientemente, se bloquea el reenvío.

El TTL garantiza expiración automática del estado.

Diseño escalable

En entornos locales se usa InMemoryCache

En producción, la misma interfaz permite reemplazarlo por Redis, habilitando:

locks distribuidos

atomicidad

consistencia entre procesos

📌 Nota sobre entornos serverless

En plataformas como Netlify Functions, el cache in-memory no persiste entre invocaciones.
Este comportamiento es esperado y justifica el uso de Redis en escenarios reales.

🧪 Testing

El proyecto incluye tests unitarios que validan:

Rate limiting por usuario

Failover entre proveedores

Expiración de cache por TTL

Evita envíos duplicados

Los tests prueban comportamiento, no implementación, asegurando estabilidad ante cambios futuros.

🚀 Escalabilidad

Gracias al uso de interfaces (INotificationProvider, IRateLimiter, ICache), el sistema puede evolucionar fácilmente hacia:

Redis para cache distribuido

Bases de datos SQL para persistencia

Nuevos canales de comunicación

Ejecución en entornos distribuidos

Todo esto sin modificar la lógica central.

✅ Conclusión

Este diseño prioriza:

Extensibilidad

Resiliencia

Claridad de responsabilidades

Preparación para producción

El núcleo del sistema permanece estable mientras las capacidades del sistema pueden crecer de forma controlada.
