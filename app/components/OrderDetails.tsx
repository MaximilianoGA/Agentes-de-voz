'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ShoppingCart, Trash2, ShoppingBag, Coffee, Pizza, Utensils, 
  MessageCircle, CheckCircle, Soup, GlassWater, CupSoda, 
  Cherry, ChefHat, Sandwich, Beef, Salad, BadgeDollarSign,
  Trash, Receipt
} from 'lucide-react';
import { clearCurrentOrderAndSync, removeItemFromOrderAndSync } from '../lib/services/orderService';
import { formatCurrency } from '../lib/utils';

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
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [animatingItemId, setAnimatingItemId] = useState<number | null>(null);
  const orderRef = useRef<HTMLDivElement>(null);

  // === Handlers de Eventos ===

  const handleOrderUpdate = useCallback((event: CustomEvent) => {
    try {
      console.log("Evento orderDetailsUpdated recibido:", event.detail);
      let updatedOrder: OrderItem[];
        
      if (typeof event.detail === 'string') {
        try {
          updatedOrder = JSON.parse(event.detail);
        } catch { updatedOrder = [] }
      } else if (Array.isArray(event.detail)) {
        updatedOrder = event.detail;
      } else if (event.detail && Array.isArray(event.detail.items)) {
        updatedOrder = event.detail.items; // Asumiendo estructura { items: [...] }
      } else {
        console.warn("Formato de datos desconocido en orderDetailsUpdated:", event.detail);
        return;
      }
      
      const validatedOrder = updatedOrder.map(item => ({
        name: item.name || "Producto sin nombre",
        quantity: Number(item.quantity) || 1,
        price: Number(item.price) || 0,
        id: item.id || '',
        categoryId: item.categoryId || '',
        specialInstructions: item.specialInstructions || ""
      }));
      
      setOrder(validatedOrder);
      // Considerar si aún es necesario guardar en localStorage si orderService ya lo hace
      // localStorage.setItem("currentOrder", JSON.stringify(validatedOrder)); 
    } catch (error) {
      console.error("Error al procesar actualización de pedido:", error);
    }
  }, []); // Dependencias vacías si no depende de estado/props del componente

  const handleProcessPayment = () => {
    if (order.length === 0) return;
    
    console.log("Procesando pago...");
    setPaymentProcessing(true);
    
    // Simulación de procesamiento
    setTimeout(() => {
      // Disparar evento de pago exitoso
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent('paymentCompleted', {
          detail: {
            success: true,
            timestamp: new Date().toISOString(),
            orderId: generateRandomOrderId(),
            items: order,
            total: total,
            paymentMethod: 'efectivo'
          }
        }));
      }
      
      // Mostrar mensaje de éxito
      setPaymentProcessing(false);
      setPaymentSuccess(true);
    }, 1500);
  };

  const handlePaymentCompleted = useCallback((event: CustomEvent) => {
    const { success, orderId } = event.detail || {};
    console.log("Evento paymentCompleted recibido:", success, orderId);
    if (success) {
      // Limpiar pedido (considerar si clearCurrentOrderAndSync ya actualiza la UI)
      setOrder([]); // Limpiar UI directamente
      localStorage.removeItem("currentOrder");
      setPaymentSuccess(true);
      
      // Reproducir sonido de éxito si está disponible
      try {
        const audio = new Audio('/sounds/success.mp3');
        audio.play().catch(e => console.log('No se pudo reproducir el sonido', e));
      } catch (e) {
        console.error('Error al reproducir sonido:', e);
      }
      
      // Activar confeti si la librería está disponible
      try {
        if (typeof window !== "undefined" && window.confetti) {
          window.confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      } catch (e) {
        console.error('Error al ejecutar confeti:', e);
      }
    }
  }, []); // Dependencias vacías

  const handleCallEnded = useCallback(() => {
    console.log("Llamada finalizada - limpiando estado");
    // Resetear estados relacionados con la llamada
    setOrder([]);
    setPaymentSuccess(false);
    setPaymentProcessing(false);
    localStorage.removeItem("currentOrder");
  }, []); // Dependencias vacías

  // === Fin Handlers de Eventos ===

  useEffect(() => {
    // Cargar pedido inicial de localStorage (si aplica)
    try {
      const savedOrder = localStorage.getItem("currentOrder"); // Usar una única clave
      if (savedOrder) {
        const parsedOrder = JSON.parse(savedOrder);
        if (Array.isArray(parsedOrder)) {
          // Validar/Normalizar antes de establecer el estado
          const validatedOrder = parsedOrder.map(item => ({
            name: item.name || "Producto sin nombre",
            quantity: Number(item.quantity) || 1,
            price: Number(item.price) || 0,
            id: item.id || '',
            categoryId: item.categoryId || '',
            specialInstructions: item.specialInstructions || ""
          }));
          setOrder(validatedOrder);
        }
      }
    } catch (error) {
      console.error("Error al cargar pedido guardado:", error);
      localStorage.removeItem("currentOrder"); // Limpiar si hay error
    }

    // Registrar todos los event listeners
    window.addEventListener("orderDetailsUpdated", handleOrderUpdate as EventListener);
    window.addEventListener("processPayment", handleProcessPayment as EventListener);
    window.addEventListener("paymentCompleted", handlePaymentCompleted as EventListener);
    window.addEventListener("callEnded", handleCallEnded as EventListener);

    // Limpieza al desmontar
    return () => {
      window.removeEventListener("orderDetailsUpdated", handleOrderUpdate as EventListener);
      window.removeEventListener("processPayment", handleProcessPayment as EventListener);
      window.removeEventListener("paymentCompleted", handlePaymentCompleted as EventListener);
      window.removeEventListener("callEnded", handleCallEnded as EventListener);
    };
    // Incluir todos los handlers como dependencias para que se registren con la versión correcta
  }, [handleOrderUpdate, handleProcessPayment, handlePaymentCompleted, handleCallEnded]);

  useEffect(() => {
    const calculatedTotal = order.reduce((sum, item) => {
      const itemPrice = Number(item.price) || 0;
      const itemQuantity = Number(item.quantity) || 1;
      return sum + (itemPrice * itemQuantity);
    }, 0);
    setTotal(calculatedTotal);
  }, [order]);

  // Función para eliminar item (usar servicio)
  const removeItem = useCallback(async (index: number) => {
    if (!order[index]?.id) return; // Necesitamos id para el servicio
    try {
      await removeItemFromOrderAndSync(order[index].id);
      // El hook useOrder debería actualizar el estado, si no, actualizar manualmente
      // const updatedOrder = order.filter((_, i) => i !== index);
      // setOrder(updatedOrder);
    } catch (error) {
      console.error("Error al eliminar item:", error);
    }
    // Quitar animación (si existe)
    setAnimatingItemId(null);
  }, [order]); // Depende de 'order'

  // Función para limpiar pedido (usar servicio)
  const clearOrder = useCallback(async () => {
    try {
      await clearCurrentOrderAndSync();
      // El hook useOrder debería actualizar el estado, si no, actualizar manualmente
      setOrder([]);
      localStorage.removeItem("currentOrder");
    } catch (error) { 
      console.error("Error al limpiar el pedido:", error);
    }
  }, []); // No depende de estado local
  
  // Obtener el icono del producto
  const getProductIcon = useCallback((item: OrderItem) => {
    // Intentar obtener el ID del producto
    const productId = item.id || '';
    const categoryId = item.categoryId || ''; // Usar categoryId si está disponible
    const nameLower = item.name.toLowerCase();
    
    // Priorizar categoryId si existe
    if (categoryId === 'tacos' || productId.includes('taco') || nameLower.includes('taco')) {
      return <Pizza className="h-6 w-6 text-amber-700" />;
    } else if (categoryId === 'bebidas') {
        if (productId.includes('agua') || nameLower.includes('agua')) return <GlassWater className="h-6 w-6 text-blue-600" />;
        if (productId.includes('refresco') || nameLower.includes('refresco') || nameLower.includes('soda')) return <CupSoda className="h-6 w-6 text-red-600" />;
        if (productId.includes('cerveza') || nameLower.includes('cerveza')) return <Coffee className="h-6 w-6 text-yellow-700" />; // Icono placeholder
        return <GlassWater className="h-6 w-6 text-gray-600" />; // Bebida genérica
    } else if (categoryId === 'extras') {
        if (productId.includes('quesadilla') || nameLower.includes('quesadilla')) return <Sandwich className="h-6 w-6 text-yellow-600" />;
        if (productId.includes('torta') || nameLower.includes('torta')) return <Sandwich className="h-6 w-6 text-orange-600" />;
        if (productId.includes('sopa') || nameLower.includes('sopa')) return <Soup className="h-6 w-6 text-amber-600" />;
        if (productId.includes('guacamole') || nameLower.includes('guacamole')) return <Salad className="h-6 w-6 text-green-600" />;
        if (productId.includes('postre') || nameLower.includes('postre') || nameLower.includes('flan')) return <Cherry className="h-6 w-6 text-pink-600" />;
        return <ChefHat className="h-6 w-6 text-purple-600" />; // Extra genérico
    } else {
      // Fallback por nombre si no hay categoryId
      if (nameLower.includes('taco')) return <Pizza className="h-6 w-6 text-amber-700" />;
      if (nameLower.includes('agua')) return <GlassWater className="h-6 w-6 text-blue-600" />;
      if (nameLower.includes('refresco') || nameLower.includes('soda')) return <CupSoda className="h-6 w-6 text-red-600" />;
      if (nameLower.includes('quesadilla')) return <Sandwich className="h-6 w-6 text-yellow-600" />;
      if (nameLower.includes('torta')) return <Sandwich className="h-6 w-6 text-orange-600" />;
      if (nameLower.includes('sopa')) return <Soup className="h-6 w-6 text-amber-600" />;
      if (nameLower.includes('guacamole') || nameLower.includes('ensalada')) return <Salad className="h-6 w-6 text-green-600" />;
      if (nameLower.includes('cerveza')) return <Coffee className="h-6 w-6 text-yellow-700" />;
      if (nameLower.includes('postre') || nameLower.includes('flan')) return <Cherry className="h-6 w-6 text-pink-600" />;
      return <Utensils className="h-6 w-6 text-gray-600" />; // Ícono por defecto
    }
  }, []);

  // Generar ID aleatorio (simple, solo para simulación)
  const generateRandomOrderId = () => `ORD-${Date.now().toString().slice(-5)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

  return (
    <div 
      className="bg-white rounded-lg shadow-lg overflow-hidden border border-amber-100 h-full flex flex-col"
      ref={orderRef}
    >
      <div className="bg-gradient-to-r from-amber-600 to-amber-500 p-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center text-white">
          <ShoppingCart size={20} className="mr-2" />
          <h2 className="text-xl font-bold">Detalles del Pedido</h2>
        </div>
        <button
          onClick={clearOrder}
          className="text-white p-1 rounded-full hover:bg-amber-700 transition-colors"
          disabled={paymentSuccess || order.length === 0}
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
        <div className="flex-grow flex flex-col items-center justify-center text-gray-500 p-8">
          <ShoppingCart className="text-6xl mb-3 text-amber-300 animate-bounce-slow" />
          <p className="text-lg font-medium">Tu pedido está vacío</p>
          <p className="text-sm mt-2 text-center">Los productos que menciones al agente aparecerán aquí</p>
        </div>
      )}
      
      {/* Productos en el carrito */}
      {!paymentSuccess && order.length > 0 && (
        <div className="flex-grow flex flex-col overflow-hidden">
          {/* Contenedor para el contenido scrollable */}
          <div className="flex-grow overflow-y-auto p-3">
            {order.map((item, index) => (
              <div 
                key={index} 
                className={`mb-3 p-3 border ${
                  animatingItemId === index 
                    ? 'border-amber-300 bg-amber-50 animate-pulse-short' 
                    : 'border-gray-100 bg-white'
                } rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex flex-col`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-grow flex items-center">
                    <div className="h-12 w-12 mr-3 bg-amber-50 rounded-full flex items-center justify-center">
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
                        {item.specialInstructions && (
                          <div className="mt-1 text-sm italic text-gray-500 bg-amber-50 p-1 px-2 rounded border-l-2 border-amber-300">
                            {item.specialInstructions}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeItem(index)}
                    className="ml-2 text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                    aria-label="Eliminar producto"
                  >
                    <Trash className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Nota informativa */}
          <div className="bg-amber-100 p-3 mx-3 rounded-md mb-3">
            <div className="flex items-start">
              <Receipt className="mt-1 mr-2 text-amber-600 flex-shrink-0 h-5 w-5" />
              <p className="text-amber-700 text-sm">
                Al confirmar tu pedido, se registrará en nuestro sistema. El pago se realizará físicamente en caja.
              </p>
            </div>
          </div>
          
          {/* Pie con total y botones */}
          <div className="border-t border-gray-200 p-4 bg-white sticky bottom-0 z-10 shrink-0">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium text-gray-800">Total:</span>
              <span className="font-bold text-xl text-amber-700">{formatCurrency(total)}</span>
            </div>
            
            <div className="flex justify-between">
              <button 
                onClick={clearOrder}
                className="btn px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors hover:shadow-sm"
                disabled={paymentProcessing}
              >
                <span className="flex items-center">
                  <Trash2 size={18} className="mr-2" />
                  Limpiar
                </span>
              </button>
              
              <button 
                onClick={handleProcessPayment}
                className={`btn bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-md shadow-md transition-all flex items-center justify-center ${(order.length === 0 || paymentProcessing) ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={order.length === 0 || paymentProcessing}
              >
                {paymentProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <BadgeDollarSign className="w-5 h-5 mr-2" />
                    Confirmar Pedido
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails; 