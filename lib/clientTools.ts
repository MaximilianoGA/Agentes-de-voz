import { ClientToolImplementation } from 'ultravox-client';

/**
 * Herramienta para actualizar los detalles del pedido.
 * Valida y procesa los datos del pedido antes de enviar el evento.
 */
export const updateOrderTool: ClientToolImplementation = (params) => {
  console.log("[updateOrderTool] Llamada recibida con parámetros:", JSON.stringify(params, null, 2));
  
  if (typeof window === "undefined") {
    console.warn("[updateOrderTool] No estamos en un entorno de navegador, no se puede actualizar el pedido");
    return "Detalles del pedido procesados, pero no se pueden mostrar en este entorno.";
  }
  
  // Implementar un timeout para la operación completa
  const timeoutPromise = new Promise<string>((resolve) => {
    setTimeout(() => {
      resolve("Operación completada con timeout de seguridad");
    }, 5000); // 5 segundos de timeout de seguridad
  });
  
  const operationPromise = new Promise<string>((resolve) => {
    try {
      console.log("[updateOrderTool] Iniciando procesamiento de la orden");
      
      if (!params || typeof params !== 'object') {
        console.error("[updateOrderTool] Error: Parámetros inválidos:", params);
        resolve("Error: Parámetros de pedido inválidos");
        return;
      }
      
      console.log("[updateOrderTool] Extrayendo datos de la orden");
      
      // Extraer datos del pedido
      const { orderData, orderDetailsData, ...rest } = params as any;
      
      console.log("[updateOrderTool] Datos extraídos:", {
        orderData: orderData,
        orderDetailsData: orderDetailsData,
        restParams: rest
      });
      
      // Validar estructura de datos de pedido
      let orderItems: any[] = [];
      
      // Manejar diferentes formatos para orderDetailsData
      if (orderDetailsData) {
        console.log("[updateOrderTool] Usando orderDetailsData explícito");
        
        if (typeof orderDetailsData === 'string') {
          try {
            // Intentar parsear si es un string JSON
            console.log("[updateOrderTool] Parseando orderDetailsData de string JSON");
            orderItems = JSON.parse(orderDetailsData);
          } catch (parseError) {
            console.error("[updateOrderTool] Error al parsear orderDetailsData como JSON:", parseError);
            orderItems = []; // Reset en caso de error
          }
        } else if (Array.isArray(orderDetailsData)) {
          console.log("[updateOrderTool] orderDetailsData es un array");
          orderItems = orderDetailsData;
        } else {
          console.warn("[updateOrderTool] orderDetailsData en formato inesperado:", typeof orderDetailsData);
          orderItems = [];
        }
      } else if (orderData) {
        console.log("[updateOrderTool] Usando orderData");
        
        // Extraer items del orderData
        if (Array.isArray(orderData)) {
          console.log("[updateOrderTool] orderData es un array");
          orderItems = orderData;
        } else if (orderData.items && Array.isArray(orderData.items)) {
          console.log("[updateOrderTool] Extrayendo items de orderData.items");
          orderItems = orderData.items;
        } else if (typeof orderData === 'object') {
          console.log("[updateOrderTool] orderData es un objeto, convirtiéndolo a array de un elemento");
          orderItems = [orderData];
        } else if (typeof orderData === 'string') {
          try {
            // Intentar parsear si es un string JSON
            console.log("[updateOrderTool] Parseando orderData de string JSON");
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
            orderItems = []; // Reset en caso de error
          }
        } else {
          console.warn("[updateOrderTool] orderData en formato inesperado:", typeof orderData);
          orderItems = [];
        }
      } else {
        // Buscar ítems en cualquier parámetro que pueda contenerlos
        console.log("[updateOrderTool] Buscando datos de orden en cualquier parámetro");
        
        for (const key in rest) {
          const value = rest[key];
          
          if (Array.isArray(value)) {
            console.log(`[updateOrderTool] Encontrado array en params.${key}`);
            orderItems = value;
            break;
          } else if (value && typeof value === 'object' && value.items && Array.isArray(value.items)) {
            console.log(`[updateOrderTool] Encontrado objeto con items en params.${key}`);
            orderItems = value.items;
            break;
          }
        }
      }
      
      // Validar y limpiar cada ítem del pedido
      const validatedItems = orderItems.map((item, index) => {
        console.log(`[updateOrderTool] Procesando ítem ${index}:`, item);
        
        // Validar y limitar la cantidad
        let quantity = 1; // Valor predeterminado
        
        if (typeof item.quantity === 'number' && !isNaN(item.quantity)) {
          // Limitar a un máximo de 10 por ítem para prevenir errores
          if (item.quantity > 10) {
            console.warn(`[updateOrderTool] Cantidad excesiva detectada (${item.quantity}), limitando a 10.`);
            quantity = 10;
          } else if (item.quantity < 1) {
            console.warn(`[updateOrderTool] Cantidad inválida (${item.quantity}), estableciendo a 1.`);
            quantity = 1;
          } else {
            quantity = Math.round(item.quantity); // Asegurar que sea un entero
          }
        } else {
          console.warn(`[updateOrderTool] Cantidad no numérica (${item.quantity}), estableciendo a 1.`);
        }
        
        // Validar el nombre del producto
        const name = item.name ? String(item.name).trim() : "Producto sin nombre";
        if (!name || name === "Producto sin nombre") {
          console.warn("[updateOrderTool] Producto sin nombre definido:", item);
        }
        
        // Validar el precio
        let price = 0;
        if (typeof item.price === 'number' && !isNaN(item.price)) {
          price = item.price;
        } else {
          console.warn(`[updateOrderTool] Precio no válido (${item.price}), usando 0:`, item);
        }
        
        const validatedItem = {
          name: name,
          quantity: quantity,
          price: price,
          specialInstructions: typeof item.specialInstructions === 'string' ? item.specialInstructions : ""
        };
        
        console.log(`[updateOrderTool] Ítem ${index} validado:`, validatedItem);
        return validatedItem;
      });

      // IMPORTANTE: Convertir a string JSON antes de enviar el evento
      // El componente OrderDetails.tsx espera recibir un string JSON
      const validatedItemsJson = JSON.stringify(validatedItems);
      
      // Imprimir el JSON final para depuración
      console.log("[updateOrderTool] JSON final a enviar:", validatedItemsJson);
      
      try {
        // Guardar en localStorage para persistencia - redundancia para mayor seguridad
        localStorage.setItem('currentOrder', validatedItemsJson);
        console.log("[updateOrderTool] Orden guardada en localStorage");
      } catch (storageError) {
        console.error("[updateOrderTool] Error al guardar en localStorage:", storageError);
        // Continuar a pesar del error
      }
      
      try {
        // Despachar el evento con los datos validados como STRING
        const eventToDispatch = new CustomEvent("orderDetailsUpdated", {
          detail: validatedItemsJson
        });
        
        window.dispatchEvent(eventToDispatch);
        console.log("[updateOrderTool] Evento orderDetailsUpdated despachado correctamente");
      } catch (eventError) {
        console.error("[updateOrderTool] Error al despachar evento:", eventError);
        // Continuar a pesar del error
      }
      
      // Calcular el total del pedido para informar
      const total = validatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      resolve(`Detalles del pedido actualizados correctamente. Total: $${total.toFixed(2)}`);
    } catch (error) {
      console.error("[updateOrderTool] Error crítico durante el procesamiento:", error);
      
      // Intentar guardar información de error para diagnóstico
      try {
        localStorage.setItem('orderToolError', JSON.stringify({
          timestamp: new Date().toISOString(),
          error: String(error),
          params: JSON.stringify(params)
        }));
      } catch (e) {
        // Ignore localStorage errors
      }
      
      resolve("Error al procesar los detalles del pedido. Por favor intente nuevamente.");
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
    const { productId, category } = params as any;
    
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