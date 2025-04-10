import React, { ReactNode } from 'react';
import { PhoneIcon, PhoneOffIcon } from 'lucide-react';

interface CallStatusProps {
  status?: string;
  isCallActive?: boolean;
  agentStatus?: string;
  onCallClick?: (modelOverride?: string, showDebugMessages?: boolean) => void;
  children?: ReactNode;
}

const CallStatus: React.FC<CallStatusProps> = ({ 
  status, 
  isCallActive = false, 
  agentStatus = 'off',
  onCallClick,
  children 
}) => {
  // Usar agentStatus si está disponible, de lo contrario usar status
  const displayStatus = agentStatus || status || 'Desconectado';
  
  return (
    <div className="flex flex-col bg-gradient-to-r from-amber-100 to-amber-50 border border-amber-200 rounded-lg p-4 w-full shadow-sm">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-amber-900 mb-2">Estado de Llamada</h2>
        
        {onCallClick && (
          <button 
            onClick={() => onCallClick()}
            className={`flex items-center justify-center p-2 rounded-full transition-all duration-300 
              ${isCallActive 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'}`}
            aria-label={isCallActive ? "Terminar llamada" : "Iniciar llamada"}
          >
            {isCallActive ? <PhoneOffIcon size={18} /> : <PhoneIcon size={18} />}
          </button>
        )}
      </div>
      
      <div className="mt-2">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${displayStatus === 'off' ? 'bg-red-600' : 'bg-green-600'} ${displayStatus !== 'off' ? 'animate-pulse' : ''}`}></div>
          <p className="text-lg font-medium text-amber-900">
            Estado: <span className="text-amber-700">{
              displayStatus === 'speaking' ? 'Asistente hablando...' :
              displayStatus === 'listening' ? 'Asistente escuchando...' :
              displayStatus === 'off' ? 'Desconectado' : 
              displayStatus
            }</span>
          </p>
        </div>
      </div>

      {/* Optional Children */}
      {children}
    </div>
  );
};

export default CallStatus;