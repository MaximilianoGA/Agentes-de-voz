import { MenuCategory, MenuItem } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Definición de categorías
export const categories: MenuCategory[] = [
  {
    id: '1',
    name: 'Tacos',
    description: 'Auténticos tacos mexicanos preparados al momento',
    imageUrl: '/images/categories/tacos.jpg'
  },
  {
    id: '2',
    name: 'Quesadillas',
    description: 'Deliciosas quesadillas con queso fundido y diversos ingredientes',
    imageUrl: '/images/categories/quesadillas.jpg'
  },
  {
    id: '3',
    name: 'Bebidas',
    description: 'Refrescantes bebidas para acompañar tu comida',
    imageUrl: '/images/categories/bebidas.jpg'
  },
  {
    id: '4',
    name: 'Postres',
    description: 'Deliciosos postres tradicionales mexicanos',
    imageUrl: '/images/categories/postres.jpg'
  },
  {
    id: '5',
    name: 'Especialidades',
    description: 'Platillos especiales de la casa',
    imageUrl: '/images/categories/especialidades.jpg'
  }
];

// Definición de productos
export const menuItems: MenuItem[] = [
  // Tacos
  {
    id: 't1',
    name: 'Taco al Pastor',
    description: 'Taco de carne de cerdo marinada en adobo, servido con piña, cebolla y cilantro',
    price: 25,
    categoryId: '1',
    imageUrl: '/images/menu/taco-pastor.jpg',
    available: true,
    allergens: ['gluten'],
    featured: true
  },
  {
    id: 't2',
    name: 'Taco de Bistec',
    description: 'Taco de carne de res asada con cebolla y cilantro',
    price: 28,
    categoryId: '1',
    imageUrl: '/images/menu/taco-bistec.jpg',
    available: true
  },
  {
    id: 't3',
    name: 'Taco de Suadero',
    description: 'Taco de carne de res (falda) cocida lentamente hasta quedar tierna',
    price: 26,
    categoryId: '1',
    imageUrl: '/images/menu/taco-suadero.jpg',
    available: true
  },
  {
    id: 't4',
    name: 'Taco de Carnitas',
    description: 'Taco de carne de cerdo confitada en su propia grasa',
    price: 25,
    categoryId: '1',
    imageUrl: '/images/menu/taco-carnitas.jpg',
    available: true
  },
  {
    id: 't5',
    name: 'Taco de Barbacoa',
    description: 'Taco de carne de res cocida lentamente en hojas de maguey',
    price: 30,
    categoryId: '1',
    imageUrl: '/images/menu/taco-barbacoa.jpg',
    available: true,
    featured: true
  },
  
  // Quesadillas
  {
    id: 'q1',
    name: 'Quesadilla de Queso',
    description: 'Quesadilla de maíz con queso fundido',
    price: 30,
    categoryId: '2',
    imageUrl: '/images/menu/quesadilla-queso.jpg',
    available: true,
    allergens: ['lactosa', 'gluten']
  },
  {
    id: 'q2',
    name: 'Quesadilla de Chorizo',
    description: 'Quesadilla con queso fundido y chorizo',
    price: 38,
    categoryId: '2',
    imageUrl: '/images/menu/quesadilla-chorizo.jpg',
    available: true,
    allergens: ['lactosa', 'gluten']
  },
  {
    id: 'q3',
    name: 'Quesadilla de Flor de Calabaza',
    description: 'Quesadilla con queso y flor de calabaza',
    price: 35,
    categoryId: '2',
    imageUrl: '/images/menu/quesadilla-flor.jpg',
    available: true,
    allergens: ['lactosa', 'gluten'],
    featured: true
  },
  
  // Bebidas
  {
    id: 'b1',
    name: 'Agua de Horchata',
    description: 'Agua fresca de arroz con canela y vainilla',
    price: 25,
    categoryId: '3',
    imageUrl: '/images/menu/agua-horchata.jpg',
    available: true
  },
  {
    id: 'b2',
    name: 'Agua de Jamaica',
    description: 'Agua fresca de flor de jamaica',
    price: 25,
    categoryId: '3',
    imageUrl: '/images/menu/agua-jamaica.jpg',
    available: true
  },
  {
    id: 'b3',
    name: 'Refresco',
    description: 'Refresco embotellado',
    price: 20,
    categoryId: '3',
    imageUrl: '/images/menu/refresco.jpg',
    available: true
  },
  {
    id: 'b4',
    name: 'Cerveza',
    description: 'Cerveza nacional',
    price: 35,
    categoryId: '3',
    imageUrl: '/images/menu/cerveza.jpg',
    available: true
  },
  
  // Postres
  {
    id: 'p1',
    name: 'Arroz con Leche',
    description: 'Arroz cocido en leche con canela y pasas',
    price: 30,
    categoryId: '4',
    imageUrl: '/images/menu/arroz-leche.jpg',
    available: true,
    allergens: ['lactosa']
  },
  {
    id: 'p2',
    name: 'Flan',
    description: 'Flan casero con caramelo',
    price: 35,
    categoryId: '4',
    imageUrl: '/images/menu/flan.jpg',
    available: true,
    allergens: ['lactosa', 'huevo'],
    featured: true
  },
  
  // Especialidades
  {
    id: 'e1',
    name: 'Sopes (3 piezas)',
    description: 'Base de masa gruesa con frijoles, carne, lechuga, crema y queso',
    price: 45,
    categoryId: '5',
    imageUrl: '/images/menu/sopes.jpg',
    available: true,
    allergens: ['lactosa', 'gluten']
  },
  {
    id: 'e2',
    name: 'Chilaquiles',
    description: 'Totopos bañados en salsa verde o roja, con pollo, crema y queso',
    price: 60,
    categoryId: '5',
    imageUrl: '/images/menu/chilaquiles.jpg',
    available: true,
    allergens: ['lactosa', 'gluten'],
    featured: true
  },
  {
    id: 'e3',
    name: 'Molcajete Mixto',
    description: 'Molcajete con carne de res, pollo, chorizo, nopales y queso fundido',
    price: 150,
    categoryId: '5',
    imageUrl: '/images/menu/molcajete.jpg',
    available: true,
    allergens: ['lactosa'],
    featured: true
  }
];

// Función para obtener todos los productos
export function getAllMenuItems(): MenuItem[] {
  return menuItems;
}

// Función para obtener un producto por ID
export function getMenuItemById(id: string): MenuItem | undefined {
  return menuItems.find(item => item.id === id);
}

// Función para obtener todos los productos de una categoría
export function getMenuItemsByCategory(categoryId: string): MenuItem[] {
  return menuItems.filter(item => item.categoryId === categoryId && item.available);
}

// Función para obtener productos destacados
export function getFeaturedMenuItems(): MenuItem[] {
  return menuItems.filter(item => item.featured && item.available);
}

// Función para obtener todas las categorías
export function getAllCategories(): MenuCategory[] {
  return categories;
}

// Función para obtener una categoría por ID
export function getCategoryById(id: string): MenuCategory | undefined {
  return categories.find(category => category.id === id);
} 