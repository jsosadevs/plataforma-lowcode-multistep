import React from 'react';
import { UITemplate } from '../../types/flow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Sparkles, Layout, Info } from 'lucide-react';

interface TemplatesTabProps {
  templates: UITemplate[];
  onTemplateSelect: (template: UITemplate) => void;
}

export const TemplatesTab: React.FC<TemplatesTabProps> = ({
  templates,
  onTemplateSelect
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2">Choose a Template</h3>
        <p className="text-sm text-muted-foreground">
          Start with a pre-designed template for styling and behavior. Templates work alongside your layout configuration.
        </p>
        
        {/* Info Banner */}
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="mb-1">Adaptive Templates with Layout Variants</p>
              <p>
                Each template includes multiple layout variants with optimized styling. When you switch layouts, 
                colors, spacing, and visual elements automatically adapt to maintain design consistency.
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <Sparkles className="w-3 h-3" />
                <span>Smart Theming:</span>
                <span>Templates + Layouts work together seamlessly</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <Card
            key={template.id}
            className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/50"
            onClick={() => onTemplateSelect(template)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <Badge variant="outline" className="text-xs capitalize">
                    {template.category}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <CardDescription className="text-sm mb-3">
                {template.description}
              </CardDescription>

              {/* Layout Preview Badge */}
              <div className="mb-3 p-2 bg-primary/5 rounded-md border border-primary/10">
                <div className="flex items-center gap-2 text-xs mb-1">
                  <Layout className="w-4 h-4 text-primary" />
                  <span className="text-foreground">Default Layout:</span>
                  <span className="text-muted-foreground capitalize">
                    {template.layoutPreset.replace(/-/g, ' ')}
                  </span>
                </div>
                {template.layoutVariants && template.layoutVariants.length > 1 && (
                  <div className="flex items-center gap-1 mt-2 pl-6">
                    <span className="text-xs text-muted-foreground">
                      +{template.layoutVariants.length - 1} layout variant
                      {template.layoutVariants.length > 2 ? 's' : ''}
                    </span>
                    <Badge variant="secondary" className="text-xs h-4 px-1">
                      Adaptive
                    </Badge>
                  </div>
                )}
              </div>

              {/* Template Specs */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {template.stepConfig.viewMode}
                </Badge>
                <Badge variant="outline" className="text-xs capitalize">
                  {template.flowConfig.theme}
                </Badge>
                <Badge variant="outline" className="text-xs capitalize">
                  {template.flowConfig.animation}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
