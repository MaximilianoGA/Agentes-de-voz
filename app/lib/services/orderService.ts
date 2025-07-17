import { Order, OrderItem, OrderStatus } from '../types';
import { menuItems } from '../data/menu-items';

/**
 * Servicio de gestión de pedidos
 * Proporciona funcionalidades para crear, leer, actualizar y eliminar pedidos
 * Utiliza localStorage para persistencia
 */

// Claves para almacenamiento local
const ORDERS_STORAGE_KEY = 'restaurant_orders';
const CURRENT_ORDER_KEY = 'current_order';

/**
 * Genera un ID único
 * @returns UUID generado
 */
function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Obtiene el pedido actual desde localStorage
 * @returns El pedido actual o null si no existe
 */
export function getCurrentOrder(): Order | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const orderJson = localStorage.getItem(CURRENT_ORDER_KEY);
    if (!orderJson) return null;
    
    return JSON.parse(orderJson) as Order;
  } catch (error) {
    console.error('Error al obtener el pedido actual:', error);
    return null;
  }
}

/**
 * Guarda el pedido actual en localStorage y emite un evento de actualización
 * @param order Pedido a guardar
 */
export function saveCurrentOrder(order: Order): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(CURRENT_ORDER_KEY, JSON.stringify(order));
    // Disparar evento para notificar cambios en el pedido
    window.dispatchEvent(new CustomEvent('orderUpdated', { detail: order }));
  } catch (error) {
    console.error('Error al guardar el pedido actual:', error);
  }
}

/**
 * Crea un nuevo pedido vacío
 * @returns El nuevo pedido creado
 */
export function createNewOrder(): Order {
  const newOrder: Order = {
    id: generateId(),
    items: [],
    subtotal: 0,
    total: 0,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  saveCurrentOrder(newOrder);
  return newOrder;
}

/**
 * Añade un ítem al pedido actual
 * @param itemId ID del producto a añadir
 * @param quantity Cantidad a añadir
 * @param specialInstructions Instrucciones especiales (opcional)
 * @returns El pedido actualizado
 */
export function addItemToOrder(itemId: string, quantity: number, specialInstructions?: string): Order {
  const currentOrder = getCurrentOrder() || createNewOrder();
  const menuItem = menuItems.find(item => item.id === itemId);
  
  if (!menuItem) {
    throw new Error(`Ítem con ID ${itemId} no encontrado`);
  }
  
  // Verificar si el ítem ya existe en el pedido con las mismas instrucciones
  const existingItemIndex = currentOrder.items.findIndex(
    item => item.id === itemId && 
    (specialInstructions || '') === (item.specialInstructions || '')
  );
  
  if (existingItemIndex >= 0) {
    // Actualizar cantidad si el ítem ya existe
    currentOrder.items[existingItemIndex].quantity += quantity;
  } else {
    // Añadir nuevo ítem al pedido
    const newItem: OrderItem = {
      id: itemId,
      menuItemId: itemId,
      name: menuItem.name,
      price: menuItem.price,
      quantity,
      specialInstructions
    };
    
    currentOrder.items.push(newItem);
  }
  
  // Recalcular el total
  currentOrder.subtotal = calculateOrderSubtotal(currentOrder);
  currentOrder.total = calculateOrderTotal(currentOrder);
  currentOrder.updatedAt = new Date().toISOString();
  
  // Guardar el pedido actualizado
  saveCurrentOrder(currentOrder);
  
  return currentOrder;
}

/**
 * Elimina un ítem del pedido
 * @param itemId ID del ítem a eliminar
 * @returns El pedido actualizado
 */
export function removeItemFromOrder(itemId: string): Order {
  const currentOrder = getCurrentOrder();
  
  if (!currentOrder) {
    throw new Error('No hay un pedido activo');
  }
  
  // Filtrar el ítem a eliminar
  currentOrder.items = currentOrder.items.filter(item => item.id !== itemId);
  
  // Recalcular el total
  currentOrder.subtotal = calculateOrderSubtotal(currentOrder);
  currentOrder.total = calculateOrderTotal(currentOrder);
  currentOrder.updatedAt = new Date().toISOString();
  
  // Guardar el pedido actualizado
  saveCurrentOrder(currentOrder);
  
  return currentOrder;
}

/**
 * Actualiza la cantidad de un ítem en el pedido
 * @param itemId ID del ítem a actualizar
 * @param quantity Nueva cantidad
 * @returns El pedido actualizado
 */
export function updateItemQuantity(itemId: string, quantity: number): Order {
  const currentOrder = getCurrentOrder();
  
  if (!currentOrder) {
    throw new Error('No hay un pedido activo');
  }
  
  // Encontrar el ítem a actualizar
  const itemIndex = currentOrder.items.findIndex(item => item.id === itemId);
  
  if (itemIndex === -1) {
    throw new Error(`Ítem con ID ${itemId} no encontrado en el pedido`);
  }
  
  if (quantity <= 0) {
    // Si la cantidad es 0 o menor, remover el ítem
    return removeItemFromOrder(itemId);
  }
  
  // Actualizar la cantidad
  currentOrder.items[itemIndex].quantity = quantity;
  
  // Recalcular el total
  currentOrder.subtotal = calculateOrderSubtotal(currentOrder);
  currentOrder.total = calculateOrderTotal(currentOrder);
  currentOrder.updatedAt = new Date().toISOString();
  
  // Guardar el pedido actualizado
  saveCurrentOrder(currentOrder);
  
  return currentOrder;
}

/**
 * Actualiza las instrucciones especiales de un ítem
 * @param itemId ID del ítem a actualizar
 * @param instructions Nuevas instrucciones especiales
 * @returns El pedido actualizado
 */
export function updateItemInstructions(itemId: string, instructions: string): Order {
  const currentOrder = getCurrentOrder();
  
  if (!currentOrder) {
    throw new Error('No hay un pedido activo');
  }
  
  // Encontrar el ítem a actualizar
  const itemIndex = currentOrder.items.findIndex(item => item.id === itemId);
  
  if (itemIndex === -1) {
    throw new Error(`Ítem con ID ${itemId} no encontrado en el pedido`);
  }
  
  // Actualizar las instrucciones
  currentOrder.items[itemIndex].specialInstructions = instructions;
  currentOrder.updatedAt = new Date().toISOString();
  
  // Guardar el pedido actualizado
  saveCurrentOrder(currentOrder);
  
  return currentOrder;
}

/**
 * Calcula el subtotal del pedido
 * @param order Pedido a calcular
 * @returns Subtotal calculado
 */
export function calculateOrderSubtotal(order: Order): number {
  return order.items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

/**
 * Calcula el total del pedido incluyendo impuestos
 * @param order Pedido a calcular
 * @returns Total calculado con impuestos
 */
export function calculateOrderTotal(order: Order): number {
  const subtotal = calculateOrderSubtotal(order);
  const tax = subtotal * 0.1; // 10% de impuesto
  return subtotal + tax;
}

/**
 * Actualiza el estado del pedido
 * @param orderId ID del pedido a actualizar
 * @param status Nuevo estado
 * @returns El pedido actualizado o null si no se encuentra
 */
export function updateOrderStatus(orderId: string, status: OrderStatus): Order | null {
  const currentOrder = getCurrentOrder();
  
  if (!currentOrder || currentOrder.id !== orderId) {
    return null;
  }
  
  currentOrder.status = status;
  currentOrder.updatedAt = new Date().toISOString();
  
  // Si el pedido está completado o cancelado, moverlo al historial
  if (status === 'completed' || status === 'cancelled') {
    saveOrderToHistory(currentOrder);
    
    // Si está completado, crear un nuevo pedido vacío
    if (status === 'completed') {
      createNewOrder();
    }
  } else {
    // De lo contrario, actualizar el pedido actual
    saveCurrentOrder(currentOrder);
  }
  
  return currentOrder;
}

/**
 * Guarda un pedido en el historial
 * @param order Pedido a guardar en el historial
 */
function saveOrderToHistory(order: Order): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Obtener órdenes existentes
    const ordersJson = localStorage.getItem(ORDERS_STORAGE_KEY);
    const orders: Order[] = ordersJson ? JSON.parse(ordersJson) : [];
    
    // Añadir el nuevo pedido al inicio del array
    orders.unshift(order);
    
    // Guardar el array actualizado
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (error) {
    console.error('Error al guardar pedido en el historial:', error);
  }
}

/**
 * Obtiene el historial de pedidos
 * @returns Array con el historial de pedidos
 */
export function getOrderHistory(): Order[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const ordersJson = localStorage.getItem(ORDERS_STORAGE_KEY);
    return ordersJson ? JSON.parse(ordersJson) : [];
  } catch (error) {
    console.error('Error al obtener historial de pedidos:', error);
    return [];
  }
}

/**
 * Limpia el pedido actual
 */
export function clearCurrentOrder(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(CURRENT_ORDER_KEY);
    window.dispatchEvent(new CustomEvent('orderUpdated', { detail: null }));
  } catch (error) {
    console.error('Error al limpiar el pedido actual:', error);
  }
}

/**
 * Obtiene un pedido por ID del historial
 * @param orderId ID del pedido a buscar
 * @returns El pedido encontrado o null si no existe
 */
export function getOrderById(orderId: string): Order | null {
  // Verificar si es el pedido actual
  const currentOrder = getCurrentOrder();
  if (currentOrder && currentOrder.id === orderId) {
    return currentOrder;
  }
  
  // Buscar en el historial
  const orders = getOrderHistory();
  return orders.find(order => order.id === orderId) || null;
}

/**
 * Sincroniza el estado del pedido actual con el componente OrderDetails
 * Convierte el formato Order al formato esperado por OrderDetails y emite un evento
 */
export function syncWithOrderDetails(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const currentOrder = getCurrentOrder();
    
    if (!currentOrder) {
      // Si no hay pedido, enviar un arreglo vacío
      localStorage.setItem('orderDetails', JSON.stringify([]));
      const event = new CustomEvent('orderDetailsUpdated', {
        detail: JSON.stringify([])
      });
      window.dispatchEvent(event);
      return;
    }
    
    // Convertir el formato de Order a OrderDetail esperado por OrderDetails.tsx
    const orderDetails = currentOrder.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      id: item.menuItemId,
      categoryId: getItemCategoryId(item.menuItemId),
      specialInstructions: item.specialInstructions
    }));
    
    // Guardar en localStorage en el formato esperado por OrderDetails
    const orderDetailsJson = JSON.stringify(orderDetails);
    localStorage.setItem('orderDetails', orderDetailsJson);
    
    // Emitir evento para que OrderDetails se actualice
    const event = new CustomEvent('orderDetailsUpdated', {
      detail: orderDetailsJson
    });
    window.dispatchEvent(event);
  } catch (error) {
    console.error('Error al sincronizar con OrderDetails:', error);
  }
}

/**
 * Obtiene la categoría de un ítem por su ID
 * @param itemId ID del ítem
 * @returns ID de la categoría o undefined si no se encuentra
 */
function getItemCategoryId(itemId: string): string | undefined {
  const item = menuItems.find(item => item.id === itemId);
  return item?.categoryId;
}

/**
 * Versión mejorada de addItemToOrder que sincroniza con OrderDetails
 */
export function addItemToOrderAndSync(itemId: string, quantity: number, specialInstructions?: string): Order {
  const updatedOrder = addItemToOrder(itemId, quantity, specialInstructions);
  syncWithOrderDetails();
  return updatedOrder;
}

/**
 * Versión mejorada de removeItemFromOrder que sincroniza con OrderDetails
 */
export function removeItemFromOrderAndSync(itemId: string): Order {
  const updatedOrder = removeItemFromOrder(itemId);
  syncWithOrderDetails();
  return updatedOrder;
}

/**
 * Versión mejorada de clearCurrentOrder que sincroniza con OrderDetails
 */
export function clearCurrentOrderAndSync(): void {
  clearCurrentOrder();
  syncWithOrderDetails();
}

/**
 * Función para formatear precios de manera amigable para el asistente de voz
 */
export const formatPriceForVoice = (price: number): string => {
  // Evitar decimales cuando no son necesarios para mejorar la lectura del asistente de voz
  const hasDecimals = price % 1 !== 0;
  
  if (!hasDecimals) {
    return `${price} pesos`;
  } else {
    // Para precios con decimales, formateamos de forma que sea más fácil de leer por el asistente
    const intPart = Math.floor(price);
    const decPart = Math.round((price - intPart) * 100);
    
    if (decPart === 0) {
      return `${intPart} pesos`;
    } else if (decPart === 50) {
      return `${intPart} pesos con 50 centavos`;
    } else {
      return `${intPart} pesos con ${decPart} centavos`;
    }
  }
}; 