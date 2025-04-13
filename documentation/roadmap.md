# Roadmap - Taquería "El Buen Sabor" con Asistente de Voz

## Resumen del Proyecto

La aplicación "Taquería El Buen Sabor" es una plataforma de pedidos en línea con asistente de voz integrado para una taquería mexicana. El proyecto combina una interfaz web interactiva con tecnología de voz para permitir a los clientes realizar pedidos mediante comandos hablados, mejorando la accesibilidad y experiencia de usuario.

## Estado Actual (Versión 1.0)

Actualmente, la aplicación cuenta con las siguientes funcionalidades:

- **Interfaz de usuario responsive** dividida en tres secciones principales:
  - Menú de productos (tacos, bebidas, extras)
  - Carrito de compras interactivo
  - Panel de interacción con asistente de voz
- **Asistente de voz** capaz de:
  - Entender solicitudes de clientes
  - Responder a preguntas sobre el menú
  - Agregar productos al carrito mediante comandos de voz
  - Destacar visualmente los productos mencionados
- **Navegación entre categorías** (tacos, bebidas, extras) con:
  - Botones de categoría
  - Desplazamiento horizontal de productos
  - Controles de navegación con flechas
- **Gestión de pedidos** con:
  - Agregar/eliminar productos
  - Modificar cantidades
  - Agregar instrucciones especiales
  - Visualización del total
- **Efectos visuales y sonoros** que mejoran la experiencia:
  - Animaciones al agregar productos
  - Sonidos para navegación y acciones
  - Destacado visual de productos mencionados por el asistente

## Problemas Pendientes

1. **Problemas de visualización**:
   - Tamaño inconsistente de los contenedores de productos
   - Íconos incorrectos o genéricos para diferentes productos:
     - Mismos íconos para diferentes bebidas (Agua de Horchata, Jamaica y Refresco)
     - En la sección "extras" todos los productos muestran íconos de tacos

2. **Problemas de funcionalidad**:
   - Ocasionalmente el asistente de voz no interpreta correctamente los precios
   - Algunos productos no se destacan correctamente cuando son mencionados
   - El texto "Call ended successfully" aparece en inglés cuando debería estar en español

3. **Problemas de rendimiento**:
   - Carga inicial de sonidos puede causar demoras
   - Posibles problemas de rendimiento en dispositivos de gama baja

## Problemas Actuales Detallados (Junio 2024)

1. **Problemas UI/UX críticos**:
   - **Contenedor de detalles del pedido**: El tamaño del contenedor no se ajusta correctamente en ciertos dispositivos, causando que parte del contenido quede fuera de vista o se corte, especialmente cuando hay múltiples productos en el carrito.
   - **Visualización de productos**: Los productos en el carrito a veces no muestran correctamente sus íconos representativos, usando íconos genéricos en su lugar.
   - **Campo de instrucciones especiales**: No se muestra correctamente en todos los dispositivos, dificultando la entrada de instrucciones específicas para cada producto.

2. **Problemas de funcionalidad de voz**:
   - **Resaltado de productos**: La función `highlightProductTool` no está funcionando correctamente para todos los productos. Específicamente, cuando el asistente menciona "Taco al Pastor", el producto no siempre se resalta visualmente en la interfaz.
   - **Entrada de datos por voz**: Los usuarios no pueden ingresar datos de contacto mediante voz de manera efectiva. La integración entre la herramienta `paymentInputTool` y el componente `OrderDetails` presenta fallos en el procesamiento de eventos.
   - **Feedback visual insuficiente**: Cuando los datos se ingresan por voz, falta retroalimentación visual clara que indique al usuario que sus datos han sido capturados correctamente.

3. **Problemas de integración**:
   - **Integración de herramientas de cliente**: Existen duplicaciones y posibles conflictos entre las implementaciones en `app/lib/clientTools.ts` y `app/lib/utils/clientTools.ts`, lo que causa comportamientos inconsistentes.
   - **Manejo de eventos de voz**: Los eventos personalizados (`voicePaymentInput`, `processPayment`, etc.) no siempre son capturados correctamente por los componentes correspondientes.
   - **Estado de formulario incompleto**: El sistema no valida correctamente cuándo todos los campos del formulario de contacto están completos, lo que puede llevar a envíos prematuros o bloqueos en el botón "Registrar Pedido".

4. **Errores técnicos**:
   - **Referencias a tipos inexistentes**: Algunos componentes hacen referencia a tipos que no están correctamente exportados o importados, causando errores de compilación.
   - **Inconsistencia en la estructura de datos**: La estructura de `OrderItem` varía entre componentes, causando problemas al transmitir información entre ellos.
   - **Manejo inadecuado de promesas**: Algunas funciones asíncronas no gestionan correctamente las promesas, lo que puede resultar en comportamientos impredecibles.

## Fases del Proyecto

### Fase 1: Desarrollo Inicial (Completada)
- Diseño de interfaz básica
- Implementación de estructura de componentes React
- Creación de servicios para gestión de pedidos
- Integración inicial del asistente de voz

### Fase 2: Mejoras de UX/UI (Completada)
- Implementación de animaciones y efectos visuales
- Mejora de la navegación horizontal
- Adición de efectos de sonido
- Mejora visual del carrito de compras
- Corrección del texto de copyright

### Fase 3: Optimización y Correcciones (En progreso)
- Corrección de problemas con la lectura de precios
- Mejora del desplazamiento del menú
- Visualización de nombres completos en el carrito
- Adición de animaciones y efectos sonoros

### Fase 4: Expansión de Funcionalidades (Pendiente)
- Implementación de sistema de usuarios
- Historial de pedidos
- Opciones de pago
- Gestión de preferencias
- Sistema de recomendaciones

## Mejoras Futuras

### Mejoras a Corto Plazo
1. **Correcciones visuales**:
   - Crear íconos específicos para cada tipo de producto (especialmente bebidas y extras)
   - Estandarizar el tamaño y estilo de los contenedores de productos
   - Mejorar la adaptabilidad a diferentes tamaños de pantalla

2. **Mejoras de usabilidad**:
   - Traducir todos los mensajes del sistema al español
   - Mejorar la precisión del asistente de voz para reconocimiento de pedidos
   - Optimizar la lectura de precios y cantidades

3. **Rendimiento**:
   - Optimizar la carga de recursos (imágenes, sonidos)
   - Implementar lazy loading para componentes y recursos

### Mejoras a Mediano Plazo
1. **Funcionalidades avanzadas**:
   - Sistema de usuarios y autenticación
   - Guardado de pedidos favoritos
   - Opciones de personalización avanzada de productos
   - Historial de pedidos con opción de repetir pedidos anteriores

2. **Integración con sistemas de pago**:
   - Implementación de pasarela de pagos
   - Múltiples métodos de pago
   - Facturación electrónica

3. **Experiencia de voz mejorada**:
   - Personalización de la voz del asistente
   - Mejora del reconocimiento de lenguaje natural
   - Soporte para pedidos más complejos mediante voz

### Mejoras a Largo Plazo
1. **Expansión del sistema**:
   - Aplicación móvil nativa
   - Integración con sistemas de delivery
   - Panel de administración para gestión de menú y pedidos

2. **Inteligencia artificial avanzada**:
   - Recomendaciones personalizadas basadas en historial
   - Predicción de pedidos frecuentes
   - Optimización de precios basada en demanda

3. **Expansión multilenguaje**:
   - Soporte para múltiples idiomas
   - Reconocimiento de voz en diferentes dialectos
   - Localización completa de la aplicación

## Plan de Acción Inmediato (Junio 2024)

1. **Arreglar la visualización del contenedor de detalles del pedido**:
   - Revisar y ajustar los estilos CSS responsivos en `OrderDetails.tsx`
   - Implementar un sistema flexible de alturas máximas basado en el viewport
   - Garantizar que todos los elementos sean visibles sin necesidad de desplazamiento excesivo

2. **Corregir la funcionalidad de resaltado de productos**:
   - Consolidar las implementaciones de `highlightProductTool` para evitar duplicaciones
   - Asegurar que la búsqueda de productos por nombre o ID sea más robusta y tolerante a variaciones
   - Mejorar el feedback visual cuando un producto es resaltado

3. **Solucionar la entrada de datos por voz**:
   - Refinar la integración entre `paymentInputTool` y `OrderDetails`
   - Mejorar la normalización de campos para asegurar que los datos se asignen correctamente
   - Implementar retroalimentación visual más clara cuando se completan campos por voz

4. **Unificar el manejo de tipos y servicios**:
   - Consolidar las definiciones de tipos en un solo lugar
   - Eliminar duplicaciones en servicios cliente y establecer una estructura clara
   - Mejorar la documentación para facilitar el mantenimiento futuro

## Cronograma Tentativo

- **Q2 2024**: Completar correcciones visuales y mejoras de usabilidad
- **Q3 2024**: Implementar sistema de usuarios y opciones de personalización
- **Q4 2024**: Integrar sistemas de pago y mejorar experiencia de voz
- **Q1-Q2 2025**: Desarrollo de aplicación móvil y panel de administración
- **Q3-Q4 2025**: Implementación de sistemas de IA avanzada y personalización

## Conclusiones

El proyecto "Taquería El Buen Sabor" ha avanzado significativamente en la implementación de una experiencia de usuario moderna que combina interfaces visuales y de voz. Las próximas fases se enfocarán en refinar la experiencia actual, corregir los problemas visuales identificados y expandir las funcionalidades para ofrecer una plataforma más completa y sofisticada para los clientes de la taquería.

Los problemas actuales más urgentes están centrados en la experiencia de usuario, particularmente en la visualización correcta de los detalles del pedido, el resaltado efectivo de productos mencionados por voz, y la capacidad de los usuarios para proporcionar datos de contacto mediante comandos de voz. La resolución de estos problemas es prioritaria para avanzar a las siguientes fases del proyecto.
