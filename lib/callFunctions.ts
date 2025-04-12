'use client';
import { UltravoxSession, UltravoxSessionStatus, Transcript, UltravoxExperimentalMessageEvent, Role } from 'ultravox-client';
import { JoinUrlResponse, CallConfig, OrderDetailsData, OrderItem } from '@/lib/types';
import { updateOrderTool, highlightProductTool, processPaymentTool } from '@/lib/clientTools';

// Definición del tipo para eventos de invocación de agente
interface CustomEvent extends Event {
  detail?: any;
}

let uvSession: UltravoxSession | null = null;
const debugMessages: Set<string> = new Set(["debug"]);
let wsConnection: WebSocket | null = null;

// Estado global actual del pedido
export let currentOrder = {
  items: [] as any[],
  total: 0,
};

// Event emitter para manejo de actualizaciones
export const orderUpdateEvent = new EventTarget();

interface CallCallbacks {
  onStatusChange(status: UltravoxSessionStatus | string): void;
  onTranscriptChange?(transcript: Transcript[]): void;
  onDebugMessage?(message: UltravoxExperimentalMessageEvent): void;
}

// Toggle para mutear/desmutear micrófono según rol
export const toggleMute = (role: Role) => {
  if (!uvSession) {
    console.warn("[toggleMute] No hay una sesión activa");
    return;
  }
  try {
    if (role === Role.USER) {
      const isMuted = uvSession.isMicMuted;
      isMuted ? uvSession.unmuteMic() : uvSession.muteMic();
      console.log(`[toggleMute] Micrófono ${!isMuted ? 'muteado' : 'desmuteado'}`);
    } else {
      const isMuted = uvSession.isSpeakerMuted;
      isMuted ? uvSession.unmuteSpeaker() : uvSession.muteSpeaker();
      console.log(`[toggleMute] Altavoz ${!isMuted ? 'muteado' : 'desmuteado'}`);
    }
  } catch (error) {
    console.error("[toggleMute] Error al cambiar estado de mute:", error);
  }
};

/**
 * Maneja la invocación de herramientas desde el agente
 */
export function handleToolInvocation(event: CustomEvent) {
  try {
    console.log("[handleToolInvocation] Evento de invocación recibido:", event);
    
    // Extraer la herramienta y sus parámetros del evento
    const toolData = event.detail || {};
    let tool = toolData.tool;
    let parameters = toolData.parameters;
    
    // Si el evento tiene un formato diferente, intentar extraer de otra manera
    if (!tool && toolData.toolName) {
      tool = toolData.toolName;
      parameters = toolData.parameters || toolData.args;
    }
    
    if (!tool) {
      console.warn("[handleToolInvocation] No se especificó ninguna herramienta en el evento de invocación:", toolData);
      return;
    }
    
    console.log(`[handleToolInvocation] Invocando herramienta: ${tool}`, parameters);
    
    switch(tool) {
      case 'updateOrder':
        try {
          console.log("[handleToolInvocation] Ejecutando updateOrderTool");
          const result = updateOrderTool(parameters);
          console.log("[handleToolInvocation] Resultado de updateOrderTool:", result);
        } catch (error) {
          console.error("[handleToolInvocation] Error al actualizar el pedido:", error);
        }
        break;
        
      case 'highlightProduct':
        try {
          console.log("[handleToolInvocation] Ejecutando highlightProductTool");
          const result = highlightProductTool(parameters);
          console.log("[handleToolInvocation] Resultado de highlightProductTool:", result);
        } catch (error) {
          console.error("[handleToolInvocation] Error al resaltar el producto:", error);
        }
        break;
        
      case 'processPayment':
        try {
          console.log("[handleToolInvocation] Ejecutando processPaymentTool");
          const result = processPaymentTool(parameters);
          console.log("[handleToolInvocation] Resultado de processPaymentTool:", result);
        } catch (error) {
          console.error("[handleToolInvocation] Error al procesar el pago:", error);
        }
        break;
        
      default:
        console.warn(`[handleToolInvocation] Herramienta desconocida: ${tool}`);
    }
  } catch (error) {
    console.error("[handleToolInvocation] Error al procesar la invocación de herramienta:", error);
  }
}

async function createCall(callConfig: CallConfig, showDebugMessages?: boolean): Promise<JoinUrlResponse> {
  try {
    if(showDebugMessages) {
      console.log(`Using model ${callConfig.model}`);
    }

    const response = await fetch(`/api/ultravox`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...callConfig }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    const data: JoinUrlResponse = await response.json();

    if(showDebugMessages) {
      console.log(`Call created. Join URL: ${data.joinUrl}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error creating call:', error);
    throw error;
  }
}

export async function startCall(callbacks: CallCallbacks, callConfig: CallConfig, showDebugMessages?: boolean): Promise<void> {
  const callData = await createCall(callConfig, showDebugMessages);
  const joinUrl = callData.joinUrl;

  // Resetear el pedido actual
  currentOrder = {
    items: [],
    total: 0
  };
  
  // Emitir evento de reseteo del pedido
  if (typeof window !== "undefined") {
    // Limpiar localStorage
    localStorage.removeItem('currentOrder');
    // Despachar evento de fin de llamada para resetear componentes
    window.dispatchEvent(new CustomEvent('callEnded'));
    
    console.log("[startCall] Pedido reseteado");
  }

  try {
    console.log("Iniciando llamada...");
    
    // Configurar manejo de escucha para eventos de herramientas
    if (typeof window !== "undefined") {
      window.addEventListener('tool-invocation', handleToolInvocation);
      console.log("[startCall] Listener para eventos tool-invocation registrado");
    }
    
    // Inicializar sesión con las herramientas
    uvSession = new UltravoxSession({ experimentalMessages: debugMessages });
    
    // Registrar herramientas del cliente
    console.log("[startCall] Registrando herramientas del cliente...");
    
    try {
      console.log("[startCall] Registrando herramienta updateOrder...");
      uvSession.registerToolImplementation("updateOrder", updateOrderTool);
      console.log("[startCall] Herramienta updateOrder registrada exitosamente");
      
      console.log("[startCall] Registrando herramienta highlightProduct...");
      uvSession.registerToolImplementation("highlightProduct", highlightProductTool);
      console.log("[startCall] Herramienta highlightProduct registrada exitosamente");
      
      console.log("[startCall] Registrando herramienta processPayment...");
      uvSession.registerToolImplementation("processPayment", processPaymentTool);
      console.log("[startCall] Herramienta processPayment registrada exitosamente");
    } catch (toolError) {
      console.error("[startCall] Error al registrar herramientas:", toolError);
      throw new Error("Error al registrar herramientas: " + (toolError instanceof Error ? toolError.message : String(toolError)));
    }
    
    // Configurar handlers de eventos
    uvSession.addEventListener('status', (event) => {
      console.log(`[startCall] Estado de llamada: ${uvSession?.status}`);
      if (uvSession?.status) {
        callbacks.onStatusChange(uvSession.status);
      }
    });
    
    uvSession.addEventListener('transcripts', () => {
      if (uvSession?.transcripts && callbacks.onTranscriptChange) {
        callbacks.onTranscriptChange(uvSession.transcripts);
      }
    });
    
    uvSession.addEventListener('experimental_message', (msg) => {
      if (callbacks.onDebugMessage) {
        callbacks.onDebugMessage(msg as UltravoxExperimentalMessageEvent);
      }
    });
    
    // Registrar listener para herramientas
    uvSession.addEventListener('toolInvocation', handleToolInvocation);
    
    // Unirse a la llamada
    uvSession.joinCall(joinUrl);
    console.log('[startCall] Llamada iniciada:', uvSession.status);

  } catch (error) {
    console.error("Error al unirse a la llamada:", error);
    throw new Error("Error de unión: " + (error instanceof Error ? error.message : String(error)));
  }
}

export function endCall(): void {
  if (!uvSession) {
    console.warn("[endCall] No hay sesión activa para finalizar");
    return;
  }

  try {
    // Limpiar listeners de eventos
    if (typeof window !== "undefined") {
      window.removeEventListener('tool-invocation', handleToolInvocation);
      console.log("[endCall] Listener para eventos tool-invocation removido");
      
      // Eliminar también el handler de uvSession si existe
      if (uvSession) {
        try {
          uvSession.removeEventListener('toolInvocation', handleToolInvocation);
          console.log("[endCall] Removido event listener toolInvocation de la sesión");
        } catch (listenerError) {
          console.warn("[endCall] Error al remover listener de la sesión:", listenerError);
        }
      }
      
      // Resetear pedido
      localStorage.removeItem('currentOrder');
      localStorage.removeItem('orderDetails');
      window.dispatchEvent(new CustomEvent('callEnded'));
      console.log("[endCall] Pedido reseteado y evento callEnded enviado");
    }
    
    // Finalizar sesión
    uvSession.leaveCall();
    console.log("[endCall] Llamada finalizada correctamente");
    
    // Resetear estado
    uvSession = null;
    currentOrder = {
      items: [],
      total: 0
    };
    
    console.log("[endCall] Estado global reseteado");
  } catch (error) {
    console.error("[endCall] Error al finalizar la llamada:", error);
    
    // Intentar limpiar todo lo posible incluso si hubo error
    uvSession = null;
    currentOrder = { items: [], total: 0 };
    
    throw error;
  }
}

/**
 * Maneja las actualizaciones del pedido
 * @param orderData Datos del pedido
 */
export function handleOrderUpdate(orderData: any) {
  if (!orderData) {
    console.warn("Se recibieron datos de pedido vacíos");
    return;
  }

  try {
    // Actualizar el estado global del pedido
    currentOrder = {
      items: Array.isArray(orderData.items) ? [...orderData.items] : [],
      total: typeof orderData.total === 'number' ? orderData.total : 0
    };

    console.log("Estado global del pedido actualizado:", currentOrder);
    
    // Emitir evento para componentes que necesiten estar al tanto
    const orderUpdateEvent = new CustomEvent("orderUpdated", {
      detail: {
        order: currentOrder
      }
    });
    document.dispatchEvent(orderUpdateEvent);
    
    // Guardar en localStorage para persistencia
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentOrder', JSON.stringify(currentOrder));
    }
  } catch (error) {
    console.error("Error al manejar la actualización del pedido:", error);
  }
}

/**
 * Registra la implementación de herramientas para el asistente de voz.
 * @param toolRegistry El registro de herramientas que proporcionará Ultravox.
 */
export function registerToolImplementation(toolRegistry: any) {
  try {
    // Registrar herramienta para actualizar pedidos
    toolRegistry.registerToolImplementation("updateOrder", updateOrderTool);
    // Registrar herramienta para resaltar productos
    toolRegistry.registerToolImplementation("highlightProduct", highlightProductTool);
    // Registrar herramienta para procesar pagos
    toolRegistry.registerToolImplementation("processPayment", processPaymentTool);
  } catch (error) {
    console.error("Error al registrar las implementaciones de herramientas:", error);
  }
}