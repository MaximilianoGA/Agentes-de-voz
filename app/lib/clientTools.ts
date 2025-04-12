import { ClientToolImplementation } from 'ultravox-client';

export const updateOrderTool: ClientToolImplementation = (parameters) => {
  const { ...orderData } = parameters;
  
  // Validar que estamos en el navegador
  if (typeof window !== "undefined") {
    console.log("[updateOrderTool] Dispatching event with order data:", orderData.orderDetailsData);
    
    try {
      // Asegurarse de que los datos sean un array válido
      interface OrderItem {
        name: string;
        quantity: number;
        price: number;
        specialInstructions?: string;
      }
      
      let orderItems: OrderItem[] = [];
      
      if (Array.isArray(orderData.orderDetailsData)) {
        // Validar y formatear cada ítem del pedido para garantizar que el precio sea un número
        orderItems = orderData.orderDetailsData.map(item => {
          return {
            name: item.name || "Producto sin nombre",
            quantity: Number(item.quantity) || 1,
            price: Number(item.price) || 0,
            specialInstructions: item.specialInstructions || ""
          };
        });
      } else if (typeof orderData.orderDetailsData === 'string') {
        try {
          const parsed = JSON.parse(orderData.orderDetailsData);
          if (Array.isArray(parsed)) {
            orderItems = parsed.map(item => {
              return {
                name: item.name || "Producto sin nombre",
                quantity: Number(item.quantity) || 1,
                price: Number(item.price) || 0,
                specialInstructions: item.specialInstructions || ""
              };
            });
          }
        } catch (e) {
          console.error("[updateOrderTool] Error parsing order data:", e);
          orderItems = [];
        }
      }
      
      // Convertir a JSON string
      const data = JSON.stringify(orderItems);
      
      // Crear y disparar evento
      const event = new CustomEvent("orderDetailsUpdated", {
        detail: data,
      });
      window.dispatchEvent(event);
      
      // Guardar en localStorage para persistencia
      localStorage.setItem('currentOrder', data);
      localStorage.setItem('orderDetails', data); // Guardar también con este nombre para compatibilidad
      
      return "Se ha actualizado el pedido correctamente.";
    } catch (error) {
      console.error("[updateOrderTool] Error dispatching event:", error);
      return "Error al actualizar el pedido: " + String(error);
    }
  } else {
    return "No se pudo actualizar el pedido (entorno no compatible).";
  }
};

/**
 * Herramienta para resaltar un producto específico del menú
 * Esta herramienta permite al agente de voz resaltar un producto para llamar la atención
 * del usuario sin añadirlo al carrito
 */
export const highlightProductTool: ClientToolImplementation = (parameters) => {
  const { productId } = parameters;
  
  // Validar que estamos en el navegador
  if (typeof window !== "undefined") {
    console.log("[highlightProductTool] Resaltando producto:", productId);
    
    try {
      // Crear y disparar evento de resaltado
      const event = new CustomEvent("highlightProduct", {
        detail: { productId },
      });
      window.dispatchEvent(event);
      
      return `Se ha resaltado el producto "${productId}" correctamente.`;
    } catch (error) {
      console.error("[highlightProductTool] Error al resaltar producto:", error);
      return "Error al resaltar el producto: " + String(error);
    }
  } else {
    return "No se pudo resaltar el producto (entorno no compatible).";
  }
};

// Variable para controlar si se está esperando respuesta del usuario
let isWaitingForUserResponse = false;
let waitingTimeout: NodeJS.Timeout | null = null;

/**
 * Función que detecta silencio y ejecuta una acción después del tiempo especificado
 * @param seconds Tiempo en segundos para esperar antes de proceder
 * @param callback Función a ejecutar después del tiempo de espera
 */
const waitForUserResponse = (seconds: number, callback: () => void) => {
  // Si ya estamos esperando, cancelamos el timeout anterior
  if (waitingTimeout) {
    clearTimeout(waitingTimeout);
  }
  
  isWaitingForUserResponse = true;
  console.log(`[waitForUserResponse] Esperando respuesta del usuario por ${seconds} segundos...`);
  
  // Notificar al UI que estamos esperando
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("waitingForUserResponse", {
      detail: { seconds }
    }));
  }
  
  // Configurar temporizador
  waitingTimeout = setTimeout(() => {
    isWaitingForUserResponse = false;
    console.log("[waitForUserResponse] Tiempo de espera finalizado, procediendo...");
    callback();
  }, seconds * 1000);
  
  return "Esperando respuesta del usuario...";
};

/**
 * Herramienta para iniciar el registro del pedido actual
 * Esta herramienta permite al asistente de voz iniciar el proceso de registro
 * cuando el usuario lo solicita verbalmente
 */
export const processPaymentTool: ClientToolImplementation = (parameters) => {
  // Validar que estamos en el navegador
  if (typeof window !== "undefined") {
    console.log("[processPaymentTool] Iniciando registro del pedido");
    
    try {
      // Implementar espera de 3 segundos para la confirmación del usuario
      return waitForUserResponse(3, () => {
        // Solo proceder si no se canceló durante la espera
        if (!isWaitingForUserResponse) {
          // Crear y disparar evento para mostrar el formulario de registro
          const event = new CustomEvent("processPayment", {
            detail: { timestamp: new Date().toISOString() }
          });
          window.dispatchEvent(event);
          
          console.log("[processPaymentTool] Registro iniciado después de espera de confirmación");
        }
      });
    } catch (error) {
      console.error("[processPaymentTool] Error al iniciar registro:", error);
      return "Error al iniciar el registro: " + String(error);
    }
  } else {
    return "No se pudo iniciar el registro (entorno no compatible).";
  }
};

/**
 * Herramienta para manejar comandos de voz para datos de contacto
 * Esta herramienta permite al asistente de voz enviar datos para rellenar
 * el formulario de contacto cuando el usuario los dicta verbalmente
 */
export const paymentInputTool: ClientToolImplementation = (parameters) => {
  // Validar que estamos en el navegador
  if (typeof window !== "undefined") {
    console.log("[paymentInputTool] Recibiendo datos de contacto por voz:", parameters);
    
    try {
      // Extraer datos
      const { field, value } = parameters;
      
      if (!field || !value) {
        return "Se requiere especificar campo (field) y valor (value).";
      }
      
      // Cancelar cualquier espera activa
      if (isWaitingForUserResponse && waitingTimeout) {
        clearTimeout(waitingTimeout);
        isWaitingForUserResponse = false;
      }
      
      // Crear y disparar evento para el formulario de contacto
      const event = new CustomEvent("voiceCommand", {
        detail: { 
          command: 'paymentInput',
          data: { field, value }
        }
      });
      window.dispatchEvent(event);
      
      return `Datos de contacto "${field}" recibidos correctamente: "${value}".`;
    } catch (error) {
      console.error("[paymentInputTool] Error al procesar datos de contacto:", error);
      return "Error al procesar los datos de contacto: " + String(error);
    }
  } else {
    return "No se pueden procesar datos de contacto (entorno no compatible).";
  }
};

/**
 * Herramienta para completar el proceso de registro de pedido por voz
 * Esta herramienta permite al asistente de voz indicar que el usuario
 * quiere finalizar el registro con los datos ya ingresados
 */
export const completePaymentTool: ClientToolImplementation = (parameters) => {
  // Validar que estamos en el navegador
  if (typeof window !== "undefined") {
    console.log("[completePaymentTool] Completando registro de pedido");
    
    try {
      // Implementar espera de 3 segundos para la confirmación final
      return waitForUserResponse(3, () => {
        // Solo proceder si no se canceló durante la espera
        if (!isWaitingForUserResponse) {
          // Crear y disparar evento para completar el registro
          const event = new CustomEvent("voiceCommand", {
            detail: { 
              command: 'completePayment',
              data: {} 
            }
          });
          window.dispatchEvent(event);
          
          console.log("[completePaymentTool] Registro completado después de espera de confirmación");
        }
      });
    } catch (error) {
      console.error("[completePaymentTool] Error al completar registro:", error);
      return "Error al completar el registro: " + String(error);
    }
  } else {
    return "No se puede completar el registro (entorno no compatible).";
  }
}; 