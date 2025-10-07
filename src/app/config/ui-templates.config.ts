import { UITemplate, LayoutVariant } from '../models/flow.model';

/**
 * Template IDs for type safety
 */
export type TemplateId = 
  | 'modern-card'
  | 'minimal-list'
  | 'creative-grid'
  | 'wizard-flow'
  | 'compact-mobile'
  | 'dashboard-style';

/**
 * Layout Variant Configurations
 * Centralized styling for different layout presets
 */
export const LAYOUT_VARIANTS: Record<string, LayoutVariant> = {
  // Modern Blue Theme Variants
  'modern-sidebar-left': {
    layoutId: 'sidebar-left',
    accentColor: '#3b82f6',
    primaryColor: '#1e40af',
    headerStyle: 'detailed',
    progressPosition: 'sidebar',
    sidebarStyle: {
      background: '#f8fafc',
      borderColor: '#e2e8f0',
      textColor: '#1e293b'
    },
    mainContentStyle: {
      background: '#ffffff',
      padding: 'lg',
      borderRadius: 'lg'
    }
  },
  'modern-sidebar-right': {
    layoutId: 'sidebar-right',
    accentColor: '#3b82f6',
    primaryColor: '#1e40af',
    headerStyle: 'compact',
    progressPosition: 'sidebar',
    sidebarStyle: {
      background: '#eff6ff',
      borderColor: '#bfdbfe',
      textColor: '#1e40af'
    },
    mainContentStyle: {
      background: '#ffffff',
      padding: 'lg',
      borderRadius: 'md'
    }
  },
  'modern-three-panel': {
    layoutId: 'three-panel',
    accentColor: '#3b82f6',
    primaryColor: '#1e40af',
    headerStyle: 'detailed',
    progressPosition: 'header',
    mainContentStyle: {
      background: '#f8fafc',
      padding: 'md',
      borderRadius: 'md'
    }
  },
  'modern-full-width': {
    layoutId: 'full-width',
    accentColor: '#3b82f6',
    primaryColor: '#1e40af',
    headerStyle: 'minimal',
    progressPosition: 'header',
    mainContentStyle: {
      background: '#ffffff',
      padding: 'xl',
      borderRadius: 'lg'
    }
  },
  'modern-wizard': {
    layoutId: 'wizard-mode',
    accentColor: '#3b82f6',
    primaryColor: '#1e40af',
    headerStyle: 'detailed',
    progressPosition: 'header',
    mainContentStyle: {
      background: '#ffffff',
      padding: 'lg',
      borderRadius: 'md'
    }
  },
  'modern-vertical-split': {
    layoutId: 'vertical-split',
    accentColor: '#3b82f6',
    primaryColor: '#1e40af',
    headerStyle: 'compact',
    progressPosition: 'inline',
    mainContentStyle: {
      background: '#f8fafc',
      padding: 'md',
      borderRadius: 'md'
    }
  },

  // Minimal Gray Theme Variants
  'minimal-full-width': {
    layoutId: 'full-width',
    accentColor: '#64748b',
    primaryColor: '#475569',
    headerStyle: 'minimal',
    progressPosition: 'header',
    mainContentStyle: {
      background: '#ffffff',
      padding: 'lg',
      borderRadius: 'sm'
    }
  },
  'minimal-wizard': {
    layoutId: 'wizard-mode',
    accentColor: '#64748b',
    primaryColor: '#475569',
    headerStyle: 'minimal',
    progressPosition: 'header',
    mainContentStyle: {
      background: '#f8fafc',
      padding: 'md',
      borderRadius: 'sm'
    }
  },
  'minimal-vertical-split': {
    layoutId: 'vertical-split',
    accentColor: '#64748b',
    primaryColor: '#475569',
    headerStyle: 'minimal',
    progressPosition: 'inline',
    mainContentStyle: {
      background: '#ffffff',
      padding: 'md',
      borderRadius: 'sm'
    }
  },

  // Creative Cyan Theme Variants
  'creative-sidebar-right': {
    layoutId: 'sidebar-right',
    accentColor: '#06b6d4',
    primaryColor: '#0891b2',
    headerStyle: 'compact',
    progressPosition: 'sidebar',
    sidebarStyle: {
      background: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)',
      borderColor: '#67e8f9',
      textColor: '#164e63'
    },
    mainContentStyle: {
      background: '#ffffff',
      padding: 'lg',
      borderRadius: 'xl'
    }
  },
  'creative-three-panel': {
    layoutId: 'three-panel',
    accentColor: '#06b6d4',
    primaryColor: '#0891b2',
    headerStyle: 'detailed',
    progressPosition: 'header',
    mainContentStyle: {
      background: '#f0fdfa',
      padding: 'md',
      borderRadius: 'lg'
    }
  },
  'creative-sidebar-left': {
    layoutId: 'sidebar-left',
    accentColor: '#06b6d4',
    primaryColor: '#0891b2',
    headerStyle: 'compact',
    progressPosition: 'sidebar',
    sidebarStyle: {
      background: '#ecfeff',
      borderColor: '#a5f3fc',
      textColor: '#155e75'
    },
    mainContentStyle: {
      background: '#ffffff',
      padding: 'lg',
      borderRadius: 'lg'
    }
  },

  // Wizard Green Theme Variants
  'wizard-wizard-mode': {
    layoutId: 'wizard-mode',
    accentColor: '#10b981',
    primaryColor: '#059669',
    headerStyle: 'detailed',
    progressPosition: 'header',
    mainContentStyle: {
      background: '#ffffff',
      padding: 'xl',
      borderRadius: 'lg'
    }
  },
  'wizard-full-width': {
    layoutId: 'full-width',
    accentColor: '#10b981',
    primaryColor: '#059669',
    headerStyle: 'detailed',
    progressPosition: 'header',
    mainContentStyle: {
      background: '#f0fdf4',
      padding: 'xl',
      borderRadius: 'md'
    }
  },
  'wizard-vertical-split': {
    layoutId: 'vertical-split',
    accentColor: '#10b981',
    primaryColor: '#059669',
    headerStyle: 'compact',
    progressPosition: 'inline',
    mainContentStyle: {
      background: '#ffffff',
      padding: 'lg',
      borderRadius: 'lg'
    }
  },

  // Mobile Compact Gray Variants
  'mobile-full-width': {
    layoutId: 'full-width',
    accentColor: '#71717a',
    primaryColor: '#52525b',
    headerStyle: 'compact',
    progressPosition: 'header',
    mainContentStyle: {
      background: '#ffffff',
      padding: 'sm',
      borderRadius: 'md'
    }
  },
  'mobile-wizard': {
    layoutId: 'wizard-mode',
    accentColor: '#71717a',
    primaryColor: '#52525b',
    headerStyle: 'compact',
    progressPosition: 'header',
    mainContentStyle: {
      background: '#fafafa',
      padding: 'md',
      borderRadius: 'sm'
    }
  },

  // Dashboard Indigo Theme Variants
  'dashboard-three-panel': {
    layoutId: 'three-panel',
    accentColor: '#6366f1',
    primaryColor: '#4f46e5',
    headerStyle: 'detailed',
    progressPosition: 'header',
    mainContentStyle: {
      background: '#f8fafc',
      padding: 'md',
      borderRadius: 'lg'
    }
  },
  'dashboard-sidebar-left': {
    layoutId: 'sidebar-left',
    accentColor: '#6366f1',
    primaryColor: '#4f46e5',
    headerStyle: 'detailed',
    progressPosition: 'sidebar',
    sidebarStyle: {
      background: '#eef2ff',
      borderColor: '#c7d2fe',
      textColor: '#3730a3'
    },
    mainContentStyle: {
      background: '#ffffff',
      padding: 'lg',
      borderRadius: 'lg'
    }
  },
  'dashboard-sidebar-right': {
    layoutId: 'sidebar-right',
    accentColor: '#6366f1',
    primaryColor: '#4f46e5',
    headerStyle: 'compact',
    progressPosition: 'sidebar',
    sidebarStyle: {
      background: '#f5f3ff',
      borderColor: '#ddd6fe',
      textColor: '#5b21b6'
    },
    mainContentStyle: {
      background: '#ffffff',
      padding: 'lg',
      borderRadius: 'md'
    }
  }
};

/**
 * Template Registry
 * Simplified template definitions that reference layout variants
 */
const TEMPLATE_REGISTRY: UITemplate[] = [
  {
    id: 'modern-card',
    name: 'Modern Cards',
    description: 'Clean card-based layout with smooth animations',
    category: 'business',
    layoutPreset: 'sidebar-left',
    flowConfig: {
      theme: 'primary',
      progressStyle: 'bar',
      headerStyle: 'detailed',
      animation: 'smooth'
    },
    stepConfig: {
      viewMode: 'cards',
      fieldLayout: 'two-column',
      spacing: 'md',
      showProgress: true,
      animation: 'fade'
    },
    layoutVariants: [
      LAYOUT_VARIANTS['modern-sidebar-left'],
      LAYOUT_VARIANTS['modern-sidebar-right'],
      LAYOUT_VARIANTS['modern-three-panel'],
      LAYOUT_VARIANTS['modern-full-width'],
      LAYOUT_VARIANTS['modern-wizard'],
      LAYOUT_VARIANTS['modern-vertical-split']
    ]
  },
  {
    id: 'minimal-list',
    name: 'Minimal List',
    description: 'Simple, focused list layout',
    category: 'simple',
    layoutPreset: 'full-width',
    flowConfig: {
      theme: 'default',
      progressStyle: 'dots',
      headerStyle: 'minimal',
      animation: 'fast'
    },
    stepConfig: {
      viewMode: 'minimal',
      fieldLayout: 'single',
      spacing: 'sm',
      showProgress: false,
      animation: 'none'
    },
    layoutVariants: [
      LAYOUT_VARIANTS['minimal-full-width'],
      LAYOUT_VARIANTS['minimal-wizard'],
      LAYOUT_VARIANTS['minimal-vertical-split']
    ]
  },
  {
    id: 'creative-grid',
    name: 'Creative Grid',
    description: 'Dynamic grid layout with vibrant colors',
    category: 'creative',
    layoutPreset: 'sidebar-right',
    flowConfig: {
      theme: 'info',
      progressStyle: 'steps',
      headerStyle: 'compact',
      animation: 'smooth'
    },
    stepConfig: {
      viewMode: 'grid',
      fieldLayout: 'auto',
      columns: 3,
      spacing: 'lg',
      showProgress: true,
      animation: 'scale'
    },
    layoutVariants: [
      LAYOUT_VARIANTS['creative-sidebar-right'],
      LAYOUT_VARIANTS['creative-three-panel'],
      LAYOUT_VARIANTS['creative-sidebar-left']
    ]
  },
  {
    id: 'wizard-flow',
    name: 'Wizard Flow',
    description: 'Step-by-step wizard interface',
    category: 'technical',
    layoutPreset: 'wizard-mode',
    flowConfig: {
      theme: 'success',
      progressStyle: 'steps',
      headerStyle: 'detailed',
      animation: 'smooth'
    },
    stepConfig: {
      viewMode: 'wizard',
      fieldLayout: 'single',
      spacing: 'lg',
      showProgress: true,
      showDescription: true,
      animation: 'slide'
    },
    layoutVariants: [
      LAYOUT_VARIANTS['wizard-wizard-mode'],
      LAYOUT_VARIANTS['wizard-full-width'],
      LAYOUT_VARIANTS['wizard-vertical-split']
    ]
  },
  {
    id: 'compact-mobile',
    name: 'Mobile Compact',
    description: 'Optimized for mobile devices',
    category: 'simple',
    layoutPreset: 'full-width',
    flowConfig: {
      theme: 'default',
      progressStyle: 'bar',
      headerStyle: 'compact',
      animation: 'fast'
    },
    stepConfig: {
      viewMode: 'compact',
      fieldLayout: 'single',
      spacing: 'sm',
      showProgress: true,
      showDescription: false,
      animation: 'fade'
    },
    layoutVariants: [
      LAYOUT_VARIANTS['mobile-full-width'],
      LAYOUT_VARIANTS['mobile-wizard']
    ]
  },
  {
    id: 'dashboard-style',
    name: 'Dashboard Style',
    description: 'Professional dashboard appearance',
    category: 'business',
    layoutPreset: 'three-panel',
    flowConfig: {
      theme: 'primary',
      progressStyle: 'steps',
      headerStyle: 'detailed',
      animation: 'smooth'
    },
    stepConfig: {
      viewMode: 'cards',
      fieldLayout: 'auto',
      columns: 3,
      spacing: 'md',
      showProgress: true,
      showDescription: true,
      animation: 'scale'
    },
    layoutVariants: [
      LAYOUT_VARIANTS['dashboard-three-panel'],
      LAYOUT_VARIANTS['dashboard-sidebar-left'],
      LAYOUT_VARIANTS['dashboard-sidebar-right']
    ]
  }
];

/**
 * Get all templates
 */
export function getTemplateRegistry(): UITemplate[] {
  return TEMPLATE_REGISTRY;
}

/**
 * Get a specific layout variant by template and layout ID
 */
export function getLayoutVariant(templateId: TemplateId, layoutId: string): LayoutVariant | undefined {
  const template = TEMPLATE_REGISTRY.find(t => t.id === templateId);
  return template?.layoutVariants?.find(v => v.layoutId === layoutId);
}

/**
 * Get all available layout presets
 */
export function getAvailableLayoutPresets(): string[] {
  return [
    'sidebar-left',
    'sidebar-right',
    'three-panel',
    'full-width',
    'wizard-mode',
    'vertical-split'
  ];
}
