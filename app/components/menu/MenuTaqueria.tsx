'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { OrderItem, MenuItem } from '@/app/lib/types';
import { menuItems } from '@/app/lib/data/menu-items';
import { useOrder } from '@/app/lib/hooks/useOrder';
import { PlusCircle, MinusCircle, ShoppingCart } from 'lucide-react';
import MenuCard from './MenuCard';

// Usar string para la categoría activa
type ActiveCategory = 'tacos' | 'bebidas' | 'extras';

interface MenuTaqueriaProps {
  activeCategory?: ActiveCategory; // Usar el tipo string
  onCategoryChange?: (category: ActiveCategory) => void; // Usar el tipo string
}

/**
 * Componente que muestra el menú de la taquería y permite añadir productos al pedido
 */
export function MenuTaqueria({ 
  activeCategory: externalActiveCategory, 
  onCategoryChange 
}: MenuTaqueriaProps) {
  const [internalActiveCategory, setInternalActiveCategory] = useState<ActiveCategory>('tacos'); // Usar el tipo string
  const activeCategory = externalActiveCategory || internalActiveCategory;
  
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [specialInstructions, setSpecialInstructions] = useState<Record<string, string>>({});
  const [highlightedProductId, setHighlightedProductId] = useState<string | null>(null);
  const productRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { addItem } = useOrder();
  
  useEffect(() => {
    if (externalActiveCategory) {
      setInternalActiveCategory(externalActiveCategory);
    }
  }, [externalActiveCategory]);
  
  const handleProductHighlight = useCallback((event: CustomEvent) => {
    // Asumir que categoryId viene como string del evento (ajustar si es necesario)
    const { productId, categoryId } = event.detail as { productId: string, categoryId?: ActiveCategory }; 
    console.log(`[MenuTaqueria] Evento highlightProduct recibido: ${productId}, Categoría: ${categoryId}`);

    const productElement = productRefs.current[productId];
    
    // Limpiar timeout anterior si existe
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }
    
    // Establecer el producto resaltado
    setHighlightedProductId(productId);

    // Cambiar categoría si es necesario (comparación de strings)
    if (categoryId && categoryId !== activeCategory) {
        setInternalActiveCategory(categoryId);
        if (onCategoryChange) {
            onCategoryChange(categoryId);
        }
    }
    
    // Scroll al producto DESPUÉS de que la categoría pueda haber cambiado y re-renderizado
    // Usar un pequeño timeout para asegurar que el elemento esté disponible
    setTimeout(() => {
      const elementToScroll = productRefs.current[productId];
      if (elementToScroll) {
        console.log(`[MenuTaqueria] Haciendo scroll a: ${productId}`);
        elementToScroll.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        console.warn(`[MenuTaqueria] No se encontró ref para el producto ${productId} para hacer scroll.`);
      }
    }, 100); // Pequeño delay para el renderizado
    
    // Programar la eliminación del resaltado
    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedProductId(null);
      console.log(`[MenuTaqueria] Resaltado eliminado para: ${productId}`);
    }, 3000); // Duración del resaltado

  }, [activeCategory, onCategoryChange]);
  
  useEffect(() => {
    window.addEventListener('highlightProduct', handleProductHighlight as EventListener);
    return () => {
      window.removeEventListener('highlightProduct', handleProductHighlight as EventListener);
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, [handleProductHighlight]);
  
  // Usar string para la categoría
  const handleCategoryChange = (category: ActiveCategory) => {
    setInternalActiveCategory(category);
    if (onCategoryChange) {
      onCategoryChange(category);
    }
    // Opcional: resetear resaltado al cambiar de categoría manualmente
    setHighlightedProductId(null);
    if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
    }
    // Smooth scroll to the top of the products section
    document.getElementById('menu-products')?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  // Filtrar artículos por categoría activa
  const filteredItems = menuItems.filter(item => 
    item.categoryId === activeCategory && item.available !== false
  );
  
  // Manejar cambio de cantidad
  const handleQuantityChange = (id: string, value: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(1, Math.min(10, value))
    }));
  };
  
  // Manejar cambio en instrucciones especiales
  const handleInstructionsChange = (id: string, value: string) => {
    setSpecialInstructions(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  // Agregar producto al pedido
  const handleAddToOrder = useCallback((item: MenuItem) => {
    const quantity = quantities[item.id] || 1;
    
    // Construir el objeto OrderItem completo
    const orderItemToAdd: OrderItem = {
      id: item.id, // Usar el id del MenuItem como id del OrderItem
      menuItemId: item.id, // Guardar la referencia al ID original del menú
      name: item.name,
      price: item.price,
      quantity: quantity,
      specialInstructions: specialInstructions[item.id] || undefined // Usar undefined si está vacío
    };
    
    // Pasar el objeto OrderItem a addItem
    addItem(orderItemToAdd);
    
    // Resetear controles locales
    setQuantities(prev => ({ ...prev, [item.id]: 1 }));
    setSpecialInstructions(prev => ({ ...prev, [item.id]: '' }));
    if (typeof window !== 'undefined' && (window as any).playSound) {
      (window as any).playSound('add-to-cart', 0.6);
    }
  }, [quantities, specialInstructions, addItem]);

  // Formatear precio como moneda
  const formatCurrency = useCallback((amount: number) => {
    const hasDecimals = amount % 1 !== 0;
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: hasDecimals ? 2 : 0,
    }).format(amount);
  }, []);

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-amber-50 to-white">
      {/* Encabezado */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-500 text-white p-5 sticky top-0 shadow-lg z-10 rounded-b-lg">
        <h2 className="text-3xl font-bold mb-2 flex items-center">
          <span className="mr-2">🌮</span>Nuestro Menú
        </h2>
        
        {/* Botones de categorías */}
        <div className="flex space-x-3 mt-4 overflow-x-auto pb-1">
          <button
            onClick={() => handleCategoryChange('tacos')}
            className={`px-5 py-2 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-md flex items-center font-medium
              ${activeCategory === 'tacos' ? 'bg-white text-amber-700 shadow-md' : 'bg-amber-700/80 text-white hover:bg-amber-800/90 backdrop-blur-sm'}`}
          >
            <span className="text-xl mr-2">🌮</span> Tacos
          </button>
          <button
            onClick={() => handleCategoryChange('bebidas')}
            className={`px-5 py-2 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-md flex items-center font-medium
              ${activeCategory === 'bebidas' ? 'bg-white text-amber-700 shadow-md' : 'bg-amber-700/80 text-white hover:bg-amber-800/90 backdrop-blur-sm'}`}
          >
            <span className="text-xl mr-2">🥤</span> Bebidas
          </button>
          <button
            onClick={() => handleCategoryChange('extras')}
            className={`px-5 py-2 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-md flex items-center font-medium
              ${activeCategory === 'extras' ? 'bg-white text-amber-700 shadow-md' : 'bg-amber-700/80 text-white hover:bg-amber-800/90 backdrop-blur-sm'}`}
          >
            <span className="text-xl mr-2">🍽️</span> Extras
          </button>
        </div>
      </div>
      
      {/* Lista de productos */}
      <div id="menu-products" className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item, index) => (
            <MenuCard 
              key={item.id} 
              item={item} 
              index={index} 
              onAddToCart={() => handleAddToOrder(item)}
              isHighlighted={item.id === highlightedProductId}
              ref={el => {
                if (el) productRefs.current[item.id] = el;
                else delete productRefs.current[item.id];
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Estilos para animación de resaltado y otras animaciones */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes highlightAnimation {
          0%, 100% { box-shadow: 0 0 0 2px rgba(245, 158, 11, 0); transform: scale(1); }
          25% { box-shadow: 0 0 15px 6px rgba(245, 158, 11, 0.4); transform: scale(1.03); background-color: rgba(254, 243, 199, 0.8); }
          50% { box-shadow: 0 0 10px 4px rgba(245, 158, 11, 0.3); transform: scale(1.02); background-color: rgba(254, 243, 199, 0.5); }
          75% { box-shadow: 0 0 15px 6px rgba(245, 158, 11, 0.4); transform: scale(1.03); background-color: rgba(254, 243, 199, 0.8); }
          100% { box-shadow: 0 0 0 2px rgba(245, 158, 11, 0); transform: scale(1); }
        }
        
        .highlight-product {
          animation: highlightAnimation 2.5s ease;
          border-color: #f59e0b;
          border-width: 2px;
          z-index: 1;
        }
      `}</style>
    </div>
  );
}

export default MenuTaqueria; 