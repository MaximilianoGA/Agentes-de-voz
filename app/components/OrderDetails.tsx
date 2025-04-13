'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Trash2, ShoppingBag, CheckCircle } from 'lucide-react';

interface OrderDetail {
  name: string;
  quantity: number;
  price: number;
}

const OrderDetails = () => {
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const [total, setTotal] = useState(0);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const orderRef = useRef<HTMLDivElement>(null);

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
              setOrderDetails(parsedOrder);
              
              // Calcular el nuevo total
              const total = parsedOrder.reduce((acc, item) => {
                return acc + (item.quantity * item.price);
              }, 0);
              setTotal(total);
              
              // Guardar en localStorage
              localStorage.setItem('orderDetails', updatedOrder);
              
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
  }, []);

  const clearOrder = () => {
    setOrderDetails([]);
    setTotal(0);
    localStorage.removeItem('orderDetails');
    
    // Emitir evento de orden actualizada (vacía)
    const emptyOrderJson = JSON.stringify([]);
    const customEvent = new CustomEvent('orderDetailsUpdated', {
      detail: emptyOrderJson
    });
    window.dispatchEvent(customEvent);
  };

  const removeItem = (index: number) => {
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
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handlePayment = () => {
    if (orderDetails.length === 0) return;
    
    // Iniciar animación de procesamiento
    setIsPaymentProcessing(true);
    
    // Simular un procesamiento de pago
    setTimeout(() => {
      setIsPaymentProcessing(false);
      setPaymentCompleted(true);
      
      // Enviar evento para que el agente sepa que el pago se completó
      const paymentEvent = new CustomEvent('paymentCompleted', {
        detail: {
          total: total,
          items: orderDetails,
          timestamp: new Date().toISOString()
        }
      });
      window.dispatchEvent(paymentEvent);
      
      // Resetear estado después de unos segundos
      setTimeout(() => {
        setPaymentCompleted(false);
        clearOrder();
      }, 3000);
      
    }, 2000);
  };

  useEffect(() => {
    // Escuchar solicitudes de pago del agente
    const handleAgentPaymentRequest = () => {
      if (orderDetails.length > 0 && !isPaymentProcessing && !paymentCompleted) {
        handlePayment();
      }
    };
    
    window.addEventListener('agentRequestPayment', handleAgentPaymentRequest as EventListener);
    
    return () => {
      window.removeEventListener('agentRequestPayment', handleAgentPaymentRequest as EventListener);
    };
  }, [orderDetails, isPaymentProcessing, paymentCompleted]);

  return (
    <div ref={orderRef} className="bg-white rounded-lg shadow-lg p-5 h-full flex flex-col animate-fade-in">
      <div className="bg-gradient-to-r from-amber-600 to-amber-500 rounded-t-lg -mt-5 -mx-5 p-4 mb-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <ShoppingCart className="mr-2 text-2xl" /> 
          Detalles del Pedido
        </h2>
      </div>
      
      {orderDetails.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center text-gray-500">
          <ShoppingCart className="text-6xl mb-3 text-amber-300 animate-bounce-slow" />
          <p className="text-lg font-medium">Tu pedido está vacío</p>
          <p className="text-sm mt-2 text-center">Los productos que menciones al agente aparecerán aquí</p>
        </div>
      ) : (
        <>
          <div className="flex-grow overflow-auto order-items-container">
            {orderDetails.map((item, index) => (
              <div key={index} className="mb-3 p-3 border border-gray-100 rounded-lg shadow-sm hover-float product-card bg-white flex justify-between items-center">
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} × {formatCurrency(item.price)}
                      </p>
                    </div>
                    <p className="font-semibold text-amber-700">
                      {formatCurrency(item.quantity * item.price)}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => removeItem(index)}
                  className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Eliminar producto"
                >
                  <Trash2 size={20} />
                </button>
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
                className="btn px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isPaymentProcessing || paymentCompleted}
              >
                Limpiar pedido
              </button>
              
              <button 
                onClick={handlePayment}
                disabled={isPaymentProcessing || paymentCompleted || orderDetails.length === 0}
                className={`btn ripple px-4 py-2 rounded-md shadow-md transition-all flex items-center ${
                  isPaymentProcessing ? 'bg-amber-500 cursor-wait' : 
                  paymentCompleted ? 'bg-green-600 hover:bg-green-700' : 
                  'bg-amber-600 hover:bg-amber-700'
                } text-white`}
              >
                {isPaymentProcessing ? (
                  <>
                    <div className="animate-spin mr-2 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Procesando...
                  </>
                ) : paymentCompleted ? (
                  <>
                    <CheckCircle className="mr-2" />
                    ¡Pago exitoso!
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