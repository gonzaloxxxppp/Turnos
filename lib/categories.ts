import { CategoryItem, GirlieColor } from '@/types/appointments';

export const GIRLIE_COLORS: {
  id: GirlieColor;
  label: string;
  badgeClass: string;
  chipClass: string;
  dotClass: string;
  borderClass: string;
  previewColor: string;
}[] = [
  {
    id: 'rose',
    label: 'Rosa Oscuro / Frambuesa',
    badgeClass: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/70 dark:text-rose-200 dark:border-rose-800',
    chipClass: 'bg-rose-700 text-white',
    dotClass: 'bg-rose-600',
    borderClass: 'border-rose-600',
    previewColor: '#be185d',
  },
  {
    id: 'pink',
    label: 'Magenta Oscuro',
    badgeClass: 'bg-pink-100 text-pink-900 border-pink-300 dark:bg-pink-950/70 dark:text-pink-200 dark:border-pink-800',
    chipClass: 'bg-pink-700 text-white',
    dotClass: 'bg-pink-600',
    borderClass: 'border-pink-600',
    previewColor: '#9d174d',
  },
  {
    id: 'fuchsia',
    label: 'Borgoña / Vino Tinto',
    badgeClass: 'bg-rose-200/80 text-rose-950 border-rose-400 dark:bg-rose-950/90 dark:text-rose-100 dark:border-rose-700',
    chipClass: 'bg-rose-900 text-white',
    dotClass: 'bg-rose-800',
    borderClass: 'border-rose-800',
    previewColor: '#881337',
  },
  {
    id: 'purple',
    label: 'Ciruela Oscura',
    badgeClass: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/70 dark:text-purple-200 dark:border-purple-800',
    chipClass: 'bg-purple-700 text-white',
    dotClass: 'bg-purple-600',
    borderClass: 'border-purple-600',
    previewColor: '#6b21a8',
  },
  {
    id: 'violet',
    label: 'Malva Oscuro',
    badgeClass: 'bg-violet-100 text-violet-900 border-violet-300 dark:bg-violet-950/70 dark:text-violet-200 dark:border-violet-800',
    chipClass: 'bg-violet-700 text-white',
    dotClass: 'bg-violet-600',
    borderClass: 'border-violet-600',
    previewColor: '#581c87',
  },
  {
    id: 'peach',
    label: 'Terracota Cálido',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-800',
    chipClass: 'bg-amber-700 text-white',
    dotClass: 'bg-amber-600',
    borderClass: 'border-amber-600',
    previewColor: '#c2410c',
  },
  {
    id: 'mint',
    label: 'Verde Salvia',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-200 dark:border-emerald-800',
    chipClass: 'bg-emerald-700 text-white',
    dotClass: 'bg-emerald-600',
    borderClass: 'border-emerald-600',
    previewColor: '#065f46',
  },
  {
    id: 'amber',
    label: 'Ámbar Tostado',
    badgeClass: 'bg-orange-100 text-orange-900 border-orange-300 dark:bg-orange-950/70 dark:text-orange-200 dark:border-orange-800',
    chipClass: 'bg-orange-700 text-white',
    dotClass: 'bg-orange-600',
    borderClass: 'border-orange-600',
    previewColor: '#92400e',
  },
];

export const DEFAULT_GIRLIE_CATEGORIES: CategoryItem[] = [
  { id: 'cat-1', name: 'Uñas y Manicura', color: 'rose' },
  { id: 'cat-2', name: 'Maquillaje y Estética', color: 'pink' },
  { id: 'cat-3', name: 'Peluquería y Peinado', color: 'fuchsia' },
  { id: 'cat-4', name: 'Skincare y Spa', color: 'purple' },
  { id: 'cat-5', name: 'Lash and Brows', color: 'violet' },
  { id: 'cat-6', name: 'Consulta y Sesión', color: 'peach' },
  { id: 'cat-7', name: 'General', color: 'mint' },
];

export const DEFAULT_CATEGORIES = DEFAULT_GIRLIE_CATEGORIES;

const CATEGORIES_STORAGE_KEY = 'hakim_turnos_categories_v2';

export function getCategoryStyle(colorName?: string) {
  const found = GIRLIE_COLORS.find((c) => c.id === colorName);
  return found || GIRLIE_COLORS[0];
}

export function loadCategories(): CategoryItem[] {
  if (typeof window === 'undefined') {
    return DEFAULT_GIRLIE_CATEGORIES;
  }

  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(DEFAULT_GIRLIE_CATEGORIES));
      return DEFAULT_GIRLIE_CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_GIRLIE_CATEGORIES;
  } catch {
    return DEFAULT_GIRLIE_CATEGORIES;
  }
}

export function saveCategories(categories: CategoryItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  } catch (err) {
    console.error('Error al guardar categorías:', err);
  }
}

export function resetCategoriesToDefault(): CategoryItem[] {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(DEFAULT_GIRLIE_CATEGORIES));
  }
  return DEFAULT_GIRLIE_CATEGORIES;
}
