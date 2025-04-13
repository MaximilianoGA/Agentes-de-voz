'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ShoppingCart, Trash2, ShoppingBag, Coffee, Pizza, Utensils, 
  MessageCircle, CheckCircle, Soup, GlassWater, CupSoda, 
  Cherry, ChefHat, Sandwich, Beef, Salad, BadgeDollarSign,
  Trash, User, Phone, AtSign, Receipt, ClockIcon, MapPin
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

interface ContactData {
  name: string;
  phone: string;
  email: string;
}

const OrderDetails = () => {
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [contactData, setContactData] = useState<ContactData>({
    name: '',
    phone: '',
    email: '',
  });
  const [completedFields, setCompletedFields] = useState<Record<string, boolean>>({});
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const [waitingSeconds, setWaitingSeconds] = useState(0);
  const orderRef = useRef<HTMLDivElement>(null);
  const [animatingItemId, setAnimatingItemId] = useState<number | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showThankYouMessage, setShowThankYouMessage] = useState(false);
  const [paidOrderId, setPaidOrderId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const paymentFormRef = useRef<HTMLDivElement>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleProcessPayment = useCallback(() => {
    console.log("Evento processPayment recibido, mostrando formulario...");
    setShowContactForm(true);
    if (paymentFormRef.current) {
      paymentFormRef.current.scrollIntoView({ behavior: 'smooth' });
      paymentFormRef.current.classList.add('highlight-payment-form');
      setTimeout(() => {
        if (paymentFormRef.current) {
          paymentFormRef.current.classList.remove('highlight-payment-form');
        }
      }, 1500);
    }
    if (typeof window !== 'undefined' && (window as any).playSound) {
      (window as any).playSound('notification', 0.5);
    }
  }, []); // Dependencias vacías

  const handlePaymentCompleted = useCallback((event: CustomEvent) => {
    const { success, orderId } = event.detail || {};
    console.log("Evento paymentCompleted recibido:", success, orderId);
    if (success) {
      // Limpiar pedido (considerar si clearCurrentOrderAndSync ya actualiza la UI)
      // clearCurrentOrderAndSync(); 
      setOrder([]); // Limpiar UI directamente
      setContactData({ name: '', phone: '', email: '' }); // Resetear formulario
      setCompletedFields({});
      setShowThankYouMessage(true);
      setPaidOrderId(orderId || generateRandomOrderId());
      setShowContactForm(false);
      if (typeof window !== 'undefined' && (window as any).playSound) {
        (window as any).playSound('success', 0.5);
      }
      setTimeout(() => setShowThankYouMessage(false), 8000);
    } else {
      setErrorMessage('Hubo un problema al registrar el pedido. Por favor intenta nuevamente.');
      if (typeof window !== 'undefined' && (window as any).playSound) {
        (window as any).playSound('error', 0.3);
      }
      setTimeout(() => setErrorMessage(''), 5000);
    }
  }, []); // Dependencias vacías

  const highlightCompletedField = useCallback((fieldName: string) => {
      const fieldElement = document.getElementById(`contact-${fieldName}`);
      if (fieldElement) {
        fieldElement.classList.add('field-completed-animation');
        // Opcional: quitar clase después de un tiempo
        setTimeout(() => {
          fieldElement.classList.remove('field-completed-animation');
        }, 1500); 
      }
  }, []);

  const handleVoicePaymentInput = useCallback((event: CustomEvent) => {
    const { field, value } = event.detail || {};
    console.log("Voice contact input received:", field, value);
    if (field && value && typeof value === 'string') {
      let normalizedField = field.toLowerCase().trim();
      if (['nombre', 'clientname'].includes(normalizedField)) normalizedField = 'name';
      else if (['telefono', 'teléfono', 'phone', 'celular', 'móvil', 'movil'].includes(normalizedField)) normalizedField = 'phone';
      else if (['correo', 'email', 'correo electrónico', 'correo electronico', 'mail'].includes(normalizedField)) normalizedField = 'email';
      
      if (['name', 'phone', 'email'].includes(normalizedField)) {
          setContactData(prevData => ({ ...prevData, [normalizedField]: value }));
          setCompletedFields(prev => ({ ...prev, [normalizedField]: true }));
          highlightCompletedField(normalizedField);
          if (typeof window !== 'undefined' && (window as any).playSound) {
            (window as any).playSound('complete', 0.3);
          }
      }
    }
  }, [highlightCompletedField]); // Dependencia explícita

  const handleCallEnded = useCallback(() => {
    console.log("Llamada finalizada - limpiando estado");
    // Resetear estados relacionados con la llamada
    setOrder([]);
    setContactData({ name: '', phone: '', email: '' });
    setCompletedFields({});
    setShowContactForm(false);
    setPaymentSuccess(false);
    setShowThankYouMessage(false);
    setPaidOrderId('');
    setErrorMessage('');
    // Considerar si clearCurrentOrderAndSync debe llamarse aquí
    // clearCurrentOrderAndSync();
    // Resetear cualquier estado de espera
    setWaitingForResponse(false);
    setWaitingSeconds(0);
    if (timerRef.current) clearTimeout(timerRef.current);

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
    window.addEventListener("voicePaymentInput", handleVoicePaymentInput as EventListener);
    window.addEventListener("callEnded", handleCallEnded as EventListener);

    // Limpieza al desmontar
    return () => {
      window.removeEventListener("orderDetailsUpdated", handleOrderUpdate as EventListener);
      window.removeEventListener("processPayment", handleProcessPayment as EventListener);
      window.removeEventListener("paymentCompleted", handlePaymentCompleted as EventListener);
      window.removeEventListener("voicePaymentInput", handleVoicePaymentInput as EventListener);
      window.removeEventListener("callEnded", handleCallEnded as EventListener);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
    // Incluir todos los handlers como dependencias para que se registren con la versión correcta
  }, [handleOrderUpdate, handleProcessPayment, handlePaymentCompleted, handleVoicePaymentInput, handleCallEnded]);

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
      setErrorMessage("Error al eliminar el producto.");
      setTimeout(() => setErrorMessage(''), 3000);
    }
    // Quitar animación (si existe)
    setAnimatingItemId(null);
  }, [order]); // Depende de 'order'

  // Función para limpiar pedido (usar servicio)
  const clearOrder = useCallback(async () => {
    try {
      await clearCurrentOrderAndSync();
      // El hook useOrder debería actualizar el estado, si no, actualizar manualmente
      // setOrder([]);
      // setContactData({ name: '', phone: '', email: '' });
      // setCompletedFields({});
      // setShowContactForm(false);
    } catch (error) { 
      console.error("Error al limpiar el pedido:", error);
      setErrorMessage("Error al limpiar el pedido.");
      setTimeout(() => setErrorMessage(''), 3000);
    }
  }, []); // No depende de estado local

  // ... (resto de funciones: handleProcessPaymentRequest, generateRandomOrderId, calculateTotal, handleInputChange, getProductIcon, etc.)
  
  // Función para manejar cambios en los campos de formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setContactData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Actualizar completedFields basado en si el campo tiene valor
    setCompletedFields(prev => ({
      ...prev,
      [name]: value.trim() !== ''
    }));
  };

  // Función para verificar si todos los campos están completos
  const areAllFieldsCompleted = useCallback(() => {
    return ['name', 'phone', 'email'].every(field => contactData[field as keyof ContactData]?.trim() !== '');
  }, [contactData]);

  // Función para obtener el icono del producto
  const getProductIcon = useCallback((item: OrderItem) => {
     // ... (lógica existente para obtener icono)
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

  // Función para obtener clase de resaltado
  const isFieldCompleted = (field: keyof ContactData): boolean => {
    return completedFields[field] === true;
  };

  const highlightClass = (field: keyof ContactData): string => {
    return isFieldCompleted(field) 
      ? "bg-green-50 border-green-300" 
      : "";
  };

  // Función para manejar la solicitud de procesar pago (botón)
  const handleProcessPaymentRequest = () => {
    if (!areAllFieldsCompleted()) {
        setErrorMessage("Por favor completa todos los campos de contacto.");
        setTimeout(() => setErrorMessage(''), 3000);
        // Podríamos también resaltar los campos faltantes
        return;
    }
    console.log("Registrando pedido con datos:", contactData);
    // Aquí normalmente llamarías a una API para guardar el pedido
    // Por ahora, simularemos éxito disparando 'paymentCompleted'
    const simulatedOrderId = generateRandomOrderId();
    window.dispatchEvent(new CustomEvent('paymentCompleted', {
      detail: { success: true, orderId: simulatedOrderId }
    }));
  };

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
      
      {/* Productos en el carrito y formulario integrado */}
      {!paymentSuccess && order.length > 0 && (
        <div className="flex-grow flex flex-col overflow-hidden">
          {/* Contenedor para el contenido que puede hacer scroll (productos + formulario) */}
          <div className="flex-grow overflow-y-auto">
            {/* Sección de productos del pedido */}
            <div className="bg-amber-50 p-3 border-b border-amber-100">
              <h3 className="text-lg font-semibold text-amber-800">Productos en tu pedido</h3>
            </div>
            
            {/* Lista de productos (ya tenía overflow-y-auto, puede quitarse si el padre lo maneja) 
                 Ajustar maxHeight para ser más flexible, e.g., usando vh menos espacio fijo para header/footer */}
            <div className="p-3" style={{ maxHeight: "calc(100vh - 350px)" }}> {/* Ajustar 350px según altura real de header/form/footer */}
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
              {order.length === 0 && (
                <div className="text-center py-8">
                  <ShoppingCart className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">Tu carrito está vacío</p>
                  <p className="text-gray-400 text-sm mt-1">Agrega productos desde el menú o con comandos de voz</p>
                </div>
              )}
            </div>

            {/* Datos de contacto integrados */}
            <div className="border-t border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-amber-800 mb-4 flex items-center">
                <User size={18} className="mr-2" />
                Datos de Contacto
              </h3>
              
              {/* Indicador de espera */}
              {waitingForResponse && (
                <div className="mb-3 bg-blue-50 p-2 rounded flex items-center text-blue-700">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  <span>Esperando respuesta...{waitingSeconds > 0 ? ` (${waitingSeconds}s)` : ''}</span>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
                    <span>Nombre completo <span className="text-red-500">*</span></span>
                    {isFieldCompleted('name') && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full flex items-center">
                        <MessageCircle size={12} className="mr-1" />
                        Completado por voz
                      </span>
                    )}
                  </label>
                  <div className={`relative ${highlightClass('name')}`}>
                    <User size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={contactData.name}
                      onChange={handleInputChange}
                      className={`pl-10 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800 ${completedFields['name'] ? 'bg-green-50' : ''}`}
                      placeholder="Nombre completo"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
                      <span>Teléfono <span className="text-red-500">*</span></span>
                      {isFieldCompleted('phone') && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full flex items-center">
                          <MessageCircle size={12} className="mr-1" />
                          Completado por voz
                        </span>
                      )}
                    </label>
                    <div className={`relative ${highlightClass('phone')}`}>
                      <Phone size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={contactData.phone}
                        onChange={handleInputChange}
                        className={`pl-10 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800 ${completedFields['phone'] ? 'bg-green-50' : ''}`}
                        placeholder="55 1234 5678"
                      />
                    </div>
                  </div>
                  
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
                      <span>Correo electrónico <span className="text-red-500">*</span></span>
                      {isFieldCompleted('email') && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full flex items-center">
                          <MessageCircle size={12} className="mr-1" />
                          Completado por voz
                        </span>
                      )}
                    </label>
                    <div className={`relative ${highlightClass('email')}`}>
                      <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="email"
                        name="email"
                        value={contactData.email || ''}
                        onChange={handleInputChange}
                        className={`pl-10 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800 ${completedFields['email'] ? 'bg-green-50' : ''}`}
                        placeholder="correo@ejemplo.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-amber-100 p-3 rounded-md my-4">
                <div className="flex items-start">
                  <Receipt size={16} className="mt-1 mr-2 text-amber-600 flex-shrink-0" />
                  <p className="text-amber-700 text-sm">
                    Este formulario registra tu pedido. El pago se realizará físicamente en caja.
                  </p>
                </div>
              </div>
            </div>
          </div> {/* Fin del contenedor de scroll */} 
          
          {/* Pie con total y botones (sticky dentro del contenedor principal) */}
          <div className="border-t border-gray-200 p-4 bg-white sticky bottom-0 z-10 shrink-0">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium text-gray-800">Total:</span>
              <span className="font-bold text-xl text-amber-700">{formatCurrency(total)}</span>
            </div>
            
            <div className="flex justify-between">
              <button 
                onClick={clearOrder}
                className="btn px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors hover:shadow-sm"
              >
                <span className="flex items-center">
                  <Trash2 size={18} className="mr-2" />
                  Limpiar
                </span>
              </button>
              
              <button 
                onClick={handleProcessPaymentRequest}
                className={`btn bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md shadow-md transition-all flex items-center ${(!areAllFieldsCompleted() || order.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!areAllFieldsCompleted() || order.length === 0}
              >
                <BadgeDollarSign className="w-5 h-5 mr-2" />
                Registrar Pedido
              </button>
            </div>
          </div>
        </div> // Fin del contenedor principal de scroll
      )}
    </div>
  );
};

export default OrderDetails; 