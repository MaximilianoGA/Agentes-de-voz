# Agente Restaurante - Asistente Virtual para Taquerías 🌮

Un asistente virtual conversacional avanzado para taquerías, impulsado por Ultravox AI, que permite a los clientes realizar pedidos mediante voz e interacción directa con la interfaz. El agente integra funcionalidades de voz a texto, texto a voz, y un sistema visual de pedidos para ofrecer una experiencia de usuario completa.

![Taco Bot Demo](public/taco-logo.svg)

## 🚀 Características

- **Interfaz conversacional bilingüe:** Interactúa con los clientes en español o inglés a través de voz.
- **Menú interactivo visual:** Muestra productos categorizados por tipo.
- **Sistema de pedidos dinámico:** Permite añadir productos mediante voz o interfaz.
- **Herramientas personalizadas:** Integración con actions para actualizar pedidos, resaltar productos y procesar pagos.
- **Tema personalizable:** Estilizado con colores de la bandera mexicana y totalmente adaptable.
- **Diseño responsive:** Funciona perfectamente en dispositivos móviles y de escritorio.
- **Feedback audiovisual:** Incluye animaciones de confeti y sonidos para mejorar la experiencia del usuario.
- **Proceso de pago simplificado:** Sin formularios complejos, solo un botón para confirmar el pedido.

## 🛠️ Tecnologías

- [Next.js 14](https://nextjs.org/) - Framework React con App Router
- [React 18](https://reactjs.org/) - Biblioteca de interfaz de usuario
- [Tailwind CSS](https://tailwindcss.com/) - Framework de CSS utility-first
- [TypeScript](https://www.typescriptlang.org/) - Tipado estático para JavaScript
- [Ultravox AI](https://ultravox.ai/) - API para voz a texto y texto a voz
- [Canvas Confetti](https://github.com/catdad/canvas-confetti) - Efectos visuales de celebración

## 📋 Requisitos Previos

- [Node.js](https://nodejs.org/) (v18.0.0 o superior)
- [npm](https://www.npmjs.com/) o [pnpm](https://pnpm.io/) (recomendado)
- API Key de Ultravox AI (obtenible en [dashboard.ultravox.ai](https://dashboard.ultravox.ai))

## 🔧 Instalación

1. **Clonar el repositorio**

```bash
git clone https://github.com/rodrigodelatorre-ai/Agentes-de-voz.git
cd Agentes-de-voz/agenterestaurante
```

2. **Instalar dependencias**

Con npm:
```bash
npm install
```

O con pnpm (recomendado):
```bash
pnpm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:

```
ULTRAVOX_API_KEY=tu_api_key_aquí
```

4. **Iniciar el servidor de desarrollo**

```bash
npm run dev
# o
pnpm dev
```

5. **Acceder a la aplicación**

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🖥️ Uso

1. **Iniciar una conversación**: Haz clic en el botón "Iniciar llamada" para activar el asistente.
2. **Realizar pedidos por voz**: Habla con el asistente y menciona los productos que deseas.
3. **Usar la interfaz visual**: Navega por el menú visual y añade productos directamente.
4. **Finalizar pedido**: Indica al asistente que deseas proceder con el pago o usa el botón "Confirmar Pedido".
5. **Disfrutar de la experiencia**: Al confirmar el pedido, se mostrará una animación de confeti y sonará un efecto de éxito.

## 🔄 Personalizando el Agente

### Modificar el Menú

El menú se configura en `app/components/MenuTaqueria.tsx`. Puedes personalizar:

```typescript
// Ejemplo para añadir un nuevo producto
const menuItems: MenuItem[] = [
  // ... productos existentes
  {
    id: 'taco-nuevo',
    name: 'Taco Especial',
    description: 'Descripción del nuevo taco',
    price: 25.00,
    image: '🌮',
    category: 'tacos'
  },
  // ... más productos
];
```

### Personalizar el Prompt del Sistema

El comportamiento del agente se configura en `app/demo-config.ts`:

```typescript
// Modificar el prompt del sistema para cambiar el comportamiento del agente
function getSystemPrompt() {
  let sysPrompt: string;
  sysPrompt = `
  # Configuración del Sistema de Pedidos - [Tu Nombre de Restaurante]
  
  ## Rol del Agente
  - Nombre: [Nombre de tu asistente]
  - Contexto: [Descripción de tu restaurante]
  
  // ... continúa configurando el comportamiento
  `;
  
  // No modificar esta parte
  sysPrompt = sysPrompt.replace(/"/g, '\"').replace(/\n/g, '\n');
  return sysPrompt;
}
```

### Cambiar los Colores y Tema

Los colores principales se definen en `app/globals.css`:

```css
:root {
  /* Paleta de colores principales */
  --taco-primary: #006341;    /* Verde (bandera mexicana) */
  --taco-secondary: #CE1126;  /* Rojo (bandera mexicana) */
  --taco-accent: #FFFFFF;     /* Blanco (bandera mexicana) */
  --taco-dark: #003821;       /* Verde oscuro */
  --taco-light: #FFF9E5;      /* Color claro */
  --taco-highlight: #FFDF00;  /* Amarillo dorado (acento) */
}
```

### Personalizar Efectos de Confeti y Sonidos

Los efectos de celebración se pueden personalizar en `public/confetti.js`:

```javascript
// Personalizar opciones de confeti
window.confetti({
  particleCount: 200,           // Más partículas
  spread: 90,                   // Mayor dispersión
  origin: { y: 0.6 },           // Origen del confeti
  colors: ['#006341', '#FFFFFF', '#CE1126'] // Colores mexicanos
});
```

Para cambiar el sonido de éxito, simplemente reemplaza el archivo en `public/sounds/success.mp3`.

### Añadir Nuevas Funciones del Agente

Las herramientas personalizadas se definen en `lib/clientTools.ts` y se registran en `lib/callFunctions.ts`:

```typescript
// Ejemplo para añadir una nueva herramienta
export function miNuevaHerramienta(params: any) {
  // Implementación de la función
  console.log("Ejecutando mi herramienta personalizada:", params);
  // Lógica de negocio...
  return {
    success: true,
    message: "Operación completada"
  };
}

// Luego registrarla en demo-config.ts en el array selectedTools
const selectedTools: SelectedTool[] = [
  // Herramientas existentes...
  {
    "temporaryTool": {
      "modelToolName": "miNuevaHerramienta",
      "description": "Descripción de la nueva herramienta personalizada",
      "dynamicParameters": [
        // Definir parámetros que acepta la herramienta
      ],
      "client": {}
    }
  }
]
```

## 🔍 Estructura del Proyecto

```
/
├── app/                # Código de la aplicación Next.js
│   ├── api/            # API routes para comunicación con Ultravox
│   ├── components/     # Componentes reutilizables
│   ├── globals.css     # Estilos globales y variables CSS
│   ├── page.tsx        # Página principal
│   └── demo-config.ts  # Configuración del asistente
├── lib/                # Utilidades y funciones
│   ├── callFunctions.ts # Funciones para manejo de llamadas
│   ├── clientTools.ts   # Implementaciones de herramientas
│   └── types.ts         # Definiciones de TypeScript
├── public/             # Recursos estáticos (imágenes, sonidos)
│   ├── sounds/         # Archivos de audio para efectos
│   ├── confetti.js     # Script para animaciones de confeti
│   └── taco-logo.svg   # Logo de la taquería
├── .env.local          # Variables de entorno (crear localmente)
├── package.json        # Dependencias y scripts
└── README.md           # Documentación principal
```

## 📝 Consejos para Desarrollo

1. **Modo Depuración**: Añade `?showDebugMessages=true` a la URL para ver mensajes de depuración.
2. **Visualización de Transcripción**: Añade `?showUserTranscripts=true` para ver las transcripciones del usuario.
3. **Cambiar el Modelo**: Usa `?model=nombre-del-modelo` para cambiar el modelo de Ultravox usado.

## 🔄 Ciclo de Vida de una Llamada

1. El usuario inicia una llamada (`startCall` en `callFunctions.ts`)
2. Se crea una sesión de Ultravox (`UltravoxSession`)
3. Se registran las herramientas (`registerToolImplementation`)
4. El agente procesa la entrada de voz y llama a las herramientas según sea necesario
5. Las herramientas actualizan la interfaz (estado del pedido, resaltado de productos, etc.)
6. El usuario confirma el pedido y se muestran efectos audiovisuales de celebración
7. El usuario finaliza la llamada (`endCall` en `callFunctions.ts`)

## 🛣️ Roadmap

- [ ] Soporte para múltiples idiomas adicionales
- [ ] Integración con sistemas reales de pago
- [ ] Generación dinámica de imágenes para los productos
- [ ] Sistema de fidelización de clientes
- [ ] Modo offline con capacidades limitadas

## 🤝 Contribuir

Las contribuciones son bienvenidas. Para cambios importantes:

1. Abre un issue para discutir los cambios propuestos
2. Haz fork del repositorio
3. Crea una nueva rama (`git checkout -b feature/amazing-feature`)
4. Haz commit de tus cambios (`git commit -m 'Add some amazing feature'`)
5. Haz push a la rama (`git push origin feature/amazing-feature`)
6. Abre un Pull Request

## 📃 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 📧 Contacto

Rodrigo de la Torre - [@rodrigodelatorre](https://twitter.com/rodrigodelatorre) - email@example.com

Project Link: [https://github.com/rodrigodelatorre-ai/Agentes-de-voz](https://github.com/rodrigodelatorre-ai/Agentes-de-voz)
