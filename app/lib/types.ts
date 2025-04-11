// Tipos para categorías de menú
export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

// Tipos para ítems del menú
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl?: string;
  available: boolean;
  allergens?: string[];
  featured?: boolean;
}

// Estado del pedido
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';

// Ítem dentro de un pedido
export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}

// Pedido completo
export interface Order {
  id: string;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  totalAmount: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  paymentIntentId?: string;
  deliveryAddress?: string;
  deliveryNotes?: string;
}

// Estadísticas de pedidos
export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  topSellingItems: {
    itemId: string;
    name: string;
    quantity: number;
    revenue: number;
  }[];
  periodStart: string;
  periodEnd: string;
}

// Usuario de la aplicación
export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'customer' | 'admin' | 'staff';
  createdAt: string;
}

// Respuesta de pago
export interface PaymentResponse {
  success: boolean;
  error?: string;
  clientSecret?: string;
  orderId?: string;
}

// Configuración de la aplicación
export interface AppConfig {
  storeName: string;
  logoUrl: string;
  currency: string;
  taxRate: number;
  deliveryFee: number;
  minimumOrderAmount: number;
  contactEmail: string;
  contactPhone: string;
  address: string;
  openingHours: {
    day: string;
    hours: string;
  }[];
  socialMedia: {
    platform: string;
    url: string;
  }[];
}

// Tipos para la estructura del menú
export interface MenuCategory {
  id: string;
  name: string;
  description: string;
  products: MenuProduct[];
}

export interface MenuProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  variants?: ProductVariant[];
  options?: ProductOption[];
  allergens?: string[];
  tags?: string[];
  featured?: boolean;
}

// Tipos para variantes y opciones de productos
export interface ProductVariant {
  id: string;
  name: string;
  price: number;
}

export interface ProductOption {
  id: string;
  name: string;
  options: {
    id: string;
    name: string;
    price: number;
  }[];
}

// Tipos para la gestión de pedidos
export interface OrderDetails {
  id?: string;
  items: OrderItemDetails[];
  status?: OrderStatus;
  createdAt?: string;
  updatedAt?: string;
  totalAmount?: number;
}

export interface OrderItemDetails {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  variants?: ProductVariant[];
  options?: {
    name: string;
    option: string;
    price: number;
  }[];
  notes?: string;
}

// Tipos para pagos
export interface StripePaymentIntent {
  clientSecret: string;
}

// Tipos para las herramientas del agente
export interface NotificationOptions {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  autoClose?: boolean;
  duration?: number;
} 