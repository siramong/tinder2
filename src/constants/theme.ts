// Paleta de colores inspirada en Tinder pero con branding diferente
export const colors = {
  // Colores principales - Tonos morados/rosados en lugar del naranja/rosa de Tinder
  primary: '#8B5CF6', // Morado vibrante
  primaryDark: '#7C3AED',
  primaryLight: '#A78BFA',
  
  // Colores de acción
  like: '#10B981', // Verde para like
  dislike: '#EF4444', // Rojo para dislike
  superLike: '#3B82F6', // Azul para super like
  
  // Colores de fondo
  background: '#FFFFFF',
  backgroundDark: '#1F2937',
  card: '#F9FAFB',
  cardDark: '#374151',
  
  // Colores de texto
  text: '#111827',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  textDark: '#FFFFFF',
  
  // Colores de estado
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // Colores neutrales
  border: '#E5E7EB',
  disabled: '#D1D5DB',
  shadow: '#00000029',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const shadows = {
  small: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 4,
  },
  large: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 8,
  },
};
