'use client';

import React, { useState, useEffect, useRef } from 'react';
import { OrderItem, MenuItem } from '@/app/lib/types';
import { Utensils, Coffee, Pizza, ShoppingBag, Search, PlusCircle, MinusCircle, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import { playSound } from '@/app/lib/services/soundService';

// Importación dinámica del MenuCard para evitar problemas de hidratación
const MenuCard = dynamic(() => import('./menu/MenuCard'), { ssr: false });

// Datos de productos para el menú (se moverán a un servicio o API en producción)
const menuItems: MenuItem[] = [
  {
    id: 'taco-pastor',
    name: 'Taco al Pastor',
    description: 'Delicioso taco de cerdo marinado con piña',
    price: 15.00,
    imageUrl: '🌮',
    categoryId: 'tacos',
    available: true,
    featured: true,
    allergens: ['Gluten']
  },
  {
    id: 'taco-suadero',
    name: 'Taco de Suadero',
    description: 'Taco tradicional con carne de res suave',
    price: 17.00,
    imageUrl: '🌮',
    categoryId: 'tacos',
    available: true,
    allergens: []
  },
  {
    id: 'taco-bistec',
    name: 'Taco de Bistec',
    description: 'Taco con carne de res a la plancha',
    price: 18.00,
    imageUrl: '🌮',
    categoryId: 'tacos',
    available: true,
    allergens: []
  },
  {
    id: 'taco-campechano',
    name: 'Taco Campechano',
    description: 'Mezcla de bistec y chorizo en taco',
    price: 20.00,
    imageUrl: '🌮',
    categoryId: 'tacos',
    available: true,
    allergens: []
  },
  {
    id: 'taco-carnitas',
    name: 'Taco de Carnitas',
    description: 'Taco con carne de cerdo cocinado lentamente',
    price: 20.00,
    imageUrl: '🌮',
    categoryId: 'tacos',
    available: true,
    allergens: []
  },
  {
    id: 'agua-horchata',
    name: 'Agua de Horchata',
    description: 'Bebida refrescante de arroz con canela',
    price: 25.00,
    imageUrl: '🥛',
    categoryId: 'bebidas',
    available: true,
    allergens: ['Lácteos'],
    nutritionalInfo: {
      calories: 180,
      protein: 2,
      carbs: 35,
      fat: 3
    }
  },
  {
    id: 'jugo-manzana',
    name: 'Jugo de Manzana',
    description: 'Refrescante jugo natural de manzana',
    price: 25.00,
    imageUrl: '🧃',
    categoryId: 'bebidas',
    available: true,
    allergens: [],
    nutritionalInfo: {
      calories: 120,
      protein: 0,
      carbs: 30,
      fat: 0
    }
  },
  {
    id: 'refresco',
    name: 'Refresco',
    description: 'Bebida gaseosa de varios sabores',
    price: 20.00,
    imageUrl: '🥤',
    categoryId: 'bebidas',
    available: true,
    allergens: []
  },
  {
    id: 'guacamole',
    name: 'Guacamole',
    description: 'Dip tradicional de aguacate con totopos',
    price: 35.00,
    imageUrl: '🥑',
    categoryId: 'extras',
    available: true,
    featured: true,
    allergens: []
  },
  {
    id: 'queso-extra',
    name: 'Queso Extra',
    description: 'Porción extra de queso fresco',
    price: 15.00,
    imageUrl: '🧀',
    categoryId: 'extras',
    available: true,
    allergens: ['Lácteos']
  },
  {
    id: 'cebollitas',
    name: 'Orden de Cebollitas',
    description: 'Cebollitas de cambray asadas con limón',
    price: 25.00,
    imageUrl: '🧅',
    categoryId: 'extras',
    available: true,
    allergens: []
  },
  {
    id: 'salsa-xplosion',
    name: 'Salsa Xplosion',
    description: 'Nuestra salsa especial ultra picante, ¡solo para valientes!',
    price: 10.00,
    imageUrl: '🌶️',
    categoryId: 'extras',
    available: true,
    allergens: [],
    featured: true
  }
];

interface MenuTaqueriaProps {
  activeCategory?: 'tacos' | 'bebidas' | 'extras';
  onCategoryChange: (category: string) => void;
  onAddToOrder: (item: any) => void;
}

const MenuTaqueria = ({ activeCategory: externalActiveCategory, onCategoryChange, onAddToOrder }: MenuTaqueriaProps) => {
  const [internalActiveCategory, setInternalActiveCategory] = useState<'tacos' | 'bebidas' | 'extras'>('tacos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [highlightedProductId, setHighlightedProductId] = useState<string | null>(null);
  const [animatingAddedProductId, setAnimatingAddedProductId] = useState<string | null>(null);
  const productContainerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  // Usar la categoría externa si se proporciona, o la interna si no
  const activeCategory = externalActiveCategory || internalActiveCategory;
  
  // Efectos de sonido
  const menuSoundRef = useRef<HTMLAudioElement | null>(null);
  const addToCartSoundRef = useRef<HTMLAudioElement | null>(null);
  const highlightSoundRef = useRef<HTMLAudioElement | null>(null);
  
  // Lista de categorías disponibles
  const categories = Array.from(new Set(menuItems.map(item => item.categoryId)));

  // Filtrar items por categoría y búsqueda
  const filteredItems = menuItems.filter(item => {
    if (activeCategory && item.categoryId !== activeCategory) return false;
    if (searchQuery.trim() === '') return true;
    
    const query = searchQuery.toLowerCase().trim();
    return (
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
  });
  
  // Actualizar la categoría interna cuando la externa cambia
  useEffect(() => {
    if (externalActiveCategory) {
      setInternalActiveCategory(externalActiveCategory);
    }
  }, [externalActiveCategory]);
  
  // Verificar la capacidad de desplazamiento
  useEffect(() => {
    const checkScrollability = () => {
      if (productContainerRef.current) {
        const container = productContainerRef.current.querySelector('.overflow-x-auto');
        if (container) {
          setCanScrollLeft(container.scrollLeft > 0);
          setCanScrollRight(
            container.scrollLeft < container.scrollWidth - container.clientWidth - 5
          );
        }
      }
    };

    const container = productContainerRef.current?.querySelector('.overflow-x-auto');
    if (container) {
      container.addEventListener('scroll', checkScrollability);
      // Verificación inicial
      checkScrollability();
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScrollability);
      }
    };
  }, [filteredItems, activeCategory]);

  // Función para desplazar a la izquierda
  const scrollLeft = () => {
    const container = productContainerRef.current?.querySelector('.overflow-x-auto');
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
      playNavigationSound();
    }
  };

  // Función para desplazar a la derecha
  const scrollRight = () => {
    const container = productContainerRef.current?.querySelector('.overflow-x-auto');
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
      playNavigationSound();
    }
  };
  
  // Reproducir sonido al cambiar categoría
  const playMenuSound = (category: string) => {
    playSound('menu-change', 0.6);
  };
  
  // Reproducir sonido al añadir al carrito
  const playAddToCartSound = () => {
    playSound('add-to-cart', 0.7);
  };
  
  // Reproducir sonido al resaltar producto
  const playHighlightSound = () => {
    playSound('highlight', 0.5);
  };
  
  // Reproducir sonido de navegación
  const playNavigationSound = () => {
    playSound('menu-change', 0.4);
  };
  
  // Mostrar un mensaje cuando no hay elementos para mostrar
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-64 text-center p-6 bg-amber-50 rounded-lg">
      <img src="/taco-sad.svg" alt="No resultados" className="w-16 h-16 opacity-40 mb-3" />
      <h3 className="text-lg font-semibold text-amber-800">No se encontraron resultados</h3>
      <p className="text-amber-600 mt-2">Intenta con otra búsqueda o categoría</p>
    </div>
  );
  
  // Animación al añadir un producto al carrito
  const handleItemAddToOrder = (item: any) => {
    // Animar el producto
    setAnimatingAddedProductId(item.id);
    setTimeout(() => {
      setAnimatingAddedProductId(null);
    }, 1000);
    
    // Reproducir sonido
    playAddToCartSound();
    
    // Usar la función onAddToOrder proporcionada por props
    onAddToOrder(item);
  };
  
  // Función para establecer la referencia del elemento
  const setItemRef = (id: string, element: HTMLDivElement | null) => {
    itemRefs.current[id] = element;
  };
  
  // Escuchar eventos de highlightProduct modificado para reproducir sonido
  useEffect(() => {
    // Escuchar el evento 'highlightProduct'
    const handleHighlightProduct = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { productId } = customEvent.detail;
      
      console.log(`[MenuTaqueria] Destacando producto: ${productId}`);
      
      if (productId) {
        // Encontrar el producto para determinar su categoría
        const product = menuItems.find(item => item.id === productId);
        if (product && product.categoryId) {
          // Cambiar a la categoría del producto
          onCategoryChange(product.categoryId);
          setInternalActiveCategory(product.categoryId as 'tacos' | 'bebidas' | 'extras');
        }
        
        // Destacar el producto
        setHighlightedProductId(productId);
        
        // Reproducir sonido de destacado
        playHighlightSound();
        
        // Hacer scroll al producto después de un pequeño retraso
        setTimeout(() => {
          const itemRef = itemRefs.current[productId];
          if (itemRef) {
            itemRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          
          // Mantener el destacado durante 3 segundos y luego quitarlo
          setTimeout(() => {
            setHighlightedProductId(null);
          }, 3000);
        }, 300);
      }
    };

    // Escuchar el evento 'activateCategory'
    const handleActivateCategory = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { category } = customEvent.detail;
      
      console.log(`[MenuTaqueria] Activando categoría: ${category}`);
      
      if (category && ['tacos', 'bebidas', 'extras'].includes(category)) {
        // Cambiar a la categoría solicitada
        onCategoryChange(category);
        setInternalActiveCategory(category as 'tacos' | 'bebidas' | 'extras');
        
        // Reproducir sonido de cambio de menú
        playMenuSound(category);
        
        // Asegurar que los controles de navegación estén actualizados
        setTimeout(() => {
          const checkScrollability = () => {
            if (productContainerRef.current) {
              const container = productContainerRef.current.querySelector('.overflow-x-auto');
              if (container) {
                setCanScrollLeft(container.scrollLeft > 0);
                setCanScrollRight(
                  container.scrollLeft < container.scrollWidth - container.clientWidth - 5
                );
              }
            }
          };
          checkScrollability();
        }, 500);
      }
    };

    window.addEventListener('highlightProduct', handleHighlightProduct);
    window.addEventListener('activateCategory', handleActivateCategory);
    
    return () => {
      window.removeEventListener('highlightProduct', handleHighlightProduct);
      window.removeEventListener('activateCategory', handleActivateCategory);
    };
  }, [onCategoryChange, playMenuSound, playHighlightSound]);

  return (
    <div className="flex flex-col h-full">
      {/* Header del menú */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-500 p-4 rounded-t-lg shadow-md">
        <div className="flex items-center text-white mb-4">
          <Utensils className="mr-2" size={20} />
          <h2 className="text-xl font-bold">Menú La Taquería</h2>
        </div>
        
        {/* Buscador */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar platillos..."
            className="w-full p-2 pl-10 rounded-lg border-2 border-amber-300 focus:border-amber-400 focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-amber-500" size={20} />
          {searchQuery && (
            <button 
              className="absolute right-3 top-2.5 text-amber-500 hover:text-amber-700"
              onClick={() => setSearchQuery('')}
            >
              ×
            </button>
          )}
        </div>
      </div>
      
      {/* Categorías */}
      <div className="bg-amber-100 p-2 flex space-x-2 overflow-x-auto shadow-inner">
        <button
          onClick={() => {
            setInternalActiveCategory('tacos');
            onCategoryChange('tacos');
            playMenuSound('tacos');
          }}
          className={`px-4 py-2 rounded-full transition-colors flex items-center shadow-sm ${
            activeCategory === 'tacos' 
              ? 'bg-amber-600 text-white' 
              : 'bg-white text-amber-800 hover:bg-amber-200'
          }`}
        >
          <Utensils className="mr-2" size={16} />
          Tacos
        </button>
        <button
          onClick={() => {
            setInternalActiveCategory('bebidas');
            onCategoryChange('bebidas');
            playMenuSound('bebidas');
          }}
          className={`px-4 py-2 rounded-full transition-colors flex items-center shadow-sm ${
            activeCategory === 'bebidas' 
              ? 'bg-amber-600 text-white' 
              : 'bg-white text-amber-800 hover:bg-amber-200'
          }`}
        >
          <Coffee className="mr-2" size={16} />
          Bebidas
        </button>
        <button
          onClick={() => {
            setInternalActiveCategory('extras');
            onCategoryChange('extras');
            playMenuSound('extras');
          }}
          className={`px-4 py-2 rounded-full transition-colors flex items-center shadow-sm ${
            activeCategory === 'extras' 
              ? 'bg-amber-600 text-white' 
              : 'bg-white text-amber-800 hover:bg-amber-200'
          }`}
        >
          <Pizza className="mr-2" size={16} />
          Extras
        </button>
      </div>
      
      {/* Contenedor principal con scroll horizontal mejorado */}
      <div className="flex-grow bg-amber-50 p-4 overflow-hidden relative" ref={productContainerRef}>
        {filteredItems.length > 0 ? (
          <>
            {/* Controles de navegación */}
            {canScrollLeft && (
              <button 
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-amber-500 text-white rounded-r-full p-2 shadow-md opacity-80 hover:opacity-100 transition-opacity"
                aria-label="Desplazar a la izquierda"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            
            {canScrollRight && (
              <button 
                onClick={scrollRight}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-amber-500 text-white rounded-l-full p-2 shadow-md opacity-80 hover:opacity-100 transition-opacity"
                aria-label="Desplazar a la derecha"
              >
                <ChevronRight size={24} />
              </button>
            )}
            
            <div className="h-full overflow-x-auto scroll-smooth">
              <div className="flex flex-nowrap space-x-4 py-2 min-w-max">
                {filteredItems.map((item, index) => (
                  <div 
                    key={item.id}
                    ref={(el) => setItemRef(item.id, el)}
                    className={`flex-shrink-0 w-64 bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 ${
                      highlightedProductId === item.id 
                        ? 'ring-4 ring-amber-400 scale-105 shadow-lg' 
                        : 'hover:shadow-md hover:translate-y-[-2px]'
                    } ${
                      animatingAddedProductId === item.id 
                        ? 'animate-pulse bg-green-50'
                        : ''
                    }`}
                    style={{ height: 'calc(100% - 20px)' }}
                  >
                    <div className="relative p-4 flex flex-col h-full">
                      {highlightedProductId === item.id && (
                        <div className="absolute top-2 right-2">
                          <Sparkles className="text-amber-500 animate-pulse" size={24} />
                        </div>
                      )}
                      
                      <MenuCard
                        item={item}
                        index={index}
                        onAddToCart={handleItemAddToOrder}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          renderEmptyState()
        )}
      </div>
    </div>
  );
};

export default MenuTaqueria; 