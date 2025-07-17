// Eliminamos las importaciones problemáticas y definimos los tipos localmente

// Definición local de tipos para reemplazar las importaciones
type ToolParams = any;
type ClientToolImplementation = (params: ToolParams) => Promise<string>;
import { OrderItem, MenuItem } from './types';
import { menuItems } from './data/menu-items';
import { addItemToOrder, getCurrentOrder, clearCurrentOrder, updateItemQuantity } from './services/orderService';

/**
 * Herramienta para resaltar visualmente un producto en el menú.
 * Despacha un evento 'highlightProduct' que la UI puede escuchar.
 */
export const highlightProductTool: ClientToolImplementation = (params) => {
  console.log("[highlightProductTool] Llamada recibida con parámetros:", JSON.stringify(params, null, 2));

  // Verificar que estamos en un entorno de navegador
  if (typeof window === 'undefined') {
    console.warn("[highlightProductTool] No estamos en un entorno de navegador");
    return "No se puede resaltar el producto en este entorno.";
  }

  // Extraer parámetros específicos, productId y productName
  const { productId, productName, ...rest } = params as { productId?: string; productName?: string; [key: string]: any };

  // Verificar que se proporcionó al menos un parámetro válido
  if (!productId && !productName) {
    console.warn("[highlightProductTool] Se requiere productId o productName");
    return 'Se requiere el ID o el nombre del producto para resaltarlo.';
  }

  // Buscar el producto en el menú
  // Asegurarse de que menuItems esté correctamente importado y disponible
  const product = menuItems.find((item: MenuItem) => {
    if (productId) {
      // Comparación robusta, considerando posibles diferencias de tipo
      return String(item.id) === String(productId);
    } else if (productName) {
      // Búsqueda insensible a mayúsculas/minúsculas y espacios
      return item.name.trim().toLowerCase().includes(productName.trim().toLowerCase());
    }
    return false;
  });

  // Si no se encuentra el producto, devolver mensaje de error
  if (!product) {
    console.warn(`[highlightProductTool] No se encontró el producto: ${productId || productName}`);
    return `No se encontró el producto llamado "${productName || productId}".`;
  }

  // Crear un evento personalizado para resaltar el producto
  try {
    const event = new CustomEvent('highlightProduct', {
      detail: {
        productId: product.id,
        name: product.name,
        categoryId: product.categoryId // Asegúrate de que categoryId exista en tu tipo MenuItem
      }
    });

    // Despachar el evento
    window.dispatchEvent(event);
    console.log(`[highlightProductTool] Evento highlightProduct despachado para: ${product.name}`);

    // Devolver mensaje de éxito para el agente
    return `Producto "${product.name}" resaltado correctamente.`;

  } catch (error) {
    console.error("[highlightProductTool] Error al despachar el evento:", error);
    return "Ocurrió un error al intentar resaltar el producto.";
  }
};

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

/**
 * Herramienta para procesar el pago del pedido actual.
 * Envía un evento personalizado que será capturado por el componente OrderDetails.
 */
export const processPaymentTool: ClientToolImplementation = (params) => {
  console.log("[processPaymentTool] Llamada recibida con parámetros:", JSON.stringify(params, null, 2));
  
  if (typeof window === "undefined") {
    console.warn("[processPaymentTool] No estamos en un entorno de navegador");
    return "No se puede procesar el pago en este entorno.";
  }
  
  // Verificar si hay un pedido actual
  const currentOrder = getCurrentOrder();
  if (!currentOrder || currentOrder.items.length === 0) {
    console.warn("[processPaymentTool] No hay pedido activo o está vacío");
    return "No hay pedido activo para procesar el pago.";
  }
  
  try {
    // Crear y disparar el evento de procesamiento de pago
    const event = new CustomEvent("processPayment", {
      detail: { 
        timestamp: new Date().toISOString(),
        orderId: currentOrder.id,
        totalAmount: currentOrder.totalAmount
      }
    });
    
    window.dispatchEvent(event);
    console.log("[processPaymentTool] Evento processPayment despachado correctamente");
    
    return `Procesamiento de pago iniciado para el pedido #${currentOrder.id}. Total: ${currentOrder.totalAmount} MXN`;
  } catch (error) {
    console.error("[processPaymentTool] Error al procesar el pago:", error);
    return "Error al procesar el pago del pedido.";
  }
};

/**
 * Herramienta para manejar comandos de voz para datos de contacto
 * Esta herramienta permite al asistente de voz enviar datos para rellenar
 * el formulario de contacto cuando el usuario los dicta verbalmente
 */
export const paymentInputTool: ClientToolImplementation = (params) => {
  console.log("[paymentInputTool] Llamada recibida con parámetros:", JSON.stringify(params, null, 2));
  
  if (typeof window === "undefined") {
    console.warn("[paymentInputTool] No estamos en un entorno de navegador");
    return "No se puede procesar datos de entrada en este entorno.";
  }

  try {
    // Extraer información de los parámetros
    const { field, value } = params as any;
    
    if (!field) {
      console.warn("[paymentInputTool] No se especificó campo");
      return "Se requiere especificar un campo (name, email, phone)";
    }

    // Normalizar el campo para asegurar consistencia
    let normalizedField = field.toLowerCase().trim();
    
    // Mapear campos en español a su versión interna si es necesario
    if (normalizedField === 'nombre' || normalizedField === 'clientname') normalizedField = 'name';
    if (normalizedField === 'correo' || normalizedField === 'email') normalizedField = 'email';
    if (normalizedField === 'teléfono' || normalizedField === 'telefono') normalizedField = 'phone';
    
    // Validar que el campo sea válido
    if (!['name', 'email', 'phone'].includes(normalizedField)) {
      console.warn(`[paymentInputTool] Campo no reconocido: ${field}`);
      return `Campo no reconocido: ${field}. Campos válidos: name, email, phone`;
    }

    // Si se proporciona un valor, procesarlo
    if (value) {
      // Crear evento personalizado para procesar la entrada de datos
      const event = new CustomEvent('voicePaymentInput', { 
        detail: { 
          field: normalizedField,
          value 
        } 
      });
      
      // Disparar el evento para que los componentes lo escuchen
      window.dispatchEvent(event);
      console.log(`[paymentInputTool] Evento voicePaymentInput despachado para campo ${normalizedField}`);
      
      return `Datos de ${normalizedField} ("${value}") recibidos y procesados`;
    } else {
      console.warn("[paymentInputTool] No se proporcionó valor para el campo");
      return `Se requiere proporcionar un valor para el campo ${normalizedField}`;
    }
  } catch (error) {
    console.error("[paymentInputTool] Error al procesar datos de pago:", error);
    return "Error al procesar datos de pago.";
  }
};

/**
 * Herramienta para completar el proceso de registro de pedido por voz
 * Esta herramienta permite al asistente de voz indicar que el usuario
 * quiere finalizar el registro con los datos ya ingresados
 */
export const completePaymentTool: ClientToolImplementation = (params) => {
  console.log("[completePaymentTool] Llamada recibida con parámetros:", JSON.stringify(params, null, 2));
  
  if (typeof window === "undefined") {
    console.warn("[completePaymentTool] No estamos en un entorno de navegador");
    return "No se puede completar el pago en este entorno.";
  }

  // Verificar si hay un pedido actual
  const currentOrder = getCurrentOrder();
  if (!currentOrder || currentOrder.items.length === 0) {
    console.warn("[completePaymentTool] No hay pedido activo o está vacío");
    return "No hay pedido activo para completar.";
  }
  
  try {
    // Crear evento personalizado para completar el pago
    const event = new CustomEvent('paymentCompleted', { 
      detail: { 
        success: true,
        orderId: currentOrder.id,
        timestamp: new Date().toISOString(),
        totalAmount: currentOrder.totalAmount
      } 
    });
    
    // Disparar el evento para que los componentes lo escuchen
    window.dispatchEvent(event);
    console.log("[completePaymentTool] Evento paymentCompleted despachado correctamente");
    
    return `Pedido #${currentOrder.id} registrado con éxito. Total: ${currentOrder.totalAmount} MXN`;
  } catch (error) {
    console.error("[completePaymentTool] Error al completar el registro:", error);
    return "Error al completar el registro del pedido.";
  }
};