'use client';

import React, { useState, useEffect, useRef } from 'react';
import { OrderItem } from '@/lib/types';
import Image from 'next/image';

// Definición de productos del menú
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'tacos' | 'bebidas' | 'extras';
}

// Datos de productos para el menú
const menuItems: MenuItem[] = [
  {
    id: 'taco-pastor',
    name: 'Taco al Pastor',
    description: 'Delicioso taco de cerdo marinado con piña',
    price: 15.00,
    image: '🌮',
    category: 'tacos'
  },
  {
    id: 'taco-suadero',
    name: 'Taco de Suadero',
    description: 'Taco tradicional con carne de res suave',
    price: 17.00,
    image: '🌮',
    category: 'tacos'
  },
  {
    id: 'taco-bistec',
    name: 'Taco de Bistec',
    description: 'Taco con carne de res a la plancha',
    price: 18.00,
    image: '🌮',
    category: 'tacos'
  },
  {
    id: 'taco-campechano',
    name: 'Taco Campechano',
    description: 'Mezcla de bistec y chorizo en taco',
    price: 20.00,
    image: '🌮',
    category: 'tacos'
  },
  {
    id: 'taco-carnitas',
    name: 'Taco de Carnitas',
    description: 'Taco con carne de cerdo cocinado lentamente',
    price: 20.00,
    image: '🌮',
    category: 'tacos'
  },
  {
    id: 'agua-horchata',
    name: 'Agua de Horchata',
    description: 'Bebida refrescante de arroz con canela',
    price: 25.00,
    image: '🥛',
    category: 'bebidas'
  },
  {
    id: 'jugo-manzana',
    name: 'Jugo de Manzana',
    description: 'Refrescante jugo natural de manzana',
    price: 25.00,
    image: '🧃',
    category: 'bebidas'
  },
  {
    id: 'refresco',
    name: 'Refresco',
    description: 'Bebida gaseosa de varios sabores',
    price: 20.00,
    image: '🥤',
    category: 'bebidas'
  },
  {
    id: 'guacamole',
    name: 'Guacamole',
    description: 'Dip tradicional de aguacate con totopos',
    price: 35.00,
    image: '🥑',
    category: 'extras'
  },
  {
    id: 'quesadilla',
    name: 'Quesadilla',
    description: 'Tortilla de maíz con queso derretido',
    price: 30.00,
    image: '🫔',
    category: 'extras'
  },
  {
    id: 'queso-extra',
    name: 'Queso Extra',
    description: 'Porción extra de queso fresco',
    price: 15.00,
    image: '🧀',
    category: 'extras'
  },
  {
    id: 'cebollitas',
    name: 'Orden de Cebollitas',
    description: 'Cebollitas de cambray asadas con limón',
    price: 25.00,
    image: '🧅',
    category: 'extras'
  }
];

interface MenuTaqueriaProps {
  onAddToOrder?: (item: OrderItem) => void;
  activeCategory?: 'tacos' | 'bebidas' | 'extras';
  onCategoryChange?: (category: 'tacos' | 'bebidas' | 'extras') => void;
}

export function MenuTaqueria({ 
  onAddToOrder, 
  activeCategory: externalActiveCategory, 
  onCategoryChange 
}: MenuTaqueriaProps) {
  const [internalActiveCategory, setInternalActiveCategory] = useState<'tacos' | 'bebidas' | 'extras'>('tacos');
  
  // Usar la categoría externa si se proporciona, o la interna si no
  const activeCategory = externalActiveCategory || internalActiveCategory;
  
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [specialInstructions, setSpecialInstructions] = useState<Record<string, string>>({});
  const productRefs = useRef<Record<string, HTMLDivElement>>({});
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [highlightedProduct, setHighlightedProduct] = useState<string | null>(null);
  
  // Actualizar la categoría interna cuando la externa cambia
  useEffect(() => {
    if (externalActiveCategory) {
      setInternalActiveCategory(externalActiveCategory);
    }
  }, [externalActiveCategory]);
  
  // Efecto para escuchar eventos de resaltado de productos
  useEffect(() => {
    const handleProductHighlight = (event: CustomEvent) => {
      const productId = event.detail.productId;
      const productElement = productRefs.current[productId];
      
      if (productElement) {
        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        // Remove highlight from all products
        Object.values(productRefs.current).forEach(ref => {
          ref.classList.remove('highlight-product');
        });
        
        // Add highlight to the selected product and scroll it into view
        productElement.classList.add('highlight-product');
        productElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Find the category of the highlighted product
        const product = menuItems.find(item => item.id === productId);
        if (product) {
          setInternalActiveCategory(product.category);
        }
        
        // Set a timeout to remove the highlight after a few seconds
        timeoutRef.current = setTimeout(() => {
          productElement.classList.remove('highlight-product');
        }, 2500);
      }
    };
    
    // Agregar el listener de eventos
    window.addEventListener('highlightProduct', handleProductHighlight as EventListener);
    console.log('MenuTaqueria: Listener de resaltado registrado');
    
    // Limpieza al desmontar
    return () => {
      window.removeEventListener('highlightProduct', handleProductHighlight as EventListener);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      console.log('MenuTaqueria: Listener de resaltado y timeouts eliminados');
    };
  }, []);
  
  // Función para cambiar entre categorías
  const handleCategoryChange = (category: 'tacos' | 'bebidas' | 'extras') => {
    setInternalActiveCategory(category);
    if (onCategoryChange) {
      onCategoryChange(category);
    }
    // Smooth scroll to the top of the products section
    document.getElementById('menu-products')?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  // Filtrar artículos por categoría activa
  const filteredItems = menuItems.filter(item => item.category === activeCategory);
  
  // Manejar cambio de cantidad
  const handleQuantityChange = (id: string, value: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(0, value)
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
  const handleAddToOrder = (item: MenuItem) => {
    const quantity = quantities[item.id] || 1;
    if (quantity <= 0) return;
    
    const orderItem: OrderItem = {
      name: item.name,
      price: item.price,
      quantity: quantity,
      specialInstructions: specialInstructions[item.id] || ''
    };
    
    if (onAddToOrder) {
      onAddToOrder(orderItem);
      
      // Resetear después de agregar
      setQuantities(prev => ({
        ...prev,
        [item.id]: 0
      }));
      setSpecialInstructions(prev => ({
        ...prev,
        [item.id]: ''
      }));
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
      {/* Encabezado del menú */}
      <div className="bg-gradient-to-r from-[#DD4B1A] to-[#FF6B00] p-4 text-white">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          🌮 Nuestro Menú
        </h2>
      </div>
      
      {/* Tabs de categorías */}
      <div className="flex border-b border-amber-200">
        <button 
          onClick={() => handleCategoryChange('tacos')}
          className={`flex-1 py-3 font-medium border-b-2 text-sm transition-colors ${
            activeCategory === 'tacos' 
              ? 'border-[#FF6B00] text-[#FF6B00] bg-amber-50' 
              : 'border-transparent text-gray-500 hover:text-[#FF6B00]'
          }`}
        >
          <span className="text-2xl mr-2">🌮</span>
          Tacos
        </button>
        <button 
          onClick={() => handleCategoryChange('bebidas')}
          className={`flex-1 py-3 font-medium border-b-2 text-sm transition-colors ${
            activeCategory === 'bebidas' 
              ? 'border-[#FF6B00] text-[#FF6B00] bg-amber-50' 
              : 'border-transparent text-gray-500 hover:text-[#FF6B00]'
          }`}
        >
          <span className="text-2xl mr-2">🥤</span>
          Bebidas
        </button>
        <button 
          onClick={() => handleCategoryChange('extras')}
          className={`flex-1 py-3 font-medium border-b-2 text-sm transition-colors ${
            activeCategory === 'extras' 
              ? 'border-[#FF6B00] text-[#FF6B00] bg-amber-50' 
              : 'border-transparent text-gray-500 hover:text-[#FF6B00]'
          }`}
        >
          <span className="text-2xl mr-2">🍴</span>
          Extras
        </button>
      </div>
      
      {/* Lista de productos */}
      <div className="flex-grow overflow-y-auto p-4 bg-amber-50" id="menu-products">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {menuItems
            .filter(item => item.category === activeCategory)
            .map(item => (
              <div
                key={item.id}
                ref={(el: HTMLDivElement | null) => {
                  if (el) productRefs.current[item.id] = el;
                }}
                className={`product-card bg-white p-4 rounded-lg border border-amber-100 shadow-sm hover:shadow transition-all relative overflow-hidden ${
                  highlightedProduct === item.id ? 'border-[#F44336] animate-pulse-highlight' : 'border-transparent'
                }`}
              >
                <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-orange-500 via-amber-300 to-red-400"></div>
                <div className="mb-2 text-2xl">{item.image}</div>
                <h3 className="font-bold text-amber-900">{item.name}</h3>
                <p className="text-sm text-amber-700 mb-2">{item.description}</p>
                <div className="font-bold text-orange-600 mb-3">${item.price.toFixed(2)}</div>
                
                <div className="mt-2">
                  <label className="block text-sm font-medium text-amber-800 mb-1">
                    Cantidad:
                  </label>
                  <div className="flex items-center mb-3">
                    <button 
                      onClick={() => handleQuantityChange(item.id, Math.max(0, (quantities[item.id] || 1) - 1))}
                      className="bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg w-8 h-8 flex items-center justify-center transition-colors"
                    >
                      <span>-</span>
                    </button>
                    <span className="px-3 text-lg font-medium text-amber-900">{quantities[item.id] || 1}</span>
                    <button 
                      onClick={() => handleQuantityChange(item.id, (quantities[item.id] || 1) + 1)}
                      className="bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg w-8 h-8 flex items-center justify-center transition-colors"
                    >
                      <span>+</span>
                    </button>
                  </div>
                  
                  <label className="block text-sm font-medium text-amber-800 mb-1">
                    Instrucciones especiales:
                  </label>
                  <input 
                    type="text" 
                    placeholder="Ej: Sin cebolla, salsa..." 
                    value={specialInstructions[item.id] || ''} 
                    onChange={(e) => handleInstructionsChange(item.id, e.target.value)} 
                    className="w-full p-2 border border-amber-200 rounded-md mb-3 text-sm focus:ring-amber-500 focus:border-amber-500"
                  />
                  
                  <button 
                    onClick={() => handleAddToOrder(item)}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-md transition-colors flex items-center justify-center gap-2"
                  >
                    Agregar al Pedido
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
      
      <style jsx>{`
        .highlight-product {
          box-shadow: 0 0 0 2px #F97316, 0 0 0 4px rgba(249, 115, 22, 0.3);
          transform: translateY(-2px);
          transition: all 0.3s ease;
        }
        
        .product-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .product-card:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}

export default MenuTaqueria; 