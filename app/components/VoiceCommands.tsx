import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, MessageSquare, Check, Info, AlertCircle } from 'lucide-react';

interface VoiceCommandsProps {
  isActive?: boolean;
  onToggle?: () => void;
}

export default function VoiceCommands({ isActive = false, onToggle }: VoiceCommandsProps) {
  const [listening, setListening] = useState(isActive);
  const [lastCommand, setLastCommand] = useState<string>('');
  const [commandFeedback, setCommandFeedback] = useState<string>('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'info' | 'error'>('info');
  const voiceAgent = useRef<any>(null);
  
  // Inicializar el agente de voz cuando el componente se monta
  useEffect(() => {
    if (typeof window !== 'undefined' && window.voiceAgentApi) {
      voiceAgent.current = window.voiceAgentApi;
      
      // Configuración inicial del agente de voz
      if (voiceAgent.current) {
        voiceAgent.current.configure({
          language: 'es-MX',
          recognitionOptions: {
            continuous: true,
            interimResults: true
          }
        });
      }
    }
    
    return () => {
      // Limpiar el agente de voz cuando el componente se desmonta
      if (voiceAgent.current && voiceAgent.current.stopListening) {
        voiceAgent.current.stopListening();
      }
    };
  }, []);
  
  // Sincronizar el estado de escucha con la prop isActive
  useEffect(() => {
    setListening(isActive);
    
    if (isActive && voiceAgent.current) {
      startListening();
    } else if (!isActive && voiceAgent.current) {
      stopListening();
    }
  }, [isActive]);
  
  // Agregar event listeners para comandos de voz
  useEffect(() => {
    const handleVoiceCommand = (event: CustomEvent) => {
      const { command, data } = event.detail || {};
      
      if (!command) return;
      
      setLastCommand(command);
      
      switch (command) {
        case 'addToCart':
          showFeedback('Producto agregado al carrito', 'success');
          break;
        case 'removeFromCart':
          showFeedback('Producto eliminado del carrito', 'info');
          break;
        case 'clearCart':
          showFeedback('Carrito vaciado', 'info');
          break;
        case 'paymentInput':
          if (data && data.field && data.value) {
            showFeedback(`Campo "${formatFieldName(data.field)}" completado: ${data.value}`, 'success');
            triggerVoicePaymentInput(data.field, data.value);
          }
          break;
        case 'startPayment':
          showFeedback('Iniciando proceso de pago', 'info');
          triggerProcessPayment();
          break;
        case 'cancelPayment':
          showFeedback('Proceso de pago cancelado', 'info');
          break;
        case 'confirmPayment':
          showFeedback('Confirmando pago', 'success');
          triggerPaymentCompleted(true);
          break;
        default:
          // No mostrar feedback para comandos desconocidos
          break;
      }
    };
    
    const handleVoiceError = (event: CustomEvent) => {
      const { error } = event.detail || {};
      
      showFeedback(error || 'Error en el reconocimiento de voz', 'error');
    };
    
    const handleSpeechStart = () => {
      setCommandFeedback('Escuchando...');
      setFeedbackType('info');
    };
    
    const handleSpeechEnd = () => {
      setTimeout(() => {
        if (commandFeedback === 'Escuchando...') {
          setCommandFeedback('');
        }
      }, 1500);
    };
    
    // Agregar event listeners
    window.addEventListener('voiceCommand', handleVoiceCommand as EventListener);
    window.addEventListener('voiceError', handleVoiceError as EventListener);
    window.addEventListener('speechStart', handleSpeechStart);
    window.addEventListener('speechEnd', handleSpeechEnd);
    
    return () => {
      // Limpiar event listeners
      window.removeEventListener('voiceCommand', handleVoiceCommand as EventListener);
      window.removeEventListener('voiceError', handleVoiceError as EventListener);
      window.removeEventListener('speechStart', handleSpeechStart);
      window.removeEventListener('speechEnd', handleSpeechEnd);
    };
  }, [commandFeedback]);
  
  // Funciones para controlar el agente de voz
  const startListening = () => {
    if (voiceAgent.current && voiceAgent.current.startListening) {
      voiceAgent.current.startListening();
      setListening(true);
      showFeedback('Asistente de voz activado', 'info');
    }
  };
  
  const stopListening = () => {
    if (voiceAgent.current && voiceAgent.current.stopListening) {
      voiceAgent.current.stopListening();
      setListening(false);
      showFeedback('Asistente de voz desactivado', 'info');
    }
  };
  
  const toggleListening = () => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
    
    // Llamar al callback si existe
    if (onToggle) {
      onToggle();
    }
  };
  
  // Función para mostrar feedback para los comandos de voz
  const showFeedback = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setCommandFeedback(message);
    setFeedbackType(type);
    
    // Limpiar el feedback después de un tiempo
    setTimeout(() => {
      setCommandFeedback('');
    }, 3000);
  };
  
  // Función para formatear el nombre de los campos del formulario de contacto
  const formatFieldName = (field: string): string => {
    switch (field) {
      case 'name':
        return 'Nombre';
      case 'phone':
        return 'Teléfono';
      case 'email':
        return 'Correo electrónico';
      default:
        return field;
    }
  };
  
  // Función para disparar el evento de entrada de datos de pago por voz
  const triggerVoicePaymentInput = (field: string, value: string) => {
    const event = new CustomEvent('voicePaymentInput', {
      detail: { field, value }
    });
    
    window.dispatchEvent(event);
  };
  
  // Función para disparar el evento de procesamiento de pago
  const triggerProcessPayment = () => {
    const event = new CustomEvent('processPayment', {
      detail: {
        timestamp: new Date().toISOString(),
        source: 'voice'
      }
    });
    
    window.dispatchEvent(event);
  };
  
  // Función para disparar el evento de pago completado
  const triggerPaymentCompleted = (success: boolean) => {
    const event = new CustomEvent('paymentCompleted', {
      detail: {
        success,
        timestamp: new Date().toISOString(),
        orderId: `ORD-${Date.now().toString().slice(-6)}`,
        source: 'voice'
      }
    });
    
    window.dispatchEvent(event);
  };
  
  // Icono de feedback según el tipo
  const getFeedbackIcon = () => {
    switch (feedbackType) {
      case 'success':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };
  
  return (
    <div className="flex flex-col items-center">
      <button
        onClick={toggleListening}
        className={`relative w-12 h-12 rounded-full flex items-center justify-center ${
          listening 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-green-500 hover:bg-green-600'
        } shadow-md transition-all duration-300`}
        aria-label={listening ? 'Desactivar micrófono' : 'Activar micrófono'}
      >
        {listening ? (
          <MicOff className="h-6 w-6 text-white" />
        ) : (
          <Mic className="h-6 w-6 text-white" />
        )}
        
        {listening && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
      </button>
      
      <div className="text-xs text-center mt-2 font-medium text-gray-600">
        {listening ? 'Escuchando' : 'Micrófono apagado'}
      </div>
      
      {commandFeedback && (
        <div className={`mt-4 px-3 py-2 rounded-md ${
          feedbackType === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
          feedbackType === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
          'bg-blue-50 text-blue-700 border border-blue-200'
        } flex items-center max-w-xs transition-all duration-300 animate-fadeIn`}>
          <span className="mr-2">{getFeedbackIcon()}</span>
          <span className="text-sm">{commandFeedback}</span>
        </div>
      )}
    </div>
  );
}

// Declaración de tipos para Window para evitar errores de TypeScript
declare global {
  interface Window {
    voiceAgentApi?: any;
    playSound?: (soundName: string, volume?: number) => void;
  }
} 