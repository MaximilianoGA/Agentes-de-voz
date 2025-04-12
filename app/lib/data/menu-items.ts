import { MenuItem } from '../types';

/**
 * Datos de productos para el menú de la taquería
 */
export const menuItems: MenuItem[] = [
  {
    id: 'taco-pastor',
    name: 'Taco al Pastor',
    description: 'Delicioso taco de cerdo marinado con piña',
    price: 15.00,
    imageUrl: '🌮',
    categoryId: 'tacos',
    available: true
  },
  {
    id: 'taco-suadero',
    name: 'Taco de Suadero',
    description: 'Taco tradicional con carne de res suave',
    price: 17.00,
    imageUrl: '🌮',
    categoryId: 'tacos',
    available: true
  },
  {
    id: 'taco-bistec',
    name: 'Taco de Bistec',
    description: 'Taco con carne de res a la plancha',
    price: 18.00,
    imageUrl: '🌮',
    categoryId: 'tacos',
    available: true
  },
  {
    id: 'taco-campechano',
    name: 'Taco Campechano',
    description: 'Mezcla de bistec y chorizo en taco',
    price: 20.00,
    imageUrl: '🌮',
    categoryId: 'tacos',
    available: true
  },
  {
    id: 'taco-carnitas',
    name: 'Taco de Carnitas',
    description: 'Taco con carne de cerdo cocinado lentamente',
    price: 20.00,
    imageUrl: '🌮',
    categoryId: 'tacos',
    available: true
  },
  {
    id: 'agua-horchata',
    name: 'Agua de Horchata',
    description: 'Bebida refrescante de arroz con canela',
    price: 25.00,
    imageUrl: '🥤',
    categoryId: 'bebidas',
    available: true
  },
  {
    id: 'jugo-manzana',
    name: 'Jugo de Manzana',
    description: 'Refrescante jugo natural de manzana',
    price: 25.00,
    imageUrl: '🧃',
    categoryId: 'bebidas',
    available: true
  },
  {
    id: 'refresco',
    name: 'Refresco',
    description: 'Bebida gaseosa de varios sabores',
    price: 20.00,
    imageUrl: '🥤',
    categoryId: 'bebidas',
    available: true
  },
  {
    id: 'guacamole',
    name: 'Guacamole',
    description: 'Dip tradicional de aguacate con totopos',
    price: 35.00,
    imageUrl: '🥑',
    categoryId: 'extras',
    available: true
  },
  {
    id: 'queso-extra',
    name: 'Queso Extra',
    description: 'Porción extra de queso fresco',
    price: 15.00,
    imageUrl: '🧀',
    categoryId: 'extras',
    available: true
  },
  {
    id: 'cebollitas',
    name: 'Orden de Cebollitas',
    description: 'Cebollitas de cambray asadas con limón',
    price: 25.00,
    imageUrl: '🧅',
    categoryId: 'extras',
    available: true
  }
]; 