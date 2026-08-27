import { BusinessCategory } from '../types';
import { SUPPORTED_LANGUAGES as I18N_LANGUAGES } from '../i18n/translations';

export const COLORS = {
  primary: '#1D4ED8', // blue-700
  primaryDark: '#0F172A', // slate-900 / navy
  primaryLight: '#EFF6FF', // blue-50
  secondary: '#059669', // emerald-600
  secondaryLight: '#ECFDF5', // emerald-50
  accent: '#D97706', // amber-600
  accentLight: '#FFFBEB', // amber-50
  danger: '#DC2626', // rose-600
  dangerLight: '#FEF2F2', // rose-50

  background: '#F8FAFC', // slate-50
  surface: '#FFFFFF',
  card: '#FFFFFF',
  border: '#E2E8F0', // slate-200
  borderDark: '#CBD5E1', // slate-300

  textPrimary: '#020617', // slate-950
  textSecondary: '#475569', // slate-600
  textMuted: '#94A3B8', // slate-400
  textInverted: '#FFFFFF'
};

export const SUPPORTED_LANGUAGES = I18N_LANGUAGES;

export const BUSINESS_CATEGORIES: { id: BusinessCategory; label: string; icon: string; subtitle: string; defaultIdea: string }[] = [
  {
    id: 'dairy',
    label: 'Dairy Farming',
    icon: '🥛',
    subtitle: 'Milch Cows & Bulk Chilling',
    defaultIdea: 'Commercial Micro Dairy Farming with 8-10 high-yield milch cows, hygienic shed and local chilling center connectivity.'
  },
  {
    id: 'tailoring',
    label: 'Tailoring Unit',
    icon: '🧵',
    subtitle: 'Apparel & Boutique Unit',
    defaultIdea: 'Custom Garment & Boutique Tailoring Workshop with 4 industrial sewing machines and bridal embroidery.'
  },
  {
    id: 'retail',
    label: 'Kirana Retail',
    icon: '🛍',
    subtitle: 'Provisions & FMCG Store',
    defaultIdea: 'Rural Kirana & Essential Provisions Retail Store with packaged goods, dairy distribution and digital UPI billing.'
  },
  {
    id: 'poultry',
    label: 'Poultry & Agro',
    icon: '🐣',
    subtitle: 'Broiler Rearing & Feed',
    defaultIdea: 'Commercial poultry broiler rearing unit with automated feeder & biocontrol shed.'
  }
];

export const CAPITAL_PRESETS = [50000, 100000, 150000, 200000, 500000];

export const STORAGE_KEYS = {
  LANGUAGE: 'udyora_language',
  AUTH: 'udyora_auth_session',
  PERMISSIONS: 'udyora_permissions'
};
