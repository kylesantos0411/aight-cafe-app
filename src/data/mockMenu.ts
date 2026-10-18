import type { MenuItem, Order } from '../types/cafe';

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: '1',
    name: 'Iced latte',
    category: 'Coffee',
    price: 140,
    description: 'Double espresso, your choice of milk, over ice. A smooth everyday favorite.',
    image: '/figma-assets/iced-latte.jpg',
    isAvailable: true,
    tags: ['Customer Favorite', 'Signature'],
    options: {
      sizes: [
        { name: 'Regular', price: 0 },
        { name: 'Large', price: 20 },
      ],
      milks: [
        { name: 'Dairy', price: 0 },
        { name: 'Oat milk', price: 20 },
        { name: 'Soy milk', price: 20 },
      ],
      sweetness: ['0%', '25%', '50%', '100%'],
      temperatures: ['Iced', 'Hot'],
      extraShotPrice: 30,
    },
  },
  {
    id: '2',
    name: 'Iced americano',
    category: 'Coffee',
    price: 110,
    description: 'Bold, bright & refreshing double shot over chilled spring water and ice.',
    image: '/figma-assets/iced-americano.jpg',
    isAvailable: true,
    tags: ['Classic'],
    options: {
      sizes: [
        { name: 'Regular', price: 0 },
        { name: 'Large', price: 20 },
      ],
      sweetness: ['0%', '50%', '100%'],
      temperatures: ['Iced', 'Hot'],
      extraShotPrice: 30,
    },
  },
  {
    id: '3',
    name: 'Matcha latte',
    category: 'Tea & Matcha',
    price: 160,
    description: 'Matcha · Earthy & mellow ceremonial grade whisked fresh with velvety milk.',
    image: '/figma-assets/matcha-latte.jpg',
    isAvailable: true,
    tags: ['Ceremonial Grade'],
    options: {
      sizes: [
        { name: 'Regular', price: 0 },
        { name: 'Large', price: 20 },
      ],
      milks: [
        { name: 'Dairy', price: 0 },
        { name: 'Oat milk', price: 20 },
      ],
      sweetness: ['25%', '50%', '100%'],
      temperatures: ['Iced', 'Hot'],
    },
  },
  {
    id: '4',
    name: 'Iced chocolate',
    category: 'Cold Brew', // Categorized in Non-Coffee / Cold Brew
    price: 130,
    description: 'Non-Coffee · Rich dark cocoa swirled with fresh chilled milk and ice.',
    image: '/figma-assets/iced-chocolate.jpg',
    isAvailable: true,
    tags: ['House Cocoa'],
    options: {
      sizes: [
        { name: 'Regular', price: 0 },
        { name: 'Large', price: 20 },
      ],
      milks: [
        { name: 'Dairy', price: 0 },
        { name: 'Oat milk', price: 20 },
      ],
      sweetness: ['0%', '50%', '100%'],
    },
  },
  {
    id: '5',
    name: 'Brown butter cookie',
    category: 'Pastries',
    price: 85,
    description: 'Chocolate chunks, flaky salt, molten center baked fresh daily.',
    image: '/figma-assets/brown-butter-cookie.jpg',
    isAvailable: true,
    tags: ['Baked Today', 'Fresh'],
  },
  {
    id: '6',
    name: 'Butter croissant',
    category: 'Pastries',
    price: 120,
    description: 'Flaky, golden, baked today with laminated French butter layers.',
    image: '/figma-assets/butter-croissant.jpg',
    isAvailable: true,
    tags: ['Flaky', 'Fresh'],
  },
];

// Production orders initialize empty - all real orders come from Cashier POS & 20 Queue Cards
export const INITIAL_ORDERS: Order[] = [];
