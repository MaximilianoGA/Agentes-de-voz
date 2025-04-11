'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Order, OrderItem, AppAction } from '../lib/types';
import { getMenuItemById } from '../lib/data/mockData';

// Definir el estado inicial
type OrderState = {
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  specialInstructions?: string;
};

const initialState: OrderState = {
  items: [],
  subtotal: 0,
  tax: 0,
  total: 0,
  specialInstructions: '',
};

// Acciones para el reducer
type OrderAction =
  | { type: 'ADD_ITEM'; payload: OrderItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_ORDER' }
  | { type: 'SET_SPECIAL_INSTRUCTIONS'; payload: string }
  | { type: 'LOAD_FROM_STORAGE'; payload: OrderState };

// Función reductora
function orderReducer(state: OrderState, action: OrderAction): OrderState {
  switch (action.type) {
    case 'ADD_ITEM': {
      // Verificar si el ítem ya existe en el pedido
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === action.payload.id
      );

      let newItems;
      if (existingItemIndex >= 0) {
        // Si existe, actualizar la cantidad
        newItems = [...state.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity:
            newItems[existingItemIndex].quantity + action.payload.quantity,
        };
      } else {
        // Si no existe, agregar al array
        newItems = [...state.items, action.payload];
      }

      // Calcular nuevos valores de subtotal, impuestos y total
      const subtotal = calculateSubtotal(newItems);
      const tax = subtotal * 0.10; // 10% de impuesto
      const total = subtotal + tax;

      return {
        ...state,
        items: newItems,
        subtotal,
        tax,
        total,
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter((item) => item.id !== action.payload);
      const subtotal = calculateSubtotal(newItems);
      const tax = subtotal * 0.10;
      const total = subtotal + tax;

      return {
        ...state,
        items: newItems,
        subtotal,
        tax,
        total,
      };
    }

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      
      // Si la cantidad es 0, eliminar el ítem
      if (quantity <= 0) {
        return orderReducer(state, { type: 'REMOVE_ITEM', payload: id });
      }

      // Actualizar la cantidad del ítem
      const newItems = state.items.map((item) =>
        item.id === id ? { ...item, quantity } : item
      );

      const subtotal = calculateSubtotal(newItems);
      const tax = subtotal * 0.10;
      const total = subtotal + tax;

      return {
        ...state,
        items: newItems,
        subtotal,
        tax,
        total,
      };
    }

    case 'CLEAR_ORDER':
      return initialState;

    case 'SET_SPECIAL_INSTRUCTIONS':
      return {
        ...state,
        specialInstructions: action.payload,
      };

    case 'LOAD_FROM_STORAGE':
      return action.payload;

    default:
      return state;
  }
}

// Función para calcular el subtotal
function calculateSubtotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// Crear contexto
type OrderContextType = {
  order: OrderState;
  addItem: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearOrder: () => void;
  setSpecialInstructions: (instructions: string) => void;
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Proveedor del contexto
export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [order, dispatch] = useReducer(orderReducer, initialState);

  // Cargar pedido desde localStorage al iniciar
  useEffect(() => {
    try {
      const savedOrder = localStorage.getItem('currentOrder');
      if (savedOrder) {
        const parsedOrder = JSON.parse(savedOrder);
        dispatch({ type: 'LOAD_FROM_STORAGE', payload: parsedOrder });
      }
    } catch (error) {
      console.error('Error al cargar el pedido desde localStorage:', error);
    }
  }, []);

  // Guardar pedido en localStorage cuando cambia
  useEffect(() => {
    try {
      localStorage.setItem('currentOrder', JSON.stringify(order));
    } catch (error) {
      console.error('Error al guardar el pedido en localStorage:', error);
    }
  }, [order]);

  // También escuchar el evento personalizado para actualizaciones externas
  useEffect(() => {
    const handleOrderUpdate = (event: CustomEvent) => {
      try {
        if (event.detail && Array.isArray(event.detail)) {
          // Crear un nuevo estado de pedido basado en los items recibidos del evento
          const newItems = event.detail.map((item: any) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity || 1,
          }));
          
          const subtotal = calculateSubtotal(newItems);
          const tax = subtotal * 0.10;
          const total = subtotal + tax;
          
          dispatch({
            type: 'LOAD_FROM_STORAGE',
            payload: {
              items: newItems,
              subtotal,
              tax,
              total,
              specialInstructions: order.specialInstructions,
            },
          });
        }
      } catch (error) {
        console.error('Error al procesar evento de actualización de pedido:', error);
      }
    };

    window.addEventListener('orderDetailsUpdated', handleOrderUpdate as EventListener);

    return () => {
      window.removeEventListener('orderDetailsUpdated', handleOrderUpdate as EventListener);
    };
  }, [order.specialInstructions]);

  // Funciones para manipular el estado
  const addItem = (id: string, quantity: number) => {
    const menuItem = getMenuItemById(id);
    if (menuItem) {
      const orderItem: OrderItem = {
        id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity,
      };
      dispatch({ type: 'ADD_ITEM', payload: orderItem });
    }
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearOrder = () => {
    dispatch({ type: 'CLEAR_ORDER' });
  };

  const setSpecialInstructions = (instructions: string) => {
    dispatch({ type: 'SET_SPECIAL_INSTRUCTIONS', payload: instructions });
  };

  const value = {
    order,
    addItem,
    removeItem,
    updateQuantity,
    clearOrder,
    setSpecialInstructions,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

// Hook personalizado para usar el contexto
export function useOrder() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder debe usarse dentro de un OrderProvider');
  }
  return context;
} 