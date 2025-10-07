import { Injectable } from '@angular/core';
import { Flow, FlowUIConfig, UITemplate, LayoutVariant } from '../models/flow.model';
import { getTemplateRegistry, getLayoutVariant, TemplateId } from '../config/ui-templates.config';

/**
 * Servicio para gestionar la lógica de negocio de las plantillas de UI.
 * Reemplaza la funcionalidad del hook useTemplateManager del proyecto React.
 */
@Injectable({
  providedIn: 'root'
})
export class TemplateManagerService {

  private templates: UITemplate[] = getTemplateRegistry();

  constructor() { }

  /**
   * Obtiene todas las plantillas disponibles.
   * @returns Un array de todas las plantillas de UI.
   */
  getTemplates(): UITemplate[] {
    return this.templates;
  }

  /**
   * Aplica una plantilla a un flujo, fusionando la configuración y los estilos.
   * @param template La plantilla de UI a aplicar.
   * @param currentFlow El flujo actual al que se le aplicará la plantilla.
   * @returns El objeto Flow actualizado con la plantilla aplicada.
   */
  applyTemplate(template: UITemplate, currentFlow: Flow): Flow | null {
    if (!currentFlow) {
      return null;
    }

    const presetId = template.layoutPreset;
    const variant = getLayoutVariant(template.id as TemplateId, presetId);

    // Construye los estilos específicos de la variante
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

    // Crea el flujo actualizado con la plantilla y la variante fusionadas
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

    // Nota: La notificación (toast) se implementará en el componente que use este servicio.

    return updatedFlow;
  }

  /**
   * Obtiene las variantes de diseño disponibles para una plantilla específica.
   * @param templateId El ID de la plantilla.
   * @returns Un array de variantes de diseño.
   */
  getTemplateVariants(templateId: TemplateId): LayoutVariant[] {
    const template = this.templates.find(t => t.id === templateId);
    return template?.layoutVariants || [];
  }

  /**
   * Obtiene una plantilla por su ID.
   * @param templateId El ID de la plantilla.
   * @returns La plantilla encontrada o undefined.
   */
  getTemplate(templateId: TemplateId): UITemplate | undefined {
    return this.templates.find(t => t.id === templateId);
  }

  /**
   * Obtiene las plantillas que pertenecen a una categoría específica.
   * @param category La categoría por la que filtrar.
   * @returns Un array de plantillas filtradas.
   */
  getTemplatesByCategory(category: string): UITemplate[] {
    return this.templates.filter(t => t.category === category);
  }

  /**
   * Obtiene todas las categorías de plantillas únicas.
   * @returns Un array de strings con los nombres de las categorías.
   */
  getCategories(): string[] {
    const categories = new Set(this.templates.map(t => t.category));
    return Array.from(categories);
  }
}