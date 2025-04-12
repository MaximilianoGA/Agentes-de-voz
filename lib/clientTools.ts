// Eliminamos las importaciones problemáticas y definimos los tipos localmente
// import { ClientToolImplementation, ToolParams } from 'ultravox-client';
// import { ToolDefinition } from "ultravox";

// Definición local de tipos para reemplazar las importaciones
type ToolParams = any;
type ClientToolImplementation = (params: ToolParams) => Promise<string>;

/**
 * Herramienta para actualizar los detalles del pedido.
 * Valida y procesa los datos del pedido antes de enviar el evento.
 */
export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  id?: string;
  categoryId?: string;
  specialInstructions?: string;
}

export interface OrderParameters {
  orderData: any;
}

export const updateOrderTool: ClientToolImplementation = (params: ToolParams) => {
  console.log("[updateOrderTool] Invocado con parámetros:", params);
  
  // Implementar un timeout para la operación completa
  const timeoutPromise = new Promise<string>((resolve) => {
    setTimeout(() => {
      resolve("Operación completada con timeout de seguridad");
    }, 5000); // 5 segundos de timeout de seguridad
  });
  
  const operationPromise = new Promise<string>((resolve) => {
    try {
      // Verificar que se proporcionó orderData
      if (!params || typeof params !== 'object') {
        console.error("[updateOrderTool] Error: Parámetros inválidos");
        resolve("Error: No se proporcionó información de la orden");
        return;
      }

      // Extraer datos del pedido
      const { orderData, orderDetailsData, ...rest } = params as any;
      
      let orderItems: any[] = [];

      // Determinar el formato de los datos y procesarlos adecuadamente
      if (orderDetailsData) {
        console.log("[updateOrderTool] Usando orderDetailsData explícito");
        if (typeof orderDetailsData === 'string') {
          try {
            orderItems = JSON.parse(orderDetailsData);
          } catch (e) {
            console.error("[updateOrderTool] Error al parsear JSON:", e);
            resolve("Error: Formato de datos inválido");
            return;
          }
        } else if (Array.isArray(orderDetailsData)) {
          orderItems = orderDetailsData;
        } else {
          orderItems = [orderDetailsData];
        }
      } else if (orderData) {
        console.log("[updateOrderTool] Usando orderData");
        if (Array.isArray(orderData)) {
          orderItems = orderData;
        } else if (typeof orderData === 'object') {
          // Comprobar si es un objeto con propiedad 'items'
          if (orderData.items && Array.isArray(orderData.items)) {
            orderItems = orderData.items;
          } else {
            // Intentar convertir el objeto en un array de items
            const items = [];
            for (const key in orderData) {
              if (typeof orderData[key] === 'object') {
                // Conservar el ID original como propiedad id
                const item = { 
                  ...orderData[key],
                  id: key, // Guardar el ID original
                };
                items.push(item);
              }
            }
            
            if (items.length > 0) {
              orderItems = items;
            } else {
              // Última alternativa - tratar todo el objeto como un solo item
              orderItems = [orderData];
            }
          }
        } else if (typeof orderData === 'string') {
          try {
            const parsed = JSON.parse(orderData);
            if (Array.isArray(parsed)) {
              orderItems = parsed;
            } else if (typeof parsed === 'object') {
              // Si es un objeto, aplicar la misma lógica que arriba
              if (parsed.items && Array.isArray(parsed.items)) {
                orderItems = parsed.items;
              } else {
                const items = [];
                for (const key in parsed) {
                  if (typeof parsed[key] === 'object') {
                    const item = { 
                      ...parsed[key],
                      id: key,
                    };
                    items.push(item);
                  }
                }
                
                if (items.length > 0) {
                  orderItems = items;
                } else {
                  orderItems = [parsed];
                }
              }
            }
          } catch (e) {
            console.error("[updateOrderTool] Error al parsear JSON:", e);
            resolve("Error: Formato de datos inválido");
            return;
          }
        }
      } else {
        // Intentar buscar datos relevantes en otros campos
        console.log("[updateOrderTool] Buscando datos de orden en cualquier parámetro");
        for (const key in rest) {
          const value = rest[key];
          if (Array.isArray(value)) {
            orderItems = value;
            break;
          } else if (value && typeof value === 'object') {
            if (value.items && Array.isArray(value.items)) {
              orderItems = value.items;
              break;
            } else {
              orderItems = [value];
              break;
            }
          }
        }
      }

      // Validar cada item de la orden
      const validatedItems = orderItems
        .filter(item => {
          // Verificar si el item tiene las propiedades requeridas
          if (!item || typeof item !== 'object') {
            console.warn("[updateOrderTool] Item inválido:", item);
            return false;
          }
          
          if (!item.name || item.name.trim() === '') {
            console.warn("[updateOrderTool] Item sin nombre:", item);
            return false;
          }
          
          if (typeof item.quantity !== 'number' || item.quantity <= 0) {
            console.warn("[updateOrderTool] Item con cantidad inválida:", item);
            // Intentar corregir si es posible
            if (typeof item.quantity === 'string') {
              try {
                item.quantity = parseInt(item.quantity, 10);
                if (isNaN(item.quantity) || item.quantity <= 0) {
                  item.quantity = 1; // Valor por defecto
                }
              } catch (e) {
                item.quantity = 1; // Valor por defecto
              }
            } else {
              item.quantity = 1; // Valor por defecto
            }
          }
          
          if (typeof item.price !== 'number' || item.price < 0) {
            console.warn("[updateOrderTool] Item con precio inválido:", item);
            // No intentamos corregir el precio, ya que es un valor crítico
            return false;
          }
          
          // Asegurarse de que id y categoryId están presentes si existen
          // No los filtramos si faltan, simplemente los conservamos si están
          
          return true;
        })
        .map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          id: item.id || undefined,
          categoryId: item.categoryId || undefined,
          specialInstructions: item.specialInstructions || undefined
        }));

      if (validatedItems.length === 0) {
        console.warn("[updateOrderTool] No hay items válidos en la orden");
        resolve("Error: No hay productos válidos en la orden");
        return;
      }

      console.log("[updateOrderTool] Items validados:", validatedItems);

      // Convertir a JSON para el evento
      const orderJson = JSON.stringify(validatedItems);
      
      // Guardar en localStorage para persistencia
      if (typeof window !== 'undefined') {
        localStorage.setItem('orderDetails', orderJson);
      }
      
      // Disparar evento para actualizar la UI
      console.log("[updateOrderTool] Disparando evento con orden:", orderJson);
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('orderDetailsUpdated', {
          detail: orderJson
        });
        window.dispatchEvent(event);
      }
      
      // Calcular el total del pedido para informar
      const total = validatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      resolve(`Detalles del pedido actualizados correctamente. Total: $${total.toFixed(2)}`);
    } catch (error) {
      console.error("[updateOrderTool] Error al procesar la orden:", error);
      resolve("Error interno al procesar la orden");
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
    return Promise.resolve("No se puede resaltar el producto en este entorno.");
  }
  
  try {
    // Extraer el ID del producto del parámetro
    let productId: string;
    let category: string | undefined;
    
    // Manejar diferentes formatos de parámetros que el modelo podría enviar
    if (typeof params === 'string') {
      try {
        // Si es una cadena JSON, intentar parsearla
        const parsed = JSON.parse(params);
        productId = parsed.productId || '';
        category = parsed.category;
      } catch (e) {
        // Si no es JSON válido, usar la cadena como ID
        productId = params;
      }
    } else if (params && typeof params === 'object') {
      // Si recibimos un objeto, intentar extraer productId
      if ('productId' in params) {
        productId = (params as any).productId;
      } else if ('id' in params) {
        productId = (params as any).id;
      } else if ('product' in params) {
        productId = (params as any).product;
      } else if ('name' in params) {
        // Si solo tenemos el nombre, intentar convertirlo a un ID válido
        const name = (params as any).name.toLowerCase();
        productId = name.replace(/\s+/g, '-');
      } else {
        // Buscar cualquier propiedad que parezca un ID
        const keys = Object.keys(params);
        const idKey = keys.find(k => k.toLowerCase().includes('id') || k.toLowerCase().includes('product'));
        if (idKey) {
          productId = (params as any)[idKey];
        } else {
          throw new Error("No se pudo extraer un ID de producto válido de los parámetros");
        }
      }
      
      // Intentar extraer categoría si está disponible
      if ('category' in params) {
        category = (params as any).category;
      } else if ('categoryId' in params) {
        category = (params as any).categoryId;
      }
    } else {
      throw new Error("Formato de parámetros no válido");
    }
    
    if (!productId) {
      console.error("[highlightProductTool] Error: ID de producto no proporcionado");
      return Promise.resolve("Error: ID de producto no proporcionado");
    }
    
    // Normalizar el ID del producto
    productId = productId.toString().toLowerCase().trim();
    
    // Mapeo de nombres comunes a IDs de producto
    const productIdMappings: Record<string, string> = {
      'pastor': 'taco-pastor',
      'al pastor': 'taco-pastor',
      'suadero': 'taco-suadero',
      'taco suadero': 'taco-suadero',
      'bistec': 'taco-bistec',
      'taco bistec': 'taco-bistec',
      'campechano': 'taco-campechano',
      'taco campechano': 'taco-campechano',
      'carnitas': 'taco-carnitas',
      'taco carnitas': 'taco-carnitas',
      'horchata': 'agua-horchata',
      'agua horchata': 'agua-horchata',
      'jamaica': 'agua-jamaica',
      'agua jamaica': 'agua-jamaica',
      'refresco': 'refresco',
      'guacamole': 'guacamole',
      'quesadilla': 'quesadilla',
      'queso': 'queso-extra',
      'queso extra': 'queso-extra',
      'cebollitas': 'cebollitas'
    };
    
    // Verificar si necesitamos mapear el ID
    if (productIdMappings[productId]) {
      console.log(`[highlightProductTool] Mapeando ID: ${productId} -> ${productIdMappings[productId]}`);
      productId = productIdMappings[productId];
    }
    
    console.log(`[highlightProductTool] Resaltando producto: ${productId}`, category ? `Categoría: ${category}` : '');
    
    // Disparar el evento highlightProduct
    const event = new CustomEvent("highlightProduct", {
      detail: { 
        productId,
        category
      }
    });
    
    window.dispatchEvent(event);
    console.log("[highlightProductTool] Evento highlightProduct despachado correctamente");
    
    return Promise.resolve(`Producto ${productId} resaltado correctamente.`);
  } catch (error) {
    console.error("[highlightProductTool] Error al resaltar producto:", error);
    return Promise.resolve("Error al resaltar el producto.");
  }
};

/**
 * Herramienta para procesar el pago del pedido actual.
 * Envía un evento personalizado que será capturado por el componente OrderDetails.
 */
export const processPaymentTool: ClientToolImplementation = (params) => {
  console.log("[processPaymentTool] Llamada recibida con parámetros:", JSON.stringify(params, null, 2));
  
  if (typeof window === "undefined") {
    console.warn("[processPaymentTool] No estamos en un entorno de navegador");
    return Promise.resolve("No se puede procesar el pago en este entorno.");
  }
  
  try {
    // Log de inicio de proceso de pago
    console.log("[processPaymentTool] Iniciando proceso de pago");
    
    // Crear y disparar el evento de procesamiento de pago
    const event = new CustomEvent("processPayment", {
      detail: { 
        timestamp: new Date().toISOString()
      }
    });
    
    window.dispatchEvent(event);
    console.log("[processPaymentTool] Evento processPayment despachado correctamente");
    
    return Promise.resolve("Procesamiento de pago iniciado correctamente.");
  } catch (error) {
    console.error("[processPaymentTool] Error al procesar el pago:", error);
    return Promise.resolve("Error al procesar el pago del pedido.");
  }
};

// Exportamos todas las herramientas disponibles
export const clientTools = [updateOrderTool, highlightProductTool, processPaymentTool]; 