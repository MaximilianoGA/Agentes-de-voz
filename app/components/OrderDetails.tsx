'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingCart, Trash2, ShoppingBag, Coffee, Pizza, Utensils, 
  MessageCircle, CheckCircle, Soup, GlassWater, CupSoda, 
  Cherry, ChefHat, Sandwich, Beef, Salad, BadgeDollarSign
} from 'lucide-react';
import { clearCurrentOrderAndSync, removeItemFromOrderAndSync } from '../lib/services/orderService';

interface OrderDetail {
  name: string;
  quantity: number;
  price: number;
  id?: string; // Para identificar el tipo de producto
  categoryId?: string; // Para determinar el icono adecuado
  specialInstructions?: string; // Instrucciones especiales para el producto
}

const OrderDetails = () => {
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const [total, setTotal] = useState(0);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const orderRef = useRef<HTMLDivElement>(null);
  const [animatingItemId, setAnimatingItemId] = useState<number | null>(null);

  useEffect(() => {
    // Cargar el pedido guardado si existe
    try {
      const savedOrder = localStorage.getItem('orderDetails');
      console.log('Cargando orden guardada:', savedOrder);
      if (savedOrder) {
        const parsedOrder = JSON.parse(savedOrder);
        if (Array.isArray(parsedOrder) && parsedOrder.length > 0) {
          setOrderDetails(parsedOrder);
          
          // Calcular el total del pedido cargado
          const total = parsedOrder.reduce((acc, item) => {
            return acc + (item.quantity * item.price);
          }, 0);
          setTotal(total);
        }
      }
    } catch (error) {
      console.error('Error al cargar el pedido guardado:', error);
    }
    
    // Configurar el detector de eventos para actualizaciones de pedidos
    const handleOrderUpdate = (event: CustomEvent) => {
      try {
        const updatedOrder = event.detail;
        console.log('Evento orderDetailsUpdated recibido:', updatedOrder);
        
        if (typeof updatedOrder === 'string') {
          try {
            const parsedOrder = JSON.parse(updatedOrder);
            if (Array.isArray(parsedOrder)) {
              // Detectar elementos nuevos para animarlos
              if (orderDetails.length < parsedOrder.length) {
                setAnimatingItemId(parsedOrder.length - 1);
                setTimeout(() => setAnimatingItemId(null), 1000);
              }
              
              setOrderDetails(parsedOrder);
              
              // Calcular el nuevo total
              const total = parsedOrder.reduce((acc, item) => {
                return acc + (item.quantity * item.price);
              }, 0);
              setTotal(total);
              
              // Resetear estado de pago si cambia el pedido
              if (paymentSuccess) {
                setPaymentSuccess(false);
              }
              
              // Añadir efecto de actualización
              if (orderRef.current) {
                orderRef.current.classList.add('order-updated');
                setTimeout(() => {
                  if (orderRef.current) {
                    orderRef.current.classList.remove('order-updated');
                  }
                }, 1000);
              }
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
  }, [orderDetails.length, paymentSuccess]);

  const clearOrder = () => {
    if (isPaying || paymentSuccess) return;
    
    // Usar el servicio para limpiar la orden
    clearCurrentOrderAndSync();
    setOrderDetails([]);
    setTotal(0);
  };

  const removeItem = (itemId: string, index: number) => {
    if (isPaying || paymentSuccess) return;
    
    if (!itemId) {
      // Fallback para cuando no tenemos ID (usar el enfoque anterior)
      const updatedOrder = [...orderDetails];
      updatedOrder.splice(index, 1);
      setOrderDetails(updatedOrder);
      
      // Recalcular total
      const newTotal = updatedOrder.reduce((acc, item) => acc + (item.quantity * item.price), 0);
      setTotal(newTotal);
      
      // Actualizar localStorage
      const updatedOrderJson = JSON.stringify(updatedOrder);
      localStorage.setItem('orderDetails', updatedOrderJson);
      
      // Emitir evento de orden actualizada
      const customEvent = new CustomEvent('orderDetailsUpdated', {
        detail: updatedOrderJson
      });
      window.dispatchEvent(customEvent);
    } else {
      // Usar el servicio para eliminar el ítem
      removeItemFromOrderAndSync(itemId);
    }
  };

  const processPayment = () => {
    if (orderDetails.length === 0 || isPaying || paymentSuccess) return;
    
    setIsPaying(true);
    
    // Simular procesamiento de pago
    setTimeout(() => {
      setIsPaying(false);
      setPaymentSuccess(true);
      
      // Después de 3 segundos, limpiar el pedido
      setTimeout(() => {
        clearOrder();
        setPaymentSuccess(false);
      }, 3000);
    }, 1500);
  };

  const formatCurrency = (amount: number) => {
    // Modificación para voz: separar el número y la moneda con un espacio
    // y eliminar decimales cuando no son necesarios para mejorar la lectura
    const hasDecimals = amount % 1 !== 0;
    const formatted = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: hasDecimals ? 2 : 0
    }).format(amount);
    
    // Reemplazar el símbolo de peso pegado al número por uno con espacio
    // para mejorar la lectura del asistente de voz
    return formatted.replace('$', '$ ');
  };

  // Determinar el icono adecuado según el ID o categoría del producto
  const getProductIcon = (item: OrderDetail) => {
    // Primero revisar por ID específico para mayor precisión
    if (item.id) {
      // Tacos
      if (item.id.includes('taco')) {
        return <Utensils size={18} className="text-amber-600" />;
      }
      // Bebidas específicas
      else if (item.id.includes('agua-horchata')) {
        return <GlassWater size={18} className="text-amber-100" />;
      }
      else if (item.id.includes('agua-jamaica')) {
        return <GlassWater size={18} className="text-red-400" />;
      }
      else if (item.id.includes('refresco')) {
        return <CupSoda size={18} className="text-red-500" />;
      }
      // Extras específicos
      else if (item.id.includes('guacamole')) {
        return <Salad size={18} className="text-green-600" />;
      }
      else if (item.id.includes('quesadilla')) {
        return <Sandwich size={18} className="text-yellow-600" />;
      }
      else if (item.id.includes('queso')) {
        return <Cherry size={18} className="text-yellow-400" />;
      }
      else if (item.id.includes('cebollitas')) {
        return <ChefHat size={18} className="text-green-400" />;
      }
    }
    
    // Si no se identificó por ID, usar la categoría
    if (item.categoryId) {
      switch (item.categoryId) {
        case 'tacos':
          return <Utensils size={18} className="text-amber-600" />;
        case 'bebidas':
          return <Coffee size={18} className="text-blue-500" />;
        case 'extras':
          return <Salad size={18} className="text-green-500" />;
        default:
          return <ShoppingCart size={18} className="text-amber-500" />;
      }
    }
    
    // Usar nombre como último recurso
    const name = item.name.toLowerCase();
    if (name.includes('taco')) {
      return <Utensils size={18} className="text-amber-600" />;
    } else if (name.includes('agua')) {
      return <GlassWater size={18} className="text-blue-400" />;
    } else if (name.includes('refresco')) {
      return <CupSoda size={18} className="text-red-500" />;
    } else if (name.includes('guacamole')) {
      return <Salad size={18} className="text-green-600" />;
    } else if (name.includes('quesadilla')) {
      return <Sandwich size={18} className="text-yellow-600" />;
    } else if (name.includes('queso')) {
      return <Cherry size={18} className="text-yellow-400" />;
    } else if (name.includes('cebollita')) {
      return <ChefHat size={18} className="text-green-400" />;
    }
    
    // Icono por defecto
    return <ShoppingCart size={18} className="text-amber-500" />;
  };

  return (
    <div ref={orderRef} className="bg-white rounded-lg shadow-lg p-5 h-full flex flex-col animate-fade-in">
      <div className="bg-gradient-to-r from-amber-600 to-amber-500 rounded-t-lg -mt-5 -mx-5 p-4 mb-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <ShoppingCart className="mr-2 text-2xl animate-pulse-slow" /> 
          Detalles del Pedido
        </h2>
      </div>
      
      {/* Pago exitoso */}
      {paymentSuccess && (
        <div className="flex-grow flex flex-col items-center justify-center text-green-500 animate-fade-in">
          <CheckCircle className="text-6xl mb-3 text-green-500 animate-bounce-slow" />
          <p className="text-lg font-medium">¡Pago procesado con éxito!</p>
          <p className="text-sm mt-2 text-center">Tu pedido ha sido enviado a cocina</p>
        </div>
      )}
      
      {/* Carrito vacío */}
      {!paymentSuccess && orderDetails.length === 0 && (
        <div className="flex-grow flex flex-col items-center justify-center text-gray-500">
          <ShoppingCart className="text-6xl mb-3 text-amber-300 animate-bounce-slow" />
          <p className="text-lg font-medium">Tu pedido está vacío</p>
          <p className="text-sm mt-2 text-center">Los productos que menciones al agente aparecerán aquí</p>
        </div>
      )}
      
      {/* Productos en el carrito */}
      {!paymentSuccess && orderDetails.length > 0 && (
        <>
          <div className="flex-grow overflow-auto order-items-container">
            {orderDetails.map((item, index) => (
              <div 
                key={index} 
                className={`mb-3 p-3 border border-gray-100 rounded-lg shadow-sm hover-float product-card bg-white flex flex-col transition-all duration-300 ${
                  animatingItemId === index ? 'scale-105 border-amber-300 shadow-md' : ''
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-grow flex items-center">
                    <div className="h-10 w-10 mr-3 bg-amber-50 rounded-full flex items-center justify-center">
                      {getProductIcon(item)}
                    </div>
                    <div className="flex-grow">
                      <div className="flex flex-col">
                        <div className="font-medium text-amber-800">{item.name}</div>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">{item.quantity}</span> × {formatCurrency(item.price)}
                          </p>
                          <p className="font-semibold text-amber-700">
                            {formatCurrency(item.quantity * item.price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeItem(item.id || '', index)}
                    className={`ml-2 text-gray-400 hover:text-red-500 transition-colors ${isPaying ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-label="Eliminar producto"
                    disabled={isPaying}
                  >
                    <Trash2 size={20} className="hover:rotate-12 transition-transform" />
                  </button>
                </div>
                
                {item.specialInstructions && (
                  <div className="mt-2 pl-12 pr-2">
                    <div className="p-2 bg-amber-50 rounded-md text-sm text-gray-700 flex items-start">
                      <MessageCircle size={16} className="text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                      <p>{item.specialInstructions}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium text-gray-800">Total:</span>
              <span className="font-bold text-xl text-amber-700">{formatCurrency(total)}</span>
            </div>
            
            <div className="flex justify-between">
              <button 
                onClick={clearOrder}
                className={`btn px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors hover:shadow-sm ${
                  isPaying ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={isPaying}
              >
                <span className="flex items-center">
                  <Trash2 size={18} className="mr-2" />
                  Limpiar pedido
                </span>
              </button>
              
              <button 
                onClick={processPayment}
                className={`btn ripple bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md shadow-md transition-all flex items-center hover:scale-105 ${
                  isPaying ? 'opacity-75 cursor-wait' : ''
                }`}
                disabled={isPaying}
              >
                {isPaying ? (
                  <>
                    <div className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="mr-2" /> 
                    Proceder al pago
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderDetails; 