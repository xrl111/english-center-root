import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// Common screen sizes in pixels
export const screens = {
  xs: 0,    // Extra small devices
  sm: 600,  // Small devices
  md: 900,  // Medium devices
  lg: 1200, // Large devices
  xl: 1536, // Extra large devices
};

// Custom hook for responsive design
export const useResponsive = () => {
  const theme = useTheme();

  return {
    isXs: useMediaQuery(theme.breakpoints.only('xs')),
    isSm: useMediaQuery(theme.breakpoints.only('sm')),
    isMd: useMediaQuery(theme.breakpoints.only('md')),
    isLg: useMediaQuery(theme.breakpoints.only('lg')),
    isXl: useMediaQuery(theme.breakpoints.only('xl')),
    
    isSmDown: useMediaQuery(theme.breakpoints.down('sm')),
    isMdDown: useMediaQuery(theme.breakpoints.down('md')),
    isLgDown: useMediaQuery(theme.breakpoints.down('lg')),
    
    isSmUp: useMediaQuery(theme.breakpoints.up('sm')),
    isMdUp: useMediaQuery(theme.breakpoints.up('md')),
    isLgUp: useMediaQuery(theme.breakpoints.up('lg')),
    isXlUp: useMediaQuery(theme.breakpoints.up('xl')),
    
    isMobile: useMediaQuery(theme.breakpoints.down('sm')),
    isTablet: useMediaQuery(theme.breakpoints.between('sm', 'md')),
    isDesktop: useMediaQuery(theme.breakpoints.up('md')),
  };
};

// Helper function to get responsive value based on breakpoint
export const getResponsiveValue = (values, currentBreakpoint) => {
  const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl'];
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);

  // Find the nearest defined value for the current breakpoint
  for (let i = currentIndex; i >= 0; i--) {
    const value = values[breakpointOrder[i]];
    if (value !== undefined) return value;
  }

  return values.default;
};

// Helper function for responsive styles
export const responsive = (property, values) => {
  const theme = useTheme();
  const styles = {};

  Object.entries(values).forEach(([breakpoint, value]) => {
    if (breakpoint === 'default') {
      styles[property] = value;
    } else {
      styles[theme.breakpoints.up(breakpoint)] = {
        [property]: value,
      };
    }
  });

  return styles;
};

// Helper function for responsive spacing
export const responsiveSpacing = (values) => {
  const theme = useTheme();
  const spacingUnit = theme.spacing(1);

  return Object.entries(values).reduce((acc, [breakpoint, value]) => {
    const spacing = typeof value === 'number' ? value * spacingUnit : value;
    
    if (breakpoint === 'default') {
      return { ...acc, margin: spacing };
    }
    
    return {
      ...acc,
      [theme.breakpoints.up(breakpoint)]: {
        margin: spacing,
      },
    };
  }, {});
};

// Helper function for responsive grid columns
export const getGridColumns = (breakpoint) => {
  const columns = {
    xs: 1,  // 1 column on mobile
    sm: 2,  // 2 columns on tablet
    md: 3,  // 3 columns on small desktop
    lg: 4,  // 4 columns on large desktop
    xl: 4,  // 4 columns on extra large desktop
  };

  return columns[breakpoint] || columns.xs;
};

// Helper function for responsive font sizes
export const responsiveFontSizes = (values) => {
  const theme = useTheme();

  return Object.entries(values).reduce((acc, [breakpoint, size]) => {
    if (breakpoint === 'default') {
      return { ...acc, fontSize: size };
    }

    return {
      ...acc,
      [theme.breakpoints.up(breakpoint)]: {
        fontSize: size,
      },
    };
  }, {});
};

export default {
  screens,
  useResponsive,
  getResponsiveValue,
  responsive,
  responsiveSpacing,
  getGridColumns,
  responsiveFontSizes,
};