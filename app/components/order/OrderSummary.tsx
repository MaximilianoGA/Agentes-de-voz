'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ShoppingCart, Trash2, PlusCircle, MinusCircle, CreditCard, ArrowRight } from 'lucide-react';
import { Order, OrderItem } from '@/app/lib/types';
import { getCurrentOrder, updateItemQuantity, removeItemFromOrder, clearCurrentOrder } from '@/app/lib/services/orderService';
import { menuItems } from '@/app/lib/data/menu-items';

/**
 * Componente que muestra el resumen del pedido actual
 */
export default function OrderSummary() {
  const [order, setOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const orderRef = useRef<HTMLDivElement>(null);
  
  // Cargar pedido del localStorage al iniciar
  useEffect(() => {
    const loadedOrder = getCurrentOrder();
    setOrder(loadedOrder);
    
    // Suscribirse a eventos de actualización del pedido
    const handleOrderUpdate = (event: CustomEvent) => {
      setIsUpdating(true);
      setOrder(event.detail);
      
      // Añadir y quitar clase para animación
      if (orderRef.current) {
        orderRef.current.classList.add('order-updated');
        setTimeout(() => {
          if (orderRef.current) {
            orderRef.current.classList.remove('order-updated');
          }
          setIsUpdating(false);
        }, 800);
      } else {
        setIsUpdating(false);
      }
    };
    
    window.addEventListener('orderUpdated', handleOrderUpdate as EventListener);
    
    return () => {
      window.removeEventListener('orderUpdated', handleOrderUpdate as EventListener);
    };
  }, []);
  
  // Formatear precio como moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Manejar cambio de cantidad
  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    try {
      if (newQuantity > 0) {
        const updatedOrder = updateItemQuantity(itemId, newQuantity);
        setOrder(updatedOrder);
      } else {
        const updatedOrder = removeItemFromOrder(itemId);
        setOrder(updatedOrder);
      }
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
    }
  };
  
  // Manejar eliminación de ítem
  const handleRemoveItem = (itemId: string) => {
    try {
      const updatedOrder = removeItemFromOrder(itemId);
      setOrder(updatedOrder);
    } catch (error) {
      console.error('Error al eliminar ítem:', error);
    }
  };
  
  // Manejar vaciado del pedido
  const handleClearOrder = () => {
    try {
      clearCurrentOrder();
      setOrder(null);
    } catch (error) {
      console.error('Error al vaciar pedido:', error);
    }
  };
  
  // Encontrar detalle completo del producto
  const findProductDetails = (itemId: string) => {
    return menuItems.find(item => item.id === itemId);
  };
  
  // Si no hay pedido o está vacío
  if (!order || order.items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 h-full flex flex-col animate-fade-in">
        <div className="bg-gradient-to-r from-amber-600 to-amber-500 -m-6 mb-6 p-5 rounded-t-lg">
          <h2 className="text-xl font-bold text-white flex items-center">
            <ShoppingCart className="mr-2" /> Tu Pedido
          </h2>
        </div>
        
        <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-4 animate-bounce-slow">
            <ShoppingCart size={32} className="text-amber-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Tu pedido está vacío</h3>
          <p className="text-gray-500 text-sm max-w-xs">
            Agrega productos desde el menú o menciónalos al agente para que aparezcan aquí.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      ref={orderRef} 
      className={`bg-white rounded-lg shadow-lg p-6 h-full flex flex-col animate-fade-in ${isUpdating ? 'order-updated' : ''}`}
    >
      <div className="bg-gradient-to-r from-amber-600 to-amber-500 -m-6 mb-6 p-5 rounded-t-lg">
        <h2 className="text-xl font-bold text-white flex items-center">
          <ShoppingCart className="mr-2" /> Tu Pedido
        </h2>
      </div>
      
      <div className="flex-grow overflow-auto space-y-3 pr-1 order-items-container">
        {order.items.map((item, index) => {
          const productDetails = findProductDetails(item.id);
          
          return (
            <div 
              key={`${item.id}-${index}`} 
              className="p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow transition-all duration-200 product-card bg-white"
            >
              <div className="flex items-start">
                <div className="text-2xl mr-3">
                  {productDetails?.imageUrl ? '🌮' : '🌮'}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-amber-900">{item.name}</h3>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                  
                  {productDetails && (
                    <p className="text-xs text-gray-500 mt-1">{productDetails.description}</p>
                  )}
                  
                  {item.specialInstructions && (
                    <p className="text-xs italic text-amber-600 mt-1">
                      Nota: {item.specialInstructions}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                    <div className="flex items-center">
                      <button 
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="text-amber-500 hover:text-amber-700 focus:outline-none transition-colors p-1"
                        aria-label="Disminuir cantidad"
                      >
                        <MinusCircle size={18} />
                      </button>
                      <span className="mx-2 font-medium text-gray-800 w-5 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="text-amber-500 hover:text-amber-700 focus:outline-none transition-colors p-1"
                        aria-label="Aumentar cantidad"
                      >
                        <PlusCircle size={18} />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-gray-400 hover:text-red-500 focus:outline-none transition-colors p-1"
                      aria-label="Eliminar ítem"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center mb-1">
          <span className="text-gray-600">Subtotal:</span>
          <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <span className="font-medium text-gray-800">Total:</span>
          <span className="font-bold text-xl text-amber-700">{formatCurrency(order.totalAmount)}</span>
        </div>
        
        <div className="flex justify-between gap-3">
          <button 
            onClick={handleClearOrder}
            className="py-2 px-4 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            Vaciar
          </button>
          
          <button 
            className="flex-grow py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 rounded-md text-white font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            <CreditCard size={18} />
            <span>Proceder al Pago</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
} 