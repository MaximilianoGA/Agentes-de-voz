'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CreditCard, Check, User, Phone, AtSign, X, AlertCircle, Clock, Printer, Receipt } from 'lucide-react';

interface PaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (paymentData: PaymentFormData) => void;
  orderTotal: number;
}

export interface PaymentFormData {
  clientName: string;
  email: string;
  phone: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ isOpen, onClose, onSubmit, orderTotal }) => {
  const [formData, setFormData] = useState<PaymentFormData>({
    clientName: '',
    email: '',
    phone: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [activeField, setActiveField] = useState<keyof PaymentFormData | null>(null);
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);
  const [waitingForUserResponse, setWaitingForUserResponse] = useState(false);
  const [waitingSeconds, setWaitingSeconds] = useState(0);
  const [showReceiptOption, setShowReceiptOption] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const waitingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const requiredFields: (keyof PaymentFormData)[] = ['clientName', 'phone'];
    const isComplete = requiredFields.every(field => !!formData[field].trim());
    
    setIsFormComplete(isComplete);
    
    if (isComplete && formError) {
      setFormError(null);
    }

    if (waitingForConfirmation) {
      setWaitingForConfirmation(false);
    }
  }, [formData, formError, waitingForConfirmation]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node) && !isProcessing) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, isProcessing]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (waitingForUserResponse && waitingSeconds > 0) {
      timer = setInterval(() => {
        setWaitingSeconds(prev => prev - 1);
      }, 1000);
    } else if (waitingSeconds === 0 && waitingForUserResponse) {
      setWaitingForUserResponse(false);
    }

    // Función para manejar el evento de espera por respuesta
    const handleWaitingForResponse = () => {
      console.log('Esperando respuesta del usuario...');
      setWaitingForUserResponse(true);
      setWaitingSeconds(3); // Iniciar temporizador de 3 segundos
    };

    // Función para manejar cuando el usuario comienza a hablar
    const handleUserStartedTalking = () => {
      console.log('Usuario comenzó a hablar');
      setWaitingForUserResponse(false);
      setWaitingSeconds(0);
    };

    window.addEventListener('waitingForUserResponse', handleWaitingForResponse);
    window.addEventListener('userStartedTalking', handleUserStartedTalking);

    return () => {
      if (timer) clearInterval(timer);
      window.removeEventListener('waitingForUserResponse', handleWaitingForResponse);
      window.removeEventListener('userStartedTalking', handleUserStartedTalking);
    };
  }, [waitingForUserResponse, waitingSeconds]);

  useEffect(() => {
    const handleVoiceInput = (event: CustomEvent) => {
      const { field, value } = event.detail;
      
      if (field && typeof field === 'string' && value && typeof value === 'string') {
        setWaitingForUserResponse(false);
        if (waitingIntervalRef.current) {
          clearInterval(waitingIntervalRef.current);
          waitingIntervalRef.current = null;
        }
        
        // Mapeo de campos de voz a campos del formulario
        const fieldMapping: Record<string, keyof PaymentFormData> = {
          'cardHolder': 'clientName',
          'titular': 'clientName',
          'nombre': 'clientName',
          'email': 'email',
          'correo': 'email',
          'teléfono': 'phone',
          'phone': 'phone'
        };
        
        const mappedField = fieldMapping[field.toLowerCase()] || field;
        
        if (mappedField in formData) {
          setFormData(prev => ({
            ...prev,
            [mappedField]: value
          }));
          
          setActiveField(mappedField as keyof PaymentFormData);
          
          setTimeout(() => {
            setActiveField(null);
          }, 1500);
        }
      }
    };

    window.addEventListener('voicePaymentInput', handleVoiceInput as EventListener);
    
    return () => {
      window.removeEventListener('voicePaymentInput', handleVoiceInput as EventListener);
    };
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (waitingForUserResponse) {
      setWaitingForUserResponse(false);
      if (waitingIntervalRef.current) {
        clearInterval(waitingIntervalRef.current);
        waitingIntervalRef.current = null;
      }
    }
    
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.clientName.trim()) {
      setFormError('El nombre es obligatorio');
      return false;
    }
    
    if (!formData.phone.trim()) {
      setFormError('El número de teléfono es obligatorio');
      return false;
    }
    
    setFormError(null);
    return true;
  };

  const prepareForConfirmation = () => {
    if (!validateForm()) {
      return;
    }
    
    setWaitingForConfirmation(true);
    
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent('paymentReadyForConfirmation'));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (waitingForUserResponse) {
      setWaitingForUserResponse(false);
      if (waitingIntervalRef.current) {
        clearInterval(waitingIntervalRef.current);
      }
    }
    
    if (waitingForConfirmation) {
      confirmPayment();
    } else {
      prepareForConfirmation();
    }
  };

  const confirmPayment = () => {
    if (!validateForm()) {
      return;
    }
    
    setIsProcessing(true);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      onSubmit(formData);
      setIsProcessing(false);
      setWaitingForConfirmation(false);
      setShowReceiptOption(true);
    }, 2000);
  };

  const handleVoicePaymentProcess = () => {
    setWaitingForUserResponse(false);
    if (waitingIntervalRef.current) {
      clearInterval(waitingIntervalRef.current);
    }
    
    if (isFormComplete) {
      if (waitingForConfirmation) {
        confirmPayment();
      } else {
        prepareForConfirmation();
      }
    } else {
      setFormError('Por favor completa todos los campos obligatorios antes de confirmar el pedido');
    }
  };

  const printReceipt = () => {
    // Simulación de impresión
    console.log("Imprimiendo recibo...");
    alert("Recibo enviado a la impresora");
  };

  useEffect(() => {
    const handleVoicePaymentProcess = () => {
      if (isOpen) {
        if (isFormComplete) {
          handleVoicePaymentProcess();
        } else {
          setFormError('Por favor completa todos los campos obligatorios antes de confirmar el pedido');
        }
      }
    };

    window.addEventListener('voicePaymentProcess', handleVoicePaymentProcess);
    
    return () => {
      window.removeEventListener('voicePaymentProcess', handleVoicePaymentProcess);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isOpen, isFormComplete]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (waitingIntervalRef.current) {
        clearInterval(waitingIntervalRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog" aria-labelledby="payment-form-title">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden relative animate-fade-in"
      >
        {/* Indicador de espera por respuesta del usuario */}
        {waitingForUserResponse && (
          <div className="absolute top-0 inset-x-0 bg-blue-500 text-white p-2 flex items-center justify-center z-20">
            <Clock size={18} className="animate-pulse mr-2" />
            <span>
              Esperando respuesta... {waitingSeconds > 0 ? `(${waitingSeconds}s)` : ''}
            </span>
          </div>
        )}
        
        {/* Encabezado */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-500 p-5 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Datos de Contacto</h2>
            <button 
              onClick={onClose}
              className="text-white hover:text-amber-200 transition-colors"
              disabled={isProcessing}
            >
              <X size={24} />
            </button>
          </div>
          <p className="text-amber-100 mt-1">Total a pagar: ${orderTotal.toFixed(2)} MXN</p>
        </div>
        
        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6">
          {formError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm flex items-start">
              <AlertCircle size={16} className="mt-0.5 mr-2 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}
          
          {/* Mensaje de confirmación */}
          {waitingForConfirmation && (
            <div className="bg-amber-50 text-amber-700 p-3 rounded-md mb-4 text-sm">
              <p className="font-medium">Por favor confirma los datos para registrar tu pedido:</p>
              <ul className="mt-2 space-y-1">
                <li><span className="font-semibold">Nombre:</span> {formData.clientName}</li>
                {formData.email && <li><span className="font-semibold">Correo:</span> {formData.email}</li>}
                <li><span className="font-semibold">Teléfono:</span> {formData.phone}</li>
              </ul>
            </div>
          )}
          
          {/* Opciones de impresión de recibo */}
          {showReceiptOption && (
            <div className="bg-green-50 text-green-700 p-4 rounded-md mb-4 text-sm">
              <div className="flex items-center mb-2">
                <Check size={18} className="mr-2 text-green-600" />
                <p className="font-medium">¡Pedido registrado correctamente!</p>
              </div>
              <p className="mb-3">Por favor, pasa a caja para realizar el pago correspondiente.</p>
              <button 
                type="button"
                onClick={printReceipt}
                className="w-full flex items-center justify-center bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
              >
                <Printer size={16} className="mr-2" />
                Imprimir Recibo
              </button>
            </div>
          )}
          
          {/* Datos de contacto */}
          {!showReceiptOption && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                <User size={18} className="mr-2 text-amber-600" />
                Información de Contacto
              </h3>
              
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre completo <span className="text-red-500">*</span>
                  </label>
                  <div className={`relative ${activeField === 'clientName' ? 'ring-2 ring-amber-500' : ''}`}>
                    <User size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleChange}
                      className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800"
                      placeholder="Nombre completo"
                      disabled={isProcessing || waitingForConfirmation}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                    <div className={`relative ${activeField === 'email' ? 'ring-2 ring-amber-500' : ''}`}>
                      <AtSign size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800"
                        placeholder="correo@ejemplo.com"
                        disabled={isProcessing || waitingForConfirmation}
                      />
                    </div>
                  </div>
                  
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono <span className="text-red-500">*</span>
                    </label>
                    <div className={`relative ${activeField === 'phone' ? 'ring-2 ring-amber-500' : ''}`}>
                      <Phone size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800"
                        placeholder="55 1234 5678"
                        disabled={isProcessing || waitingForConfirmation}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Aviso de pago en caja */}
          {!showReceiptOption && (
            <div className="bg-amber-50 p-3 rounded-md mb-4">
              <div className="flex items-start">
                <Receipt size={16} className="mt-1 mr-2 text-amber-600 flex-shrink-0" />
                <p className="text-amber-700 text-sm">
                  Este formulario registra tu pedido. El pago se realizará físicamente en caja.
                </p>
              </div>
            </div>
          )}
          
          {/* Botón de pago */}
          {!showReceiptOption && (
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-medium py-3 px-4 rounded-md shadow-md hover:shadow-lg transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={isProcessing || (!isFormComplete && !waitingForConfirmation)}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Procesando...
                </>
              ) : waitingForConfirmation ? (
                <>
                  <Check size={18} className="mr-2" />
                  Confirmar Pedido
                </>
              ) : (
                <>
                  <Receipt size={18} className="mr-2" />
                  Registrar Pedido
                </>
              )}
            </button>
          )}
          
          {!showReceiptOption && (
            <p className="text-xs text-center text-gray-500 mt-4">
              Tus datos están seguros. Utilizamos encriptación de 256 bits para proteger tu información.
              <br />
              <span className="text-red-500">*</span> Campos obligatorios
            </p>
          )}
          
          {/* Botón para cerrar después de mostrar recibo */}
          {showReceiptOption && (
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cerrar
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default PaymentForm; 