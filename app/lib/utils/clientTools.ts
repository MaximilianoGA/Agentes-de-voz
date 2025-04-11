import { ClientToolImplementation } from 'ultravox-client';
import { OrderItem } from '../types';
import { menuItems } from '../data/menu-items';
import { addItemToOrder, getCurrentOrder, clearCurrentOrder, updateItemQuantity } from '../services/orderService';

/**
 * Herramienta para actualizar los detalles del pedido.
 * Procesa los datos del pedido y utiliza el servicio de pedidos para actualizar el estado.
 */
export const updateOrderTool: ClientToolImplementation = (params) => {
  console.log("[updateOrderTool] Llamada recibida con parámetros:", JSON.stringify(params, null, 2));
  
  if (typeof window === "undefined") {
    console.warn("[updateOrderTool] No estamos en un entorno de navegador");
    return "No se puede actualizar el pedido en este entorno.";
  }
  
  // Implementar un timeout para la operación completa
  const timeoutPromise = new Promise<string>((resolve) => {
    setTimeout(() => {
      resolve("Operación completada con timeout de seguridad");
    }, 5000); // 5 segundos de timeout de seguridad
  });
  
  const operationPromise = new Promise<string>((resolve) => {
    try {
      console.log("[updateOrderTool] Iniciando procesamiento del pedido");
      
      if (!params || typeof params !== 'object') {
        console.error("[updateOrderTool] Error: Parámetros inválidos:", params);
        resolve("Error: Parámetros de pedido inválidos");
        return;
      }
      
      // Extraer datos del pedido
      const { orderData, orderDetailsData, ...rest } = params as any;
      
      // Validar estructura de datos de pedido
      let orderItems: any[] = [];
      
      // Manejar diferentes formatos para orderDetailsData
      if (orderDetailsData) {
        if (typeof orderDetailsData === 'string') {
          try {
            orderItems = JSON.parse(orderDetailsData);
          } catch (parseError) {
            console.error("[updateOrderTool] Error al parsear orderDetailsData como JSON:", parseError);
            orderItems = [];
          }
        } else if (Array.isArray(orderDetailsData)) {
          orderItems = orderDetailsData;
        } else {
          console.warn("[updateOrderTool] orderDetailsData en formato inesperado:", typeof orderDetailsData);
          orderItems = [];
        }
      } else if (orderData) {
        // Extraer items del orderData
        if (Array.isArray(orderData)) {
          orderItems = orderData;
        } else if (orderData.items && Array.isArray(orderData.items)) {
          orderItems = orderData.items;
        } else if (typeof orderData === 'object') {
          orderItems = [orderData];
        } else if (typeof orderData === 'string') {
          try {
            const parsedData = JSON.parse(orderData);
            
            if (Array.isArray(parsedData)) {
              orderItems = parsedData;
            } else if (parsedData.items && Array.isArray(parsedData.items)) {
              orderItems = parsedData.items;
            } else {
              orderItems = [parsedData];
            }
          } catch (parseError) {
            console.error("[updateOrderTool] Error al parsear orderData como JSON:", parseError);
            orderItems = [];
          }
        } else {
          console.warn("[updateOrderTool] orderData en formato inesperado:", typeof orderData);
          orderItems = [];
        }
      } else {
        // Buscar ítems en cualquier parámetro que pueda contenerlos
        for (const key in rest) {
          const value = rest[key];
          
          if (Array.isArray(value)) {
            orderItems = value;
            break;
          } else if (value && typeof value === 'object' && value.items && Array.isArray(value.items)) {
            orderItems = value.items;
            break;
          }
        }
      }
      
      // Si no hay ítems, retornar error
      if (orderItems.length === 0) {
        console.warn("[updateOrderTool] No se encontraron ítems en los parámetros");
        resolve("No se encontraron ítems en los parámetros");
        return;
      }
      
      // Procesar cada ítem y actualizar el pedido usando el servicio
      try {
        // Limpiar el pedido actual si se especifica
        const shouldClear = rest.clearOrder === true || rest.clear === true;
        if (shouldClear) {
          clearCurrentOrder();
        }
        
        // Obtener el pedido actual o crear uno nuevo
        const currentOrder = getCurrentOrder();
        
        // Procesar cada ítem
        for (const item of orderItems) {
          const id = item.id || getItemIdFromName(item.name);
          const quantity = typeof item.quantity === 'number' ? Math.max(1, Math.min(10, item.quantity)) : 1;
          const specialInstructions = typeof item.specialInstructions === 'string' ? item.specialInstructions : undefined;
          
          // Actualizar ítem en el pedido
          addItemToOrder(id, quantity, specialInstructions);
        }
        
        // Obtener el pedido actualizado
        const updatedOrder = getCurrentOrder();
        
        console.log("[updateOrderTool] Pedido actualizado correctamente:", updatedOrder);
        resolve(`Pedido actualizado. Total: ${updatedOrder?.totalAmount || 0} MXN`);
      } catch (error) {
        console.error("[updateOrderTool] Error al actualizar el pedido:", error);
        resolve(`Error al actualizar el pedido: ${error}`);
      }
    } catch (error) {
      console.error("[updateOrderTool] Error crítico durante el procesamiento:", error);
      resolve("Error crítico al procesar los detalles del pedido.");
    }
  });
  
  // Devolver la primera promesa que se resuelva (operación o timeout)
  return Promise.race([operationPromise, timeoutPromise]);
};

/**
 * Herramienta para resaltar un producto en el menú sin agregarlo al pedido.
 * Envía un evento personalizado que será capturado por el componente MenuTaqueria.
 */
export const highlightProductTool: ClientToolImplementation = (params) => {
  console.log("[highlightProductTool] Llamada recibida con parámetros:", JSON.stringify(params, null, 2));
  
  if (typeof window === "undefined") {
    console.warn("[highlightProductTool] No estamos en un entorno de navegador");
    return "No se puede resaltar el producto en este entorno.";
  }
  
  try {
    // Extraer el ID del producto del parámetro
    const { productId: rawProductId, product } = params as any;
    
    // Intentar obtener el ID del producto de varias formas
    let productId = rawProductId;
    
    // Si no hay ID pero sí hay nombre de producto, intentar encontrar el ID
    if (!productId && product) {
      productId = getItemIdFromName(product);
    }
    
    if (!productId) {
      console.error("[highlightProductTool] Error: ID de producto no proporcionado");
      return "Error: ID de producto no proporcionado";
    }
    
    console.log(`[highlightProductTool] Resaltando producto: ${productId}`);
    
    // Disparar el evento highlightProduct
    const event = new CustomEvent("highlightProduct", {
      detail: { productId }
    });
    
    window.dispatchEvent(event);
    console.log("[highlightProductTool] Evento highlightProduct despachado correctamente");
    
    return `Producto ${productId} resaltado correctamente.`;
  } catch (error) {
    console.error("[highlightProductTool] Error al resaltar producto:", error);
    return "Error al resaltar el producto.";
  }
}; 

/**
 * Función auxiliar para obtener el ID de un producto a partir de su nombre
 */
function getItemIdFromName(name: string): string {
  if (!name) return 'unknown-product';
  
  const nameLower = name.toLowerCase();
  
  // Buscar en el catálogo
  const catalogItem = menuItems.find(item => 
    item.name.toLowerCase() === nameLower
  );
  
  if (catalogItem) {
    return catalogItem.id;
  }
  
  // Si no se encuentra, generar un ID basado en el nombre
  return 'product-' + nameLower
    .replace(/\s+/g, '-')       // Reemplazar espacios con guiones
    .replace(/[^a-z0-9-]/g, '') // Eliminar caracteres especiales
    .replace(/-+/g, '-');       // Evitar guiones múltiples
} 