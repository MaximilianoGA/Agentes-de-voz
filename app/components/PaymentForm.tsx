'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CreditCard, Check, User, Phone, AtSign, X, AlertCircle, Clock, Printer, Receipt, CheckCircle, BadgeCheck } from 'lucide-react';
import { getCurrentOrder } from '../lib/services/orderService';

interface ContactData {
  name: string;
  phone: string;
  email: string;
}

interface PaymentFormProps {
  onClose: () => void;
  onPaymentComplete?: (data: any) => void;
}

export default function PaymentForm({ onClose, onPaymentComplete }: PaymentFormProps) {
  const [contactData, setContactData] = useState<ContactData>({
    name: '',
    phone: '',
    email: ''
  });
  const [completedFields, setCompletedFields] = useState<Set<string>>(new Set());
  const [waitingForUserResponse, setWaitingForUserResponse] = useState(false);
  const [waitingSeconds, setWaitingSeconds] = useState(0);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [activePaymentMethod, setActivePaymentMethod] = useState<string>('efectivo');
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const formRef = useRef<HTMLDivElement>(null);
  const waitingTimerRef = useRef<number | null>(null);

  // Cargar los datos del pedido actual
  useEffect(() => {
    const currentOrder = getCurrentOrder();
    if (currentOrder) {
      setOrderDetails({
        items: currentOrder.items,
        total: currentOrder.totalAmount,
        orderId: currentOrder.id
      });
    }

    // Intentar cargar datos de contacto previamente guardados
    const savedContactData = localStorage.getItem('lastContactData');
    if (savedContactData) {
      try {
        const parsedData = JSON.parse(savedContactData);
        setContactData(parsedData);
        
        // Marcar campos como completados si tienen valores
        const completed = new Set<string>();
        if (parsedData.name) completed.add('name');
        if (parsedData.phone) completed.add('phone');
        if (parsedData.email) completed.add('email');
        setCompletedFields(completed);
      } catch (e) {
        console.error('Error al cargar datos de contacto guardados:', e);
      }
    }
  }, []);

  // Manejar eventos de entrada de datos por voz
  useEffect(() => {
    const handleVoicePaymentInput = (event: CustomEvent) => {
      const { field, value } = event.detail || {};
      
      if (field && value && typeof value === 'string') {
        // Actualizar los datos de contacto
        setContactData(prevData => ({
          ...prevData,
          [field]: value
        }));
        
        // Marcar el campo como completado
        setCompletedFields(prev => {
          const newSet = new Set(prev);
          newSet.add(field);
          return newSet;
        });
        
        // Animación de feedback
        const fieldElement = document.getElementById(`payment-${field}`);
        if (fieldElement) {
          fieldElement.classList.add('field-completed-animation');
          setTimeout(() => {
            fieldElement.classList.remove('field-completed-animation');
          }, 1000);
        }
      }
    };

    // Escuchar el evento de espera para respuesta de usuario
    const handleWaitingForUserResponse = () => {
      setWaitingForUserResponse(true);
      setWaitingSeconds(0);
      
      // Iniciar temporizador para mostrar segundos de espera
      if (waitingTimerRef.current) {
        window.clearInterval(waitingTimerRef.current);
      }
      
      waitingTimerRef.current = window.setInterval(() => {
        setWaitingSeconds(prev => prev + 1);
      }, 1000);
    };

    // Escuchar el evento de usuario comenzó a hablar
    const handleUserStartedTalking = () => {
      setWaitingForUserResponse(false);
      
      // Detener temporizador
      if (waitingTimerRef.current) {
        window.clearInterval(waitingTimerRef.current);
        waitingTimerRef.current = null;
      }
    };

    // Agregar event listeners
    window.addEventListener('voicePaymentInput', handleVoicePaymentInput as EventListener);
    window.addEventListener('waitingForUserResponse', handleWaitingForUserResponse);
    window.addEventListener('userStartedTalking', handleUserStartedTalking);

    // Limpiar event listeners
    return () => {
      window.removeEventListener('voicePaymentInput', handleVoicePaymentInput as EventListener);
      window.removeEventListener('waitingForUserResponse', handleWaitingForUserResponse);
      window.removeEventListener('userStartedTalking', handleUserStartedTalking);
      
      // Limpiar temporizador
      if (waitingTimerRef.current) {
        window.clearInterval(waitingTimerRef.current);
      }
    };
  }, []);

  // Manejar cambio de campos manualmente
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setContactData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Marcar o desmarcar como completado
    setCompletedFields(prev => {
      const newSet = new Set(prev);
      if (value.trim() !== '') {
        newSet.add(name);
      } else {
        newSet.delete(name);
      }
      return newSet;
    });
  };

  // Validar el formulario
  const validateForm = (): boolean => {
    return completedFields.has('name') && 
           completedFields.has('phone') && 
           completedFields.has('email');
  };

  // Procesar el pago
  const handleSubmitPayment = () => {
    if (!validateForm()) {
      // Resaltar campos incompletos
      const form = formRef.current;
      if (form) {
        form.classList.add('validate-form');
        setTimeout(() => {
          form.classList.remove('validate-form');
        }, 1000);
      }
      return;
    }
    
    setPaymentProcessing(true);
    
    // Simular procesamiento de pago
    setTimeout(() => {
      setPaymentProcessing(false);
      setPaymentSuccess(true);
      
      // Guardar datos de contacto para futuras compras
      localStorage.setItem('lastContactData', JSON.stringify(contactData));
      
      // Llamar al callback con los datos del pago completado
      if (onPaymentComplete) {
        onPaymentComplete({
          success: true,
          timestamp: new Date().toISOString(),
          orderId: orderDetails?.orderId || `ORD-${Date.now().toString().slice(-6)}`,
          contactData: contactData,
          items: orderDetails?.items || [],
          total: orderDetails?.total || 0,
          paymentMethod: activePaymentMethod
        });
      }
      
      // Cerrar el formulario después de mostrar éxito
      setTimeout(() => {
        onClose();
      }, 2000);
    }, 1500);
  };

  // Obtener la clase de un campo basado en si está completado
  const getFieldClass = (fieldName: string): string => {
    return completedFields.has(fieldName) 
      ? 'border-green-500 bg-green-50' 
      : 'border-gray-300 focus:border-amber-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 relative overflow-hidden" ref={formRef}>
      {/* Cabecera */}
      <div className="bg-amber-600 text-white p-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Finalizar Pedido</h2>
        <button 
          onClick={onClose}
          className="text-white hover:text-amber-200 transition-colors"
          aria-label="Cerrar"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      
      {/* Contenido */}
      <div className="p-5">
        {paymentSuccess ? (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <BadgeCheck className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-green-600 mb-2">¡Pago Completado!</h3>
            <p className="text-gray-600">Tu pedido ha sido registrado exitosamente.</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Información de Contacto</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="payment-name" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    Nombre completo
                    {completedFields.has('name') && (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completado
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="payment-name"
                      name="name"
                      value={contactData.name}
                      onChange={handleInputChange}
                      className={`pl-10 p-2 w-full rounded-md shadow-sm transition-colors ${getFieldClass('name')}`}
                      placeholder="Ingresa tu nombre"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="payment-phone" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    Teléfono
                    {completedFields.has('phone') && (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completado
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="payment-phone"
                      name="phone"
                      value={contactData.phone}
                      onChange={handleInputChange}
                      className={`pl-10 p-2 w-full rounded-md shadow-sm transition-colors ${getFieldClass('phone')}`}
                      placeholder="Ingresa tu teléfono"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="payment-email" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    Correo electrónico
                    {completedFields.has('email') && (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completado
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <AtSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="payment-email"
                      name="email"
                      value={contactData.email}
                      onChange={handleInputChange}
                      className={`pl-10 p-2 w-full rounded-md shadow-sm transition-colors ${getFieldClass('email')}`}
                      placeholder="Ingresa tu correo"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Método de pago</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setActivePaymentMethod('efectivo')}
                  className={`p-3 rounded-md border flex flex-col items-center transition-all ${
                    activePaymentMethod === 'efectivo' 
                      ? 'border-amber-500 bg-amber-50 shadow-md' 
                      : 'border-gray-300 hover:border-amber-300'
                  }`}
                >
                  <CreditCard className={`h-6 w-6 mb-2 ${activePaymentMethod === 'efectivo' ? 'text-amber-600' : 'text-gray-500'}`} />
                  <span className={`text-sm font-medium ${activePaymentMethod === 'efectivo' ? 'text-amber-700' : 'text-gray-700'}`}>Efectivo</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setActivePaymentMethod('tarjeta')}
                  className={`p-3 rounded-md border flex flex-col items-center transition-all ${
                    activePaymentMethod === 'tarjeta' 
                      ? 'border-amber-500 bg-amber-50 shadow-md' 
                      : 'border-gray-300 hover:border-amber-300'
                  }`}
                >
                  <CreditCard className={`h-6 w-6 mb-2 ${activePaymentMethod === 'tarjeta' ? 'text-amber-600' : 'text-gray-500'}`} />
                  <span className={`text-sm font-medium ${activePaymentMethod === 'tarjeta' ? 'text-amber-700' : 'text-gray-700'}`}>Tarjeta</span>
                </button>
              </div>
            </div>
            
            <div className="mt-8">
              <button
                onClick={handleSubmitPayment}
                disabled={!validateForm() || paymentProcessing}
                className={`w-full py-3 px-4 rounded-md transition-all shadow-md flex items-center justify-center ${
                  validateForm() && !paymentProcessing
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {paymentProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    Confirmar y Pagar
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
      
      {/* Indicador de espera de respuesta */}
      {waitingForUserResponse && (
        <div className="absolute bottom-0 left-0 right-0 bg-blue-50 text-blue-700 p-2 flex items-center justify-center border-t border-blue-200">
          <Clock className="h-5 w-5 text-blue-500 animate-pulse mr-2" />
          <span>Esperando respuesta...{waitingSeconds > 0 ? ` (${waitingSeconds}s)` : ''}</span>
        </div>
      )}
    </div>
  );
} 