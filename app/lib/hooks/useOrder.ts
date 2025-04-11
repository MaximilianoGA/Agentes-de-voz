import { useState, useEffect } from 'react';
import { OrderItem, Order } from '../types';

/**
 * Hook personalizado para gestionar el estado del pedido actual
 */
export function useOrder() {
  const [order, setOrder] = useState<Order>({
    items: [],
    total: 0,
    status: 'pending'
  });

  // Cargar pedido desde localStorage al iniciar
  useEffect(() => {
    try {
      const savedOrder = localStorage.getItem('orderDetails');
      if (savedOrder) {
        const parsedItems = JSON.parse(savedOrder);
        if (Array.isArray(parsedItems) && parsedItems.length > 0) {
          // Calcular el total del pedido
          const total = parsedItems.reduce((acc, item) => {
            return acc + (item.quantity * item.price);
          }, 0);
          
          setOrder({
            items: parsedItems,
            total,
            status: 'pending'
          });
        }
      }
    } catch (error) {
      console.error('Error al cargar el pedido guardado:', error);
    }
  }, []);

  // Escuchar eventos de actualización de pedido
  useEffect(() => {
    const handleOrderUpdate = (event: CustomEvent) => {
      try {
        const updatedOrder = event.detail;
        
        if (typeof updatedOrder === 'string') {
          try {
            const parsedItems = JSON.parse(updatedOrder);
            if (Array.isArray(parsedItems)) {
              // Calcular el nuevo total
              const total = parsedItems.reduce((acc, item) => {
                return acc + (item.quantity * item.price);
              }, 0);
              
              setOrder({
                items: parsedItems,
                total,
                status: 'pending'
              });
              
              // Guardar en localStorage
              localStorage.setItem('orderDetails', updatedOrder);
            }
          } catch (parseError) {
            console.error('Error al parsear los detalles del pedido:', parseError);
          }
        }
      } catch (error) {
        console.error('Error al procesar la actualización del pedido:', error);
      }
    };

    window.addEventListener('orderDetailsUpdated', handleOrderUpdate as EventListener);
    
    return () => {
      window.removeEventListener('orderDetailsUpdated', handleOrderUpdate as EventListener);
    };
  }, []);

  /**
   * Añade un item al pedido
   */
  const addItem = (item: OrderItem) => {
    setOrder(prevOrder => {
      // Buscar si el item ya existe en el pedido
      const existingItemIndex = prevOrder.items.findIndex(
        i => i.id === item.id
      );
      
      let newItems;
      
      if (existingItemIndex >= 0) {
        // Actualizar cantidad si ya existe
        newItems = [...prevOrder.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + item.quantity
        };
      } else {
        // Añadir nuevo item si no existe
        newItems = [...prevOrder.items, item];
      }
      
      // Calcular nuevo total
      const newTotal = newItems.reduce(
        (sum, item) => sum + item.price * item.quantity, 
        0
      );
      
      // Guardar en localStorage
      localStorage.setItem('orderDetails', JSON.stringify(newItems));
      
      // Actualizar estado
      return {
        ...prevOrder,
        items: newItems,
        total: newTotal
      };
    });
  };

  /**
   * Elimina un item del pedido
   */
  const removeItem = (itemId: string) => {
    setOrder(prevOrder => {
      // Filtrar los items para eliminar el seleccionado
      const newItems = prevOrder.items.filter(item => item.id !== itemId);
      
      // Calcular nuevo total
      const newTotal = newItems.reduce(
        (sum, item) => sum + item.price * item.quantity, 
        0
      );
      
      // Guardar en localStorage
      localStorage.setItem('orderDetails', JSON.stringify(newItems));
      
      // Actualizar estado
      return {
        ...prevOrder,
        items: newItems,
        total: newTotal
      };
    });
  };

  /**
   * Actualiza la cantidad de un item existente
   */
  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      return removeItem(itemId);
    }
    
    setOrder(prevOrder => {
      // Buscar el item a actualizar
      const itemIndex = prevOrder.items.findIndex(item => item.id === itemId);
      
      if (itemIndex === -1) {
        return prevOrder;
      }
      
      // Crear nueva lista de items con la cantidad actualizada
      const newItems = [...prevOrder.items];
      newItems[itemIndex] = {
        ...newItems[itemIndex],
        quantity
      };
      
      // Calcular nuevo total
      const newTotal = newItems.reduce(
        (sum, item) => sum + item.price * item.quantity, 
        0
      );
      
      // Guardar en localStorage
      localStorage.setItem('orderDetails', JSON.stringify(newItems));
      
      // Actualizar estado
      return {
        ...prevOrder,
        items: newItems,
        total: newTotal
      };
    });
  };

  /**
   * Vacía completamente el pedido
   */
  const clearOrder = () => {
    // Resetear el estado
    setOrder({
      items: [],
      total: 0,
      status: 'pending'
    });
    
    // Limpiar localStorage
    localStorage.removeItem('orderDetails');
    
    // Emitir evento de orden vacía
    const emptyOrderJson = JSON.stringify([]);
    const customEvent = new CustomEvent('orderDetailsUpdated', {
      detail: emptyOrderJson
    });
    window.dispatchEvent(customEvent);
  };

  /**
   * Actualiza las instrucciones especiales de un item
   */
  const updateItemInstructions = (itemId: string, instructions: string) => {
    setOrder(prevOrder => {
      // Buscar el item a actualizar
      const itemIndex = prevOrder.items.findIndex(item => item.id === itemId);
      
      if (itemIndex === -1) {
        return prevOrder;
      }
      
      // Crear nueva lista de items con las instrucciones actualizadas
      const newItems = [...prevOrder.items];
      newItems[itemIndex] = {
        ...newItems[itemIndex],
        specialInstructions: instructions
      };
      
      // Guardar en localStorage
      localStorage.setItem('orderDetails', JSON.stringify(newItems));
      
      // Actualizar estado (total no cambia)
      return {
        ...prevOrder,
        items: newItems
      };
    });
  };

  return {
    order,
    addItem,
    removeItem,
    updateItemQuantity,
    updateItemInstructions,
    clearOrder
  };
} 