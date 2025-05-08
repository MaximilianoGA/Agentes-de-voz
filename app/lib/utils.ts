/**
 * Utilidades comunes para la aplicación de Taquería
 */

/**
 * Formatea un valor numérico como moneda (MXN)
 * @param value - Valor a formatear
 * @returns Cadena formateada como moneda mexicana
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

/**
 * Genera un ID único para un pedido
 * @returns String con formato de ID de pedido
 */
export function generateOrderId(): string {
  const timestamp = new Date().getTime();
  const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp.toString().slice(-6)}-${randomPart}`;
}

/**
 * Valida un número de teléfono mexicano
 * @param phone - Número de teléfono a validar
 * @returns Booleano indicando si el formato es válido
 */
export function isValidMexicanPhone(phone: string): boolean {
  // Formato: 10 dígitos, puede incluir espacios, guiones o paréntesis
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 && /^[0-9]+$/.test(cleaned);
}

/**
 * Valida un correo electrónico
 * @param email - Correo electrónico a validar
 * @returns Booleano indicando si el formato es válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Trunca un texto largo y añade puntos suspensivos
 * @param text - Texto a truncar
 * @param maxLength - Longitud máxima (por defecto 50)
 * @returns Texto truncado con puntos suspensivos si excede la longitud
 */
export function truncateText(text: string, maxLength: number = 50): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Obtiene la fecha y hora actual formateada en español
 * @returns String con la fecha y hora actual formateada
 */
export function getCurrentDateTime(): string {
  return new Date().toLocaleString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formatea un número como moneda mexicana (MXN)
 * @param amount - El monto a formatear
 * @returns - El monto formateado como moneda
 */
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2
  }).format(amount);
}; 