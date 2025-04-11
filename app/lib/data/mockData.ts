import { MenuItem, MenuCategory } from '../types';

// Categorías del menú
export const menuCategories: MenuCategory[] = [
  {
    id: 'tacos',
    name: 'Tacos',
    description: 'Nuestra especialidad: tacos auténticos mexicanos con tortillas hechas a mano',
    imageUrl: '/images/categories/tacos.jpg'
  },
  {
    id: 'bebidas',
    name: 'Bebidas',
    description: 'Refrescantes bebidas para acompañar tu comida',
    imageUrl: '/images/categories/bebidas.jpg'
  },
  {
    id: 'extras',
    name: 'Extras',
    description: 'Complementos para mejorar tu experiencia',
    imageUrl: '/images/categories/extras.jpg'
  },
  {
    id: 'postres',
    name: 'Postres',
    description: 'Deliciosos postres tradicionales',
    imageUrl: '/images/categories/postres.jpg'
  }
];

// Elementos del menú
export const menuItems: MenuItem[] = [
  // Tacos
  {
    id: 'taco-pastor',
    name: 'Taco al Pastor',
    description: 'Carne marinada de cerdo al pastor con piña, cebolla y cilantro',
    price: 25,
    categoryId: 'tacos',
    imageUrl: '/images/menu/taco-pastor.jpg',
    popular: true,
    available: true,
    allergens: ['cerdo'],
    nutritionalInfo: {
      calories: 210,
      protein: 12,
      carbs: 18,
      fat: 9
    }
  },
  {
    id: 'taco-bistec',
    name: 'Taco de Bistec',
    description: 'Carne de res marinada con cebolla y cilantro',
    price: 28,
    categoryId: 'tacos',
    imageUrl: '/images/menu/taco-bistec.jpg',
    popular: true,
    available: true,
    allergens: ['res'],
    nutritionalInfo: {
      calories: 230,
      protein: 15,
      carbs: 18,
      fat: 10
    }
  },
  {
    id: 'taco-chorizo',
    name: 'Taco de Chorizo',
    description: 'Chorizo casero con cebolla y cilantro',
    price: 25,
    categoryId: 'tacos',
    imageUrl: '/images/menu/taco-chorizo.jpg',
    available: true,
    allergens: ['cerdo'],
    nutritionalInfo: {
      calories: 250,
      protein: 13,
      carbs: 18,
      fat: 14
    }
  },
  {
    id: 'taco-carnitas',
    name: 'Taco de Carnitas',
    description: 'Carnitas de cerdo cocinadas lentamente, servidas con cebolla y cilantro',
    price: 27,
    categoryId: 'tacos',
    imageUrl: '/images/menu/taco-carnitas.jpg',
    popular: true,
    available: true,
    allergens: ['cerdo'],
    nutritionalInfo: {
      calories: 240,
      protein: 14,
      carbs: 18,
      fat: 12
    }
  },
  {
    id: 'taco-barbacoa',
    name: 'Taco de Barbacoa',
    description: 'Barbacoa de res cocinada lentamente, servida con cebolla y cilantro',
    price: 30,
    categoryId: 'tacos',
    imageUrl: '/images/menu/taco-barbacoa.jpg',
    available: true,
    allergens: ['res'],
    nutritionalInfo: {
      calories: 235,
      protein: 16,
      carbs: 18,
      fat: 10
    }
  },
  {
    id: 'taco-pescado',
    name: 'Taco de Pescado',
    description: 'Pescado fresco empanizado, col morada, pico de gallo y salsa especial',
    price: 32,
    categoryId: 'tacos',
    imageUrl: '/images/menu/taco-pescado.jpg',
    available: true,
    allergens: ['pescado', 'gluten'],
    nutritionalInfo: {
      calories: 220,
      protein: 13,
      carbs: 22,
      fat: 8
    }
  },
  {
    id: 'taco-camaron',
    name: 'Taco de Camarón',
    description: 'Camarones salteados con ajo, servidos con col y salsa especial',
    price: 35,
    categoryId: 'tacos',
    imageUrl: '/images/menu/taco-camaron.jpg',
    available: true,
    allergens: ['mariscos'],
    nutritionalInfo: {
      calories: 215,
      protein: 14,
      carbs: 20,
      fat: 7
    }
  },
  {
    id: 'taco-vegetariano',
    name: 'Taco Vegetariano',
    description: 'Hongos, nopales, frijoles y aguacate',
    price: 24,
    categoryId: 'tacos',
    imageUrl: '/images/menu/taco-vegetariano.jpg',
    available: true,
    nutritionalInfo: {
      calories: 180,
      protein: 6,
      carbs: 24,
      fat: 7
    }
  },
  
  // Bebidas
  {
    id: 'agua-horchata',
    name: 'Agua de Horchata',
    description: 'Bebida tradicional de arroz con canela y vainilla',
    price: 20,
    categoryId: 'bebidas',
    imageUrl: '/images/menu/agua-horchata.jpg',
    available: true,
    nutritionalInfo: {
      calories: 120,
      protein: 1,
      carbs: 28,
      fat: 1
    }
  },
  {
    id: 'agua-jamaica',
    name: 'Agua de Jamaica',
    description: 'Bebida refrescante de flor de Jamaica',
    price: 20,
    categoryId: 'bebidas',
    imageUrl: '/images/menu/agua-jamaica.jpg',
    available: true,
    nutritionalInfo: {
      calories: 60,
      protein: 0,
      carbs: 15,
      fat: 0
    }
  },
  {
    id: 'refresco',
    name: 'Refresco',
    description: 'Refresco de tu elección (Coca-Cola, Sprite, Fanta)',
    price: 18,
    categoryId: 'bebidas',
    imageUrl: '/images/menu/refresco.jpg',
    available: true,
    nutritionalInfo: {
      calories: 140,
      protein: 0,
      carbs: 39,
      fat: 0
    }
  },
  {
    id: 'cerveza',
    name: 'Cerveza',
    description: 'Cerveza mexicana (Corona, Modelo, Pacífico)',
    price: 35,
    categoryId: 'bebidas',
    imageUrl: '/images/menu/cerveza.jpg',
    available: true,
    allergens: ['gluten'],
    nutritionalInfo: {
      calories: 150,
      protein: 1,
      carbs: 13,
      fat: 0
    }
  },
  
  // Extras
  {
    id: 'guacamole',
    name: 'Guacamole',
    description: 'Guacamole fresco con totopos',
    price: 40,
    categoryId: 'extras',
    imageUrl: '/images/menu/guacamole.jpg',
    popular: true,
    available: true,
    nutritionalInfo: {
      calories: 230,
      protein: 3,
      carbs: 12,
      fat: 19
    }
  },
  {
    id: 'queso-fundido',
    name: 'Queso Fundido',
    description: 'Queso fundido con chorizo y tortillas',
    price: 55,
    categoryId: 'extras',
    imageUrl: '/images/menu/queso-fundido.jpg',
    available: true,
    allergens: ['lácteos', 'cerdo'],
    nutritionalInfo: {
      calories: 380,
      protein: 18,
      carbs: 12,
      fat: 29
    }
  },
  {
    id: 'elote',
    name: 'Elote',
    description: 'Elote con mayonesa, queso cotija, chile en polvo y limón',
    price: 30,
    categoryId: 'extras',
    imageUrl: '/images/menu/elote.jpg',
    available: true,
    allergens: ['lácteos'],
    nutritionalInfo: {
      calories: 210,
      protein: 6,
      carbs: 32,
      fat: 8
    }
  },
  {
    id: 'nachos',
    name: 'Nachos',
    description: 'Nachos con queso, frijoles, jalapeños, guacamole y crema',
    price: 60,
    categoryId: 'extras',
    imageUrl: '/images/menu/nachos.jpg',
    popular: true,
    available: true,
    allergens: ['lácteos'],
    nutritionalInfo: {
      calories: 580,
      protein: 15,
      carbs: 58,
      fat: 32
    }
  },
  
  // Postres
  {
    id: 'flan',
    name: 'Flan Casero',
    description: 'Flan tradicional con caramelo',
    price: 35,
    categoryId: 'postres',
    imageUrl: '/images/menu/flan.jpg',
    available: true,
    allergens: ['lácteos', 'huevo'],
    nutritionalInfo: {
      calories: 220,
      protein: 8,
      carbs: 26,
      fat: 10
    }
  },
  {
    id: 'churros',
    name: 'Churros',
    description: 'Churros recién hechos con chocolate caliente',
    price: 40,
    categoryId: 'postres',
    imageUrl: '/images/menu/churros.jpg',
    popular: true,
    available: true,
    allergens: ['gluten', 'lácteos'],
    nutritionalInfo: {
      calories: 320,
      protein: 4,
      carbs: 48,
      fat: 14
    }
  },
  {
    id: 'tres-leches',
    name: 'Pastel Tres Leches',
    description: 'Pastel húmedo bañado en tres tipos de leche con canela',
    price: 45,
    categoryId: 'postres',
    imageUrl: '/images/menu/tres-leches.jpg',
    available: true,
    allergens: ['lácteos', 'huevo', 'gluten'],
    nutritionalInfo: {
      calories: 340,
      protein: 6,
      carbs: 52,
      fat: 12
    }
  }
];

// Función auxiliar para obtener ítem por ID
export const getMenuItemById = (id: string): MenuItem | undefined => {
  return menuItems.find(item => item.id === id);
};

// Función auxiliar para obtener ítem por nombre
export const getMenuItemByName = (name: string): MenuItem | undefined => {
  return menuItems.find(item => 
    item.name.toLowerCase() === name.toLowerCase() ||
    name.toLowerCase().includes(item.name.toLowerCase()) ||
    item.name.toLowerCase().includes(name.toLowerCase())
  );
};

// Función auxiliar para obtener ítems por categoría
export const getMenuItemsByCategory = (categoryId: string): MenuItem[] => {
  return menuItems.filter(item => item.categoryId === categoryId);
};

// Función auxiliar para obtener categoría por ID
export const getCategoryById = (id: string): MenuCategory | undefined => {
  return menuCategories.find(category => category.id === id);
};

// Función auxiliar para obtener ítems populares
export const getPopularItems = (): MenuItem[] => {
  return menuItems.filter(item => item.popular);
};

// Pedidos de ejemplo
export const sampleOrders = [
  {
    id: 'order-001',
    items: [
      { id: 'taco-pastor', name: 'Taco al Pastor', quantity: 3, price: 25 },
      { id: 'taco-bistec', name: 'Taco de Bistec', quantity: 2, price: 28 },
      { id: 'agua-horchata', name: 'Agua de Horchata', quantity: 1, price: 20 }
    ],
    subtotal: 151,
    tax: 15.1,
    total: 166.1,
    status: 'confirmed',
    createdAt: '2023-06-15T14:22:00Z',
    paymentStatus: 'completed'
  },
  {
    id: 'order-002',
    items: [
      { id: 'taco-carnitas', name: 'Taco de Carnitas', quantity: 4, price: 27 },
      { id: 'guacamole', name: 'Guacamole', quantity: 1, price: 40 },
      { id: 'cerveza', name: 'Cerveza', quantity: 2, price: 35 }
    ],
    subtotal: 198,
    tax: 19.8,
    total: 217.8,
    status: 'preparing',
    createdAt: '2023-06-15T15:30:00Z',
    paymentStatus: 'completed'
  }
]; 