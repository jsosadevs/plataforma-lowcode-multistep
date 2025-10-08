import React from 'react';
import { Button } from './ui/button';
import { 
  Eye, 
  Copy, 
  Trash2, 
  Edit, 
  Lock, 
  Unlock,
  MoreHorizontal,
  Play
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export type ActionType = 
  | 'view' 
  | 'edit' 
  | 'delete' 
  | 'duplicate' 
  | 'preview' 
  | 'run'
  | 'lock' 
  | 'unlock';

export interface ActionButtonConfig {
  type: ActionType;
  label?: string;
  disabled?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  onClick: (e?: React.MouseEvent) => void;
}

interface ActionButtonsProps {
  actions: ActionButtonConfig[];
  size?: 'sm' | 'default' | 'lg';
  mode?: 'inline' | 'dropdown';
  className?: string;
  stopPropagation?: boolean;
}

const actionIcons: Record<ActionType, React.ComponentType<{ className?: string }>> = {
  view: Eye,
  edit: Edit,
  delete: Trash2,
  duplicate: Copy,
  preview: Eye,
  run: Play,
  lock: Lock,
  unlock: Unlock,
};

const actionLabels: Record<ActionType, string> = {
  view: 'View',
  edit: 'Edit',
  delete: 'Delete',
  duplicate: 'Duplicate',
  preview: 'Preview',
  run: 'Run',
  lock: 'Lock',
  unlock: 'Unlock',
};

const actionVariants: Record<ActionType, 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'> = {
  view: 'ghost',
  edit: 'ghost',
  delete: 'ghost',
  duplicate: 'ghost',
  preview: 'ghost',
  run: 'ghost',
  lock: 'outline',
  unlock: 'outline',
};

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  actions,
  size = 'sm',
  mode = 'inline',
  className = '',
  stopPropagation = true
}) => {
  const handleClick = (action: ActionButtonConfig, e?: React.MouseEvent) => {
    if (stopPropagation && e) {
      e.stopPropagation();
    }
    action.onClick(e);
  };

  if (mode === 'dropdown') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size={size}
            variant="ghost"
            className={`h-8 w-8 p-0 ${className}`}
            onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {actions.map((action, index) => {
            const Icon = actionIcons[action.type];
            const label = action.label || actionLabels[action.type];
            const isDestructive = action.type === 'delete';
            
            return (
              <React.Fragment key={`${action.type}-${index}`}>
                {index > 0 && isDestructive && (
                  <DropdownMenuSeparator />
                )}
                <DropdownMenuItem
                  onClick={(e) => handleClick(action, e)}
                  disabled={action.disabled}
                  className={isDestructive ? 'text-destructive focus:text-destructive' : ''}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {label}
                </DropdownMenuItem>
              </React.Fragment>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Inline mode
  return (
    <div className={`flex space-x-1 ${className}`}>
      {actions.map((action, index) => {
        const Icon = actionIcons[action.type];
        const variant = action.variant || actionVariants[action.type];
        const label = action.label || actionLabels[action.type];
        
        return (
          <Button
            key={`${action.type}-${index}`}
            size={size}
            variant={variant}
            disabled={action.disabled}
            onClick={(e) => handleClick(action, e)}
            title={label}
          >
            <Icon className="w-4 h-4" />
            <span className="sr-only">{label}</span>
          </Button>
        );
      })}
    </div>
  );
};

// Hook para crear configuraciones de acciones comunes
export const useCommonActions = () => {
  const createViewAction = (onClick: () => void, disabled = false): ActionButtonConfig => ({
    type: 'view',
    onClick,
    disabled
  });

  const createEditAction = (onClick: () => void, disabled = false): ActionButtonConfig => ({
    type: 'edit',
    onClick,
    disabled
  });

  const createDeleteAction = (onClick: () => void, disabled = false): ActionButtonConfig => ({
    type: 'delete',
    onClick,
    disabled
  });

  const createDuplicateAction = (onClick: () => void, disabled = false): ActionButtonConfig => ({
    type: 'duplicate',
    onClick,
    disabled
  });

  const createPreviewAction = (onClick: () => void, disabled = false): ActionButtonConfig => ({
    type: 'preview',
    onClick,
    disabled
  });

  const createRunAction = (onClick: () => void, disabled = false): ActionButtonConfig => ({
    type: 'run',
    onClick,
    disabled
  });

  const createLockAction = (onClick: () => void, isLocked: boolean, disabled = false): ActionButtonConfig => ({
    type: isLocked ? 'unlock' : 'lock',
    onClick,
    disabled
  });

  return {
    createViewAction,
    createEditAction,
    createDeleteAction,
    createDuplicateAction,
    createPreviewAction,
    createRunAction,
    createLockAction
  };
};