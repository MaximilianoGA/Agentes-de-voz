import React from 'react';
import { CheckCircle, Clock, XCircle, CreditCard, Phone, Mail, User, Utensils, Coffee, Pizza, Beer, IceCream, ChevronLeft, HelpCircle } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
  category?: string;
}

interface OrderSummaryProps {
  orderId: string;
  items: OrderItem[];
  total: number;
  contactData: {
    name: string;
    phone: string;
    email: string;
  };
  status: 'pending' | 'completed' | 'cancelled';
  paymentMethod?: 'cash' | 'card' | 'transfer';
  onBack?: () => void;
}

/**
 * Obtiene el icono de producto según categoría o id
 */
const getProductIcon = (item: OrderItem) => {
  const category = item.category?.toLowerCase() || item.id.toLowerCase();
  
  if (category.includes('taco') || category.includes('burrito') || category.includes('quesadilla')) {
    return <Utensils className="h-4 w-4 mr-2" />;
  } else if (category.includes('agua') || category.includes('refresco') || category.includes('soda')) {
    return <Coffee className="h-4 w-4 mr-2" />;
  } else if (category.includes('cerveza')) {
    return <Beer className="h-4 w-4 mr-2" />;
  } else if (category.includes('postre') || category.includes('helado')) {
    return <IceCream className="h-4 w-4 mr-2" />;
  }
  
  return <Pizza className="h-4 w-4 mr-2" />;
};

/**
 * Obtiene el icono según el estado del pedido
 */
const getStatusIcon = (status: OrderSummaryProps['status']) => {
  switch(status) {
    case 'completed':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'pending':
      return <Clock className="h-5 w-5 text-amber-500" />;
    case 'cancelled':
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Clock className="h-5 w-5 text-amber-500" />;
  }
};

/**
 * Obtiene el texto según el estado del pedido
 */
const getStatusText = (status: OrderSummaryProps['status']) => {
  switch(status) {
    case 'completed':
      return 'Completado';
    case 'pending':
      return 'Pendiente';
    case 'cancelled':
      return 'Cancelado';
    default:
      return 'Pendiente';
  }
};

/**
 * Obtiene el color según el estado del pedido
 */
const getStatusColor = (status: OrderSummaryProps['status']) => {
  switch(status) {
    case 'completed':
      return 'text-green-700 bg-green-50';
    case 'pending':
      return 'text-amber-700 bg-amber-50';
    case 'cancelled':
      return 'text-red-700 bg-red-50';
    default:
      return 'text-amber-700 bg-amber-50';
  }
};

/**
 * Obtiene el icono según el método de pago
 */
const getPaymentMethodIcon = (method?: string) => {
  switch(method) {
    case 'card':
      return <CreditCard className="h-5 w-5 text-gray-600 mr-2" />;
    case 'cash':
      return <CreditCard className="h-5 w-5 text-gray-600 mr-2" />;
    case 'transfer':
      return <CreditCard className="h-5 w-5 text-gray-600 mr-2" />;
    default:
      return <CreditCard className="h-5 w-5 text-gray-600 mr-2" />;
  }
};

/**
 * Obtiene el texto según el método de pago
 */
const getPaymentMethodText = (method?: string) => {
  switch(method) {
    case 'card':
      return 'Tarjeta';
    case 'cash':
      return 'Efectivo';
    case 'transfer':
      return 'Transferencia';
    default:
      return 'No especificado';
  }
};

const OrderSummary: React.FC<OrderSummaryProps> = ({
  orderId,
  items,
  total,
  contactData,
  status,
  paymentMethod,
  onBack
}) => {
  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden mx-auto">
      {/* Encabezado con opción para volver */}
      <div className="p-4 bg-amber-500 text-white flex justify-between items-center">
        <h2 className="text-xl font-bold">Resumen del Pedido</h2>
        {onBack && (
          <button 
            onClick={onBack}
            className="flex items-center text-sm hover:underline"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Volver
          </button>
        )}
      </div>
      
      {/* ID y estado del pedido */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">ID del Pedido</p>
            <p className="text-lg font-medium">{orderId}</p>
          </div>
          <div className="flex items-center">
            <div className={`flex items-center px-3 py-1 rounded-full ${getStatusColor(status)}`}>
              {getStatusIcon(status)}
              <span className="ml-1 text-sm font-medium">{getStatusText(status)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Productos */}
      <div className="p-4 border-b">
        <h3 className="font-medium text-gray-800 mb-2">Productos</h3>
        <ul className="space-y-2">
          {items.map(item => (
            <li key={item.id} className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                {getProductIcon(item)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <p className="font-medium">
                    {item.quantity > 1 && <span className="text-amber-600 font-bold mr-1">{item.quantity}x</span>}
                    {item.name}
                  </p>
                  <p className="font-medium text-gray-700">{formatCurrency(item.price * item.quantity)}</p>
                </div>
                {item.specialInstructions && (
                  <p className="text-xs text-gray-500 mt-1 italic">"{item.specialInstructions}"</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Total */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex justify-between items-center">
          <p className="font-bold text-gray-800">Total</p>
          <p className="font-bold text-xl text-amber-600">{formatCurrency(total)}</p>
        </div>
      </div>
      
      {/* Método de pago */}
      {paymentMethod && (
        <div className="p-4 border-b">
          <h3 className="font-medium text-gray-800 mb-2">Método de Pago</h3>
          <div className="flex items-center">
            {getPaymentMethodIcon(paymentMethod)}
            <span>{getPaymentMethodText(paymentMethod)}</span>
          </div>
        </div>
      )}
      
      {/* Datos de contacto */}
      <div className="p-4 border-b">
        <h3 className="font-medium text-gray-800 mb-2">Datos de Contacto</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <User className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-sm">{contactData.name}</span>
          </div>
          <div className="flex items-center">
            <Phone className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-sm">{contactData.phone}</span>
          </div>
          <div className="flex items-center">
            <Mail className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-sm">{contactData.email}</span>
          </div>
        </div>
      </div>
      
      {/* Mensaje de atención al cliente */}
      <div className="p-4 bg-blue-50 text-blue-700">
        <div className="flex items-start">
          <HelpCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-xs">
            Si necesitas asistencia con tu pedido, contáctanos mencionando tu ID de pedido: 
            <span className="font-medium ml-1">{orderId}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary; 