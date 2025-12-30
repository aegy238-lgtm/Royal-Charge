
import { Category } from './types';

// Fix: Removed 'gradient' property from objects to match the Category interface which does not define it.
// Fix: Converted numeric IDs to strings to match Category and Banner interface definitions.
export const CATEGORIES: Category[] = [
  { id: '1', title: 'قسم الأرصدة', image: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=200&h=150&fit=crop' },
  { id: '2', title: 'قسم التطبيقات', image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=150&fit=crop' },
  { id: '3', title: 'قسم الألعاب', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&h=150&fit=crop' },
  { id: '4', title: 'المتاجر الرقمية', image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200&h=150&fit=crop' },
  { id: '5', title: 'المشاهدة TV', image: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=200&h=150&fit=crop' },
  { id: '6', title: 'الدفع الإلكتروني', image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=200&h=150&fit=crop' },
  { id: '7', title: 'تصاميم جرافيك', image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=200&h=150&fit=crop' },
  { id: '8', title: 'حوالات مالية', image: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=200&h=150&fit=crop' },
  { id: '9', title: 'قسم الأرقام', image: 'https://images.unsplash.com/photo-1523966211575-eb4a01e7dd51?w=200&h=150&fit=crop' },
];

export const BANNERS = [
  { id: '1', url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=600&fit=crop', title: 'JENTEL-CASH خياركم الأفضل' },
];
