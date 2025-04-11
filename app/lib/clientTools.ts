import { ClientToolImplementation } from 'ultravox-client';

export const updateOrderTool: ClientToolImplementation = (parameters) => {
  const { ...orderData } = parameters;
  
  // Validar que estamos en el navegador
  if (typeof window !== "undefined") {
    console.log("[updateOrderTool] Dispatching event with order data:", orderData.orderDetailsData);
    
    try {
      // Convertir a JSON string si es necesario
      const data = typeof orderData.orderDetailsData === 'string' 
        ? orderData.orderDetailsData 
        : JSON.stringify(orderData.orderDetailsData);
      
      // Crear y disparar evento
      const event = new CustomEvent("orderDetailsUpdated", {
        detail: data,
      });
      window.dispatchEvent(event);
      
      // Guardar en localStorage para persistencia
      localStorage.setItem('currentOrder', data);
      
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