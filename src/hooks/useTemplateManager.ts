import { useCallback } from 'react';
import { Flow, FlowUIConfig, UITemplate } from '../types/flow';
import { toast } from 'sonner@2.0.3';
import { getTemplateRegistry, getLayoutVariant, type TemplateId } from '../config/ui-templates';

/**
 * Hook for managing template application and variant selection
 * Separates template business logic from UI components
 */
export function useTemplateManager() {
  const templates = getTemplateRegistry();

  /**
   * Apply a template to a flow
   * Merges template configuration with layout variant styling
   */
  const applyTemplate = useCallback((
    template: UITemplate,
    currentFlow: Flow,
    flowId: string,
    onUpdate: (flow: Flow, config: FlowUIConfig) => void
  ) => {
    if (!currentFlow || !flowId) return null;

    const presetId = template.layoutPreset;
    const variant = getLayoutVariant(template.id as TemplateId, presetId);

    // Build variant-specific styles
    const variantStyles = variant ? {
      accentColor: variant.accentColor,
      primaryColor: variant.primaryColor,
      headerStyle: variant.headerStyle,
      ...(variant.sidebarStyle && {
        sidebarBackground: variant.sidebarStyle.background,
        sidebarBorder: variant.sidebarStyle.borderColor,
        sidebarText: variant.sidebarStyle.textColor
      }),
      ...(variant.mainContentStyle && {
        mainBackground: variant.mainContentStyle.background,
        mainPadding: variant.mainContentStyle.padding,
        mainBorderRadius: variant.mainContentStyle.borderRadius
      })
    } : {};

    // Create updated flow with template + variant
    const updatedFlow: Flow = {
      ...currentFlow,
      uiConfig: {
        ...template.flowConfig,
        ...variantStyles,
        layout: {
          preset: presetId,
          customLayout: false,
          fullscreen: false,
          modalBehaviour: 'responsive' as const,
          areas: []
        }
      },
      steps: currentFlow.steps.map(step => ({
        ...step,
        uiConfig: {
          ...step.uiConfig,
          ...template.stepConfig
        }
      }))
    };

    // Trigger update callback
    onUpdate(updatedFlow, updatedFlow.uiConfig || {});

    // Show success notification
    toast.success('Template Applied', {
      description: `"${template.name}" template with ${presetId.replace(/-/g, ' ')} layout has been applied successfully.`
    });

    return updatedFlow;
  }, []);

  /**
   * Get available layout variants for a template
   */
  const getTemplateVariants = useCallback((templateId: TemplateId) => {
    const template = templates.find(t => t.id === templateId);
    return template?.layoutVariants || [];
  }, [templates]);

  /**
   * Get template by ID
   */
  const getTemplate = useCallback((templateId: TemplateId) => {
    return templates.find(t => t.id === templateId);
  }, [templates]);

  /**
   * Get templates by category
   */
  const getTemplatesByCategory = useCallback((category: string) => {
    return templates.filter(t => t.category === category);
  }, [templates]);

  /**
   * Get all available categories
   */
  const getCategories = useCallback(() => {
    const categories = new Set(templates.map(t => t.category));
    return Array.from(categories);
  }, [templates]);

  return {
    templates,
    applyTemplate,
    getTemplateVariants,
    getTemplate,
    getTemplatesByCategory,
    getCategories
  };
}
