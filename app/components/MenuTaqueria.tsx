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
              ${activeCategory === 'tacos' 
                ? 'bg-white text-amber-700 shadow-md' 
                : 'bg-amber-700/80 text-white hover:bg-amber-800/90 backdrop-blur-sm'}`}
          >
            <span className="text-xl mr-2">🌮</span> Tacos
          </button>
          <button
            onClick={() => handleCategoryChange('bebidas')}
            className={`px-5 py-2 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-md flex items-center font-medium
              ${activeCategory === 'bebidas' 
                ? 'bg-white text-amber-700 shadow-md' 
                : 'bg-amber-700/80 text-white hover:bg-amber-800/90 backdrop-blur-sm'}`}
          >
            <span className="text-xl mr-2">🥤</span> Bebidas
          </button>
          <button
            onClick={() => handleCategoryChange('extras')}
            className={`px-5 py-2 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-md flex items-center font-medium
              ${activeCategory === 'extras' 
                ? 'bg-white text-amber-700 shadow-md' 
                : 'bg-amber-700/80 text-white hover:bg-amber-800/90 backdrop-blur-sm'}`}
          >
            <span className="text-xl mr-2">🍽️</span> Extras
          </button>
        </div>
      </div>
      
      {/* Lista de productos */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menuItems
            .filter(item => item.category === activeCategory)
            .map((item, index) => (
              <div 
                key={item.id} 
                id={`product-${item.id}`} 
                className="product-card border border-amber-100 rounded-xl overflow-hidden shadow-sm bg-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                style={{
                  animationDelay: `${index * 0.08}s`,
                  opacity: 0,
                  animation: 'fadeIn 0.5s ease forwards',
                  height: '380px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                ref={el => {
                  if (el) productRefs.current[item.id] = el;
                }}
              >
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <span className="text-3xl mr-3 transition-transform duration-300 hover:scale-110 hover:rotate-6">{item.image}</span>
                        <h3 className="text-lg font-bold text-amber-900">{item.name}</h3>
                      </div>
                      <p className="text-amber-700 text-sm mt-1 h-12 overflow-hidden">{item.description}</p>
                    </div>
                    <div className="text-xl font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      ${item.price.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center mb-3">
                      <label className="block text-amber-800 text-sm mr-2 font-medium">Cantidad:</label>
                      <div className="flex items-center shadow-sm rounded-lg overflow-hidden">
                        <button 
                          onClick={() => handleQuantityChange(item.id, Math.max(1, (quantities[item.id] || 1) - 1))}
                          className="bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium w-10 h-10 rounded-l flex items-center justify-center transition-colors duration-200"
                        >
                          -
                        </button>
                        <input 
                          type="number" 
                          min="1" 
                          max="10" 
                          value={quantities[item.id] || 1} 
                          readOnly
                          className="w-12 h-10 text-center border-t border-b border-amber-100 bg-white text-amber-900 font-medium"
                        />
                        <button 
                          onClick={() => handleQuantityChange(item.id, Math.min(10, (quantities[item.id] || 1) + 1))}
                          className="bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium w-10 h-10 rounded-r flex items-center justify-center transition-colors duration-200"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-amber-800 text-sm mb-1 font-medium">Instrucciones especiales:</label>
                      <input 
                        type="text" 
                        placeholder="Ej: Sin cebolla, extra salsa..." 
                        value={specialInstructions[item.id] || ''} 
                        onChange={(e) => handleInstructionsChange(item.id, e.target.value)}
                        className="w-full p-3 text-sm border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-amber-50/50 placeholder-amber-300"
                      />
                    </div>
                    
                    <button 
                      onClick={() => handleAddToOrder(item)}
                      className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white py-3 px-4 rounded-lg shadow transition-all duration-300 transform hover:shadow-md hover:scale-[1.02] font-medium flex items-center justify-center"
                    >
                      <span className="mr-2">🛒</span>
                      Agregar al Pedido
                    </button>
                  </div>
                </div>
              </div>
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
          0% { box-shadow: 0 0 0 2px rgba(245, 158, 11, 0); transform: scale(1); }
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