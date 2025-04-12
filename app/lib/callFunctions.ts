import { updateOrderTool, highlightProductTool, processPaymentTool, paymentInputTool, completePaymentTool } from './clientTools';

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
    // Registrar herramienta para ingresar datos de pago por voz
    toolRegistry.registerToolImplementation("paymentInput", paymentInputTool);
    // Registrar herramienta para completar proceso de pago por voz
    toolRegistry.registerToolImplementation("completePayment", completePaymentTool);
  } catch (error) {
    console.error("Error al registrar las implementaciones de herramientas:", error);
  }
} 