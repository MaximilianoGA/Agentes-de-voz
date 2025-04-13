import { updateOrderTool, processPaymentTool, paymentInputTool, completePaymentTool } from './utils/clientTools';

// Extender el tipo Window global para incluir las propiedades personalizadas
declare global {
  interface Window {
    antmlTools?: {
      registerToolImplementation: (toolName: string, implementation: any) => void;
    };
    playSound?: (sound: string, volume?: number) => void;
  }
}

/**
 * Registra las implementaciones de herramientas para el asistente de voz
 */
export const registerToolImplementation = () => {
  console.log("[startCall] Registrando herramientas...");
  
  try {
    // Registrar herramienta para actualizar pedido
    console.log("[startCall] Registrando herramienta updateOrder...");
    window.antmlTools?.registerToolImplementation('updateOrder', updateOrderTool);
    console.log("[startCall] Herramienta updateOrder registrada exitosamente");
    
    // Registrar herramienta para procesar pago
    console.log("[startCall] Registrando herramienta processPayment...");
    window.antmlTools?.registerToolImplementation('processPayment', processPaymentTool);
    console.log("[startCall] Herramienta processPayment registrada exitosamente");
    
    // Registrar herramienta para entrada de datos de pago
    console.log("[startCall] Registrando herramienta paymentInput...");
    window.antmlTools?.registerToolImplementation('paymentInput', paymentInputTool);
    console.log("[startCall] Herramienta paymentInput registrada exitosamente");
    
    // Registrar herramienta para completar pago
    console.log("[startCall] Registrando herramienta completePayment...");
    window.antmlTools?.registerToolImplementation('completePayment', completePaymentTool);
    console.log("[startCall] Herramienta completePayment registrada exitosamente");
  } catch (error) {
    console.error("[startCall] Error al registrar herramientas:", error);
  }
}; 