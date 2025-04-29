'use client';

import React, { useState, useEffect, useRef } from 'react';
import { endCall } from '@/lib/callFunctions';

interface OrderDetail {
  name: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
}

const OrderDetails = () => {
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const [total, setTotal] = useState(0);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [showThankYouMessage, setShowThankYouMessage] = useState(false);
  const orderRef = useRef<HTMLDivElement>(null);
  const celebrationSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Inicializar el elemento de audio para la celebración
    if (typeof window !== 'undefined') {
      celebrationSoundRef.current = new Audio('/sounds/celebration.mp3');
    }
    
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
      
      // Mostrar mensaje de agradecimiento después de un breve retraso
      setTimeout(() => {
        setShowThankYouMessage(true);
        
        // Reproducir sonido de celebración
        try {
          if (celebrationSoundRef.current) {
            celebrationSoundRef.current.volume = 0.5;
            celebrationSoundRef.current.play().catch(error => {
              console.warn('Error al reproducir sonido de celebración:', error);
            });
          }
        } catch (error) {
          console.warn('Error al reproducir el sonido de celebración:', error);
        }
        
        // Terminar la llamada automáticamente
        setTimeout(async () => {
          try {
            await endCall();
            // NO resetear el estado del pedido ni ocultar el mensaje de agradecimiento
          } catch (error) {
            console.error('Error al finalizar la llamada:', error);
          }
        }, 5000); // Reducido a 5 segundos pero sólo para terminar la llamada
        
      }, 1500);
    }, 2000);
  };

  // Función para iniciar un nuevo pedido
  const startNewOrder = async () => {
    // Resetear todos los estados
    clearOrder();
    setPaymentCompleted(false);
    setShowThankYouMessage(false);
    
    // Opcionalmente, redirigir a la página principal o reiniciar el componente
    // Si estamos en la página principal, simplemente reiniciamos el estado
    window.location.reload(); // Esto recargará la página para comenzar un nuevo pedido
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
      {showThankYouMessage ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center thank-you-container relative overflow-hidden p-4">
          {/* Confetis mejorados */}
          {Array(40).fill(0).map((_, index) => (
            <div 
              key={index} 
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 20 - 20}%`,
                backgroundColor: ['#FF6B00', '#FFC107', '#F44336'][Math.floor(Math.random() * 3)],
                width: `${Math.random() * 10 + 5}px`, 
                height: `${Math.random() * 15 + 10}px`,
                animationDuration: `${3 + Math.random() * 4}s`,
                animationDelay: `${Math.random() * 0.5}s`
              }}
            />
          ))}
          
          <div className="celebration-animation mb-4">
            <span className="text-orange-500 animate-bounce text-7xl">🎉</span>
          </div>
          <h2 className="text-3xl font-bold text-orange-600 mb-3 thank-you-message animate-scale-in">¡Gracias por tu pedido!</h2>
          <p className="text-xl text-amber-700 mb-2 animate-fade-in-up delay-150">Tu orden estará lista pronto</p>
          <p className="text-lg text-orange-500 animate-fade-in-up delay-300">¡Buen provecho!</p>
          
          <button 
            onClick={startNewOrder}
            className="mt-8 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg shadow-md transition-all hover:shadow-lg hover:scale-105 animate-fade-in-up delay-500 flex items-center gap-2"
          >
            <span className="text-xl">🛒</span>
            Hacer un nuevo pedido
          </button>
        </div>
      ) : (
        <>
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-t-lg -mt-5 -mx-5 p-4 mb-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <span className="mr-2 text-2xl">🛒</span>
              Detalles del Pedido
            </h2>
          </div>
          
          {orderDetails.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center text-gray-500">
              <span className="text-6xl mb-3 text-amber-300 animate-bounce-slow">🛒</span>
              <p className="text-lg font-medium">Tu pedido está vacío</p>
              <p className="text-sm mt-2 text-center">Los productos que menciones al agente aparecerán aquí</p>
            </div>
          ) : (
            <>
              <div className="flex-grow overflow-auto order-items-container">
                {orderDetails.map((item, index) => (
                  <div key={index} className="mb-3 p-4 border border-amber-100 rounded-lg shadow-sm hover:shadow-md transition-shadow product-card bg-white">
                    <div className="flex justify-between items-start">
                      <div className="flex-grow">
                        <div className="flex justify-between mb-2">
                          <h3 className="font-medium text-lg text-amber-900">{item.name}</h3>
                          <p className="font-semibold text-orange-600">
                            {formatCurrency(item.quantity * item.price)}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 text-sm text-gray-600 mb-1">
                          <span className="flex items-center gap-1">
                            <span className="inline-block w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold">
                              {item.quantity}
                            </span>
                            <span className="text-amber-600">unidad{item.quantity !== 1 ? 'es' : ''}</span>
                          </span>
                          <span className="text-right font-medium text-orange-600">
                            {formatCurrency(item.price)} c/u
                          </span>
                        </div>
                        {item.specialInstructions && (
                          <div className="mt-2 text-sm text-gray-700 bg-amber-50 p-2 rounded-md border-l-2 border-amber-400">
                            <span className="font-medium block text-xs text-amber-700 mb-1">Instrucciones especiales:</span>
                            <p className="italic text-amber-800">
                              {item.specialInstructions}
                            </p>
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => removeItem(index)}
                        className="ml-2 text-gray-400 hover:text-orange-500 transition-colors p-1 hover:bg-amber-50 rounded-full"
                        aria-label="Eliminar producto"
                      >
                        <span className="text-lg">🗑️</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-amber-200 pt-4 mt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium text-amber-800">Total:</span>
                  <span className="font-bold text-xl text-orange-600">{formatCurrency(total)}</span>
                </div>
                
                <div className="flex justify-between">
                  <button 
                    onClick={clearOrder}
                    className="btn px-4 py-2 border border-amber-300 rounded-md text-amber-700 hover:bg-amber-50 transition-colors"
                    disabled={isPaymentProcessing || paymentCompleted}
                  >
                    Limpiar pedido
                  </button>
                  
                  <button 
                    onClick={handlePayment}
                    disabled={isPaymentProcessing || paymentCompleted || orderDetails.length === 0}
                    className={`btn ripple px-4 py-2 rounded-md shadow-md transition-all flex items-center ${
                      isPaymentProcessing ? 'bg-amber-500 cursor-wait' : 
                      paymentCompleted ? 'bg-orange-600 hover:bg-orange-700' : 
                      'bg-orange-600 hover:bg-orange-700 hover:scale-105'
                    } text-white`}
                  >
                    {isPaymentProcessing ? (
                      <>
                        <div className="animate-spin mr-2 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                        Procesando...
                      </>
                    ) : paymentCompleted ? (
                      <>
                        <span className="mr-2">✅</span>
                        ¡Pago exitoso!
                      </>
                    ) : (
                      <>
                        <span className="mr-2">💰</span> 
                        Proceder al pago
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}
      
      {/* Sonido de celebración fallback (por si falla la carga dinámica) */}
      <audio id="celebration-sound" src="/sounds/celebration.mp3" preload="none" />
      
      <style jsx>{`
        @keyframes celebration {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .celebration-animation {
          animation: celebration 1s ease-out forwards;
        }
        
        @keyframes scale-in {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .animate-scale-in {
          animation: scale-in 0.6s ease-out forwards;
        }
        
        @keyframes fade-in-up {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .delay-150 {
          animation-delay: 150ms;
        }
        
        .delay-300 {
          animation-delay: 300ms;
        }
        
        .delay-500 {
          animation-delay: 500ms;
        }
        
        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          background-color: #FFC107;
          animation: confetti-fall 6s ease-in-out forwards;
          z-index: 1;
        }
        
        @keyframes confetti-fall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderDetails; 