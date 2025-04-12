'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ShoppingCart, Trash2, ShoppingBag, Coffee, Pizza, Utensils, 
  MessageCircle, CheckCircle, Soup, GlassWater, CupSoda, 
  Cherry, ChefHat, Sandwich, Beef, Salad, BadgeDollarSign,
  Trash
} from 'lucide-react';
import { clearCurrentOrderAndSync, removeItemFromOrderAndSync } from '../lib/services/orderService';
import PaymentForm, { PaymentFormData } from './PaymentForm';

// Función para formatear precios
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2
  }).format(amount);
};

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  id?: string; // Para identificar el tipo de producto
  categoryId?: string; // Para determinar el icono adecuado
  specialInstructions?: string; // Instrucciones especiales para el producto
}

const OrderDetails = () => {
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const orderRef = useRef<HTMLDivElement>(null);
  const [animatingItemId, setAnimatingItemId] = useState<number | null>(null);

  useEffect(() => {
    // Intentar cargar pedidos guardados de localStorage
    try {
      const savedOrder = localStorage.getItem("currentOrder") || localStorage.getItem("orderDetails");
      if (savedOrder) {
        const parsedOrder = JSON.parse(savedOrder);
        if (Array.isArray(parsedOrder)) {
          setOrder(parsedOrder);
        }
      }
    } catch (error) {
      console.error("Error al cargar pedidos guardados:", error);
    }

    // Función para manejar actualizaciones de pedido
    const handleOrderUpdate = (event: CustomEvent) => {
      try {
        console.log("Evento orderDetailsUpdated recibido:", event.detail);
        
        let updatedOrder: OrderItem[];
        
        if (typeof event.detail === 'string') {
          updatedOrder = JSON.parse(event.detail);
        } else if (Array.isArray(event.detail)) {
          updatedOrder = event.detail;
        } else if (event.detail && typeof event.detail === 'object') {
          // Intenta extraer los datos si están en un objeto con alguna propiedad conocida
          if (Array.isArray(event.detail.orderItems)) {
            updatedOrder = event.detail.orderItems;
          } else {
            console.warn("Formato de datos desconocido:", event.detail);
            return;
          }
        } else {
          console.warn("Formato de datos desconocido:", event.detail);
          return;
        }
        
        // Validar y normalizar los items del pedido
        const validatedOrder = updatedOrder.map(item => ({
          name: item.name || "Producto sin nombre",
          quantity: Number(item.quantity) || 1,
          price: Number(item.price) || 0,
          specialInstructions: item.specialInstructions || ""
        }));
        
        setOrder(validatedOrder);
        localStorage.setItem("currentOrder", JSON.stringify(validatedOrder));
      } catch (error) {
        console.error("Error al procesar actualización de pedido:", error);
      }
    };

    // Función para manejar peticiones de procesamiento de pago
    const handleProcessPayment = () => {
      console.log("Procesando pago...");
      setIsPaymentOpen(true);
    };

    // Función para manejar finalización de llamada
    const handleCallEnded = () => {
      console.log("Llamada finalizada - limpiando estado");
      clearOrder();
      setPaymentSuccess(false);
    };

    // Agregar escuchadores de eventos
    window.addEventListener("orderDetailsUpdated", handleOrderUpdate as EventListener);
    window.addEventListener("processPayment", handleProcessPayment);
    window.addEventListener("callEnded", handleCallEnded);

    // Limpiar escuchadores al desmontar
    return () => {
      window.removeEventListener("orderDetailsUpdated", handleOrderUpdate as EventListener);
      window.removeEventListener("processPayment", handleProcessPayment);
      window.removeEventListener("callEnded", handleCallEnded);
    };
  }, []);

  useEffect(() => {
    const calculatedTotal = order.reduce((sum, item) => {
      const itemPrice = Number(item.price) || 0;
      const itemQuantity = Number(item.quantity) || 1;
      return sum + (itemPrice * itemQuantity);
    }, 0);
    
    setTotal(calculatedTotal);
  }, [order]);

  const removeItem = (index: number) => {
    const updatedOrder = [...order];
    updatedOrder.splice(index, 1);
    setOrder(updatedOrder);
    localStorage.setItem("currentOrder", JSON.stringify(updatedOrder));
    
    // Disparar evento de actualización
    const event = new CustomEvent("orderDetailsUpdated", {
      detail: JSON.stringify(updatedOrder),
    });
    window.dispatchEvent(event);
  };

  const clearOrder = () => {
    setOrder([]);
    localStorage.removeItem("currentOrder");
    localStorage.removeItem("orderDetails");
    setIsPaymentOpen(false);
  };

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    setIsPaymentOpen(false);
    clearOrder();
  };

  // Manejar entrada de datos de pago por voz
  const handleVoicePaymentInput = useCallback((field: string, value: string) => {
    if (typeof window !== "undefined" && isPaymentOpen) {
      // Crear y disparar un evento para el formulario de pago
      const event = new CustomEvent('voicePaymentInput', {
        detail: { field, value }
      });
      window.dispatchEvent(event);
      console.log(`[OrderDetails] Enviando dato de pago por voz: ${field} = ${value}`);
    }
  }, [isPaymentOpen]);

  // Añadir detector para comandos de voz relacionados con datos de pago
  useEffect(() => {
    const handleVoiceCommand = (event: CustomEvent) => {
      const { command, data } = event.detail;
      
      if (command === 'paymentInput' && data && typeof data === 'object') {
        const { field, value } = data;
        if (field && value) {
          handleVoicePaymentInput(field, value);
        }
      } else if (command === 'completePayment' && isPaymentOpen) {
        // Disparar evento para completar el proceso de pago
        window.dispatchEvent(new CustomEvent('voicePaymentProcess'));
      }
    };
    
    window.addEventListener('voiceCommand', handleVoiceCommand as EventListener);
    
    return () => {
      window.removeEventListener('voiceCommand', handleVoiceCommand as EventListener);
    };
  }, [isPaymentOpen, handleVoicePaymentInput]);

  // Determinar el icono adecuado según el ID o categoría del producto
  const getProductIcon = (item: OrderItem) => {
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
    <div 
      className="bg-white rounded-lg shadow-lg overflow-hidden border border-amber-100"
      ref={orderRef}
    >
      <div className="bg-gradient-to-r from-amber-600 to-amber-500 p-4 flex justify-between items-center">
        <div className="flex items-center text-white">
          <ShoppingCart size={20} className="mr-2" />
          <h2 className="text-xl font-bold">Detalles del Pedido</h2>
        </div>
        <button
          onClick={clearOrder}
          className="text-white p-1 rounded-full hover:bg-amber-700 transition-colors"
          disabled={isPaymentOpen || paymentSuccess || order.length === 0}
          title="Limpiar pedido"
        >
          <Trash2 size={18} />
        </button>
      </div>
      
      {/* Pago exitoso */}
      {paymentSuccess && (
        <div className="flex-grow flex flex-col items-center justify-center py-8 animate-fade-in">
          <CheckCircle className="text-6xl mb-3 text-green-500 animate-bounce-slow" />
          <p className="text-lg font-semibold text-green-700">¡Pedido registrado con éxito!</p>
          <p className="text-sm mt-2 text-center text-green-600 mb-4">Tu pedido ha sido enviado a cocina</p>
          <button 
            onClick={() => {
              clearOrder();
              setPaymentSuccess(false);
            }}
            className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-sm flex items-center"
          >
            <ShoppingBag className="mr-2" size={18} />
            Iniciar nuevo pedido
          </button>
        </div>
      )}
      
      {/* Carrito vacío */}
      {!paymentSuccess && order.length === 0 && (
        <div className="flex-grow flex flex-col items-center justify-center text-gray-500">
          <ShoppingCart className="text-6xl mb-3 text-amber-300 animate-bounce-slow" />
          <p className="text-lg font-medium">Tu pedido está vacío</p>
          <p className="text-sm mt-2 text-center">Los productos que menciones al agente aparecerán aquí</p>
        </div>
      )}
      
      {/* Productos en el carrito */}
      {!paymentSuccess && order.length > 0 && (
        <>
          <div className="flex flex-col h-full">
            {/* Encabezado */}
            <div className="bg-amber-50 p-3 rounded-t-lg border-b border-amber-100">
              <h2 className="text-lg font-semibold text-amber-800">Detalle del Pedido</h2>
            </div>
            
            {/* Contenedor de elementos del pedido */}
            <div className="max-h-[400px] overflow-y-auto order-items-container p-3">
              {order.map((item, index) => (
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
                      onClick={() => removeItem(index)}
                      className={`ml-2 text-gray-400 hover:text-red-500 transition-colors ${isPaymentOpen ? 'opacity-50 cursor-not-allowed' : ''}`}
                      aria-label="Eliminar producto"
                      disabled={isPaymentOpen}
                    >
                      <Trash className="h-4 w-4" />
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
                  isPaymentOpen ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={isPaymentOpen}
              >
                <span className="flex items-center">
                  <Trash2 size={18} className="mr-2" />
                  Limpiar pedido
                </span>
              </button>
              
              <button 
                onClick={() => setIsPaymentOpen(true)}
                className={`btn ripple bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md shadow-md transition-all flex items-center hover:scale-105 ${
                  isPaymentOpen ? 'opacity-75 cursor-wait' : ''
                }`}
                disabled={isPaymentOpen}
              >
                {isPaymentOpen ? (
                  <>
                    <div className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <BadgeDollarSign size={16} className="mr-2" /> 
                    Registrar pedido
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
      
      {/* Formulario de pago */}
      {isPaymentOpen && (
        <PaymentForm 
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          onSubmit={handlePaymentSuccess}
          orderTotal={total}
        />
      )}
    </div>
  );
};

export default OrderDetails; 