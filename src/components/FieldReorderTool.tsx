import React, { useState, useEffect } from 'react';
import { FormField } from '../types/flow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { 
  GripVertical, 
  Eye, 
  EyeOff, 
  Settings, 
  ArrowUp, 
  ArrowDown,
  RotateCcw,
  Save
} from 'lucide-react';

interface FieldReorderToolProps {
  fields: FormField[];
  onReorder: (reorderedFields: FormField[]) => void;
  onFieldUpdate: (fieldKey: string, updates: Partial<FormField>) => void;
}

export const FieldReorderTool: React.FC<FieldReorderToolProps> = ({
  fields,
  onReorder,
  onFieldUpdate
}) => {
  const [localFields, setLocalFields] = useState<FormField[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setLocalFields([...fields]);
    setIsDirty(false);
  }, [fields]);

  const moveField = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= localFields.length || fromIndex === toIndex) return;
    
    const newFields = [...localFields];
    const [movedField] = newFields.splice(fromIndex, 1);
    newFields.splice(toIndex, 0, movedField);
    
    setLocalFields(newFields);
    setIsDirty(true);
  };

  const toggleFieldVisibility = (fieldKey: string) => {
    const field = localFields.find(f => f.key === fieldKey);
    if (!field) return;

    const updatedField = {
      ...field,
      uiConfig: {
        ...field.uiConfig,
        hidden: !field.uiConfig?.hidden
      }
    };

    const newFields = localFields.map(f => 
      f.key === fieldKey ? updatedField : f
    );
    
    setLocalFields(newFields);
    onFieldUpdate(fieldKey, { uiConfig: updatedField.uiConfig });
    setIsDirty(true);
  };

  const updateFieldWidth = (fieldKey: string, width: string) => {
    const field = localFields.find(f => f.key === fieldKey);
    if (!field) return;

    const updatedField = {
      ...field,
      uiConfig: {
        ...field.uiConfig,
        width: width as any
      }
    };

    const newFields = localFields.map(f => 
      f.key === fieldKey ? updatedField : f
    );
    
    setLocalFields(newFields);
    onFieldUpdate(fieldKey, { uiConfig: updatedField.uiConfig });
    setIsDirty(true);
  };

  const handleSave = () => {
    onReorder(localFields);
    setIsDirty(false);
  };

  const handleReset = () => {
    setLocalFields([...fields]);
    setIsDirty(false);
  };

  if (localFields.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center text-muted-foreground">
            <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No fields to configure</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Field Configuration</CardTitle>
            <CardDescription>
              Reorder fields and adjust their display settings
            </CardDescription>
          </div>
          {isDirty && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Apply
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {localFields.map((field, index) => (
          <div 
            key={field.key}
            className={`
              flex items-center gap-3 p-3 border rounded-lg transition-all
              ${field.uiConfig?.hidden ? 'opacity-50 bg-muted/30' : 'bg-background hover:bg-muted/30'}
            `}
          >
            {/* Drag Handle */}
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => moveField(index, index - 1)}
                disabled={index === 0}
              >
                <ArrowUp className="w-3 h-3" />
              </Button>
              <GripVertical className="w-4 h-4 text-muted-foreground" />
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => moveField(index, index + 1)}
                disabled={index === localFields.length - 1}
              >
                <ArrowDown className="w-3 h-3" />
              </Button>
            </div>

            {/* Field Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate">{field.label}</span>
                <Badge variant="outline" className="text-xs">
                  {field.type}
                </Badge>
                {field.required && (
                  <Badge variant="destructive" className="text-xs">
                    Required
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                Key: {field.key}
              </div>
            </div>

            {/* Width Control */}
            <div className="flex items-center gap-2">
              <Label className="text-xs">Width:</Label>
              <select
                value={field.uiConfig?.width || 'full'}
                onChange={(e) => updateFieldWidth(field.key, e.target.value)}
                className="text-xs border rounded px-2 py-1 bg-background"
              >
                <option value="full">Full</option>
                <option value="half">Half</option>
                <option value="third">Third</option>
                <option value="quarter">Quarter</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            {/* Visibility Toggle */}
            <div className="flex items-center gap-2">
              <Switch
                checked={!field.uiConfig?.hidden}
                onCheckedChange={() => toggleFieldVisibility(field.key)}
                size="sm"
              />
              {field.uiConfig?.hidden ? (
                <EyeOff className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Eye className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};