/**
 * Tipos fundamentales para la aplicación El Buen Sabor
 */

// Categoría del menú
export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

// Elemento del menú
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
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
}

// Elemento en el pedido
export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
}

// Pedido completo
export interface Order {
  id?: string;
  items: OrderItem[];
  subtotal: number;
  tax?: number;
  total: number;
  status?: OrderStatus;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
  paymentId?: string;
  paymentStatus?: PaymentStatus;
  deliveryAddress?: DeliveryAddress;
  contactInfo?: ContactInfo;
}

// Estado del pedido
export enum OrderStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

// Estado del pago
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

// Información de entrega
export interface DeliveryAddress {
  street: string;
  number: string;
  apartment?: string;
  neighborhood?: string;
  city: string;
  state: string;
  zipCode: string;
  additionalInfo?: string;
}

// Información de contacto
export interface ContactInfo {
  name: string;
  phone: string;
  email: string;
}

// Usuario
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  savedAddresses?: DeliveryAddress[];
  orderHistory?: string[]; // IDs de pedidos
  createdAt?: string;
}

// Error de la aplicación
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// Respuesta API genérica
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: AppError;
}

// Configuración de la pasarela de pago
export interface PaymentGatewayConfig {
  publicKey: string;
  currency: string;
  locale: string;
}

// Resultado del pago
export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  amount?: number;
  error?: string;
}

// Estado de la aplicación
export interface AppState {
  currentOrder: Order | null;
  user: User | null;
  isAuthenticated: boolean;
  cart: {
    items: OrderItem[];
    subtotal: number;
    total: number;
  };
  error: AppError | null;
  loading: boolean;
}

// Acción para el contexto global
export type AppAction = 
  | { type: 'ADD_TO_CART'; payload: OrderItem }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ERROR'; payload: AppError | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'COMPLETE_ORDER'; payload: Order }
  | { type: 'LOGOUT' };

// API Types
export interface JoinUrlResponse {
  callId: string;
  created: Date;
  ended: Date | null;
  model: string;
  systemPrompt: string;
  temperature: number;
  joinUrl: string;
}

// Enums
export enum RoleEnum {
  USER = "USER",
  ASSISTANT = "ASSISTANT",
  TOOL_CALL = "TOOL_CALL",
  TOOL_RESULT = "TOOL_RESULT"
}

export enum ParameterLocation {
  UNSPECIFIED = "PARAMETER_LOCATION_UNSPECIFIED",
  QUERY = "PARAMETER_LOCATION_QUERY",
  PATH = "PARAMETER_LOCATION_PATH",
  HEADER = "PARAMETER_LOCATION_HEADER",
  BODY = "PARAMETER_LOCATION_BODY"
}

export enum KnownParamEnum {
  UNSPECIFIED = "KNOWN_PARAM_UNSPECIFIED",
  CALL_ID = "KNOWN_PARAM_CALL_ID",
  CONVERSATION_HISTORY = "KNOWN_PARAM_CONVERSATION_HISTORY"
}

// Messaging
export interface Message {
  ordinal?: number;
  role: RoleEnum;
  text: string;
  invocationId?: string;
  toolName?: string;
}

// Tool Types
export interface SelectedTool {
  toolId?: string;
  toolName?: string;
  temporaryTool?: BaseToolDefinition;
  nameOverride?: string;
  authTokens?: { [key: string]: string };
  parameterOverrides?: { [key: string]: any };
}

export interface BaseToolDefinition {
  modelToolName?: string;
  description: string;
  dynamicParameters?: DynamicParameter[];
  staticParameters?: StaticParameter[];
  automaticParameters?: AutomaticParameter[];
  requirements?: ToolRequirements;
  http?: BaseHttpToolDetails;
  client?: {};
}

interface DynamicParameter {
  name: string;
  location: ParameterLocation;
  schema: object;
  required?: boolean;
}

interface StaticParameter {
  name: string;
  location: ParameterLocation;
  value: any;
}

interface AutomaticParameter {
  name: string;
  location: ParameterLocation;
  knownValue: KnownParamEnum;
}

interface BaseHttpToolDetails {
  baseUrlPattern: string;
  httpMethod: string;
}

interface ToolRequirements {
  httpSecurityOptions: SecurityOptions;
  requiredParameterOverrides: string[];
}

interface SecurityOptions {
  options: SecurityRequirements[];
}

interface SecurityRequirements {
  requirements: { [key: string]: SecurityRequirement };
}

interface SecurityRequirement {
  queryApiKey?: QueryApiKeyRequirement;
  headerApiKey?: HeaderApiKeyRequirement;
  httpAuth?: HttpAuthRequirement;
}

interface QueryApiKeyRequirement {
  name: string;
}

interface HeaderApiKeyRequirement {
  name: string;
}

interface HttpAuthRequirement {
  scheme: string;
}

// Call Configuration
export interface CallConfig {
  systemPrompt: string;
  model?: string;
  languageHint?: string;
  selectedTools?: SelectedTool[];
  initialMessages?: Message[];
  voice?: string;
  temperature?: number;
  maxDuration?: string;
  timeExceededMessage?: string;
  callKey?: string;
}

export interface DemoConfig {
  title: string;
  overview: string;
  callConfig: CallConfig;
}

// Customer Types
export interface CustomerInfo {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

// Payment Types
export interface PaymentInfo {
  id: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  transactionId?: string;
  createdAt: Date;
}

export type PaymentMethod = 'card' | 'cash' | 'transfer'; 