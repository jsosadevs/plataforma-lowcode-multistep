import React from 'react';
import { ActionButtons, ActionButtonConfig } from './ActionButtons';

interface FormActionButtonsProps {
  onSave: () => void;
  onCancel: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  saveDisabled?: boolean;
  cancelDisabled?: boolean;
  className?: string;
  isLoading?: boolean;
}

export const FormActionButtons: React.FC<FormActionButtonsProps> = ({
  onSave,
  onCancel,
  saveLabel = 'Save',
  cancelLabel = 'Cancel',
  saveDisabled = false,
  cancelDisabled = false,
  className = '',
  isLoading = false
}) => {
  const actions: ActionButtonConfig[] = [
    {
      type: 'edit', // Using 'edit' type as a generic save action
      label: isLoading ? 'Saving...' : saveLabel,
      onClick: onSave,
      disabled: saveDisabled || isLoading,
      variant: 'default'
    },
    {
      type: 'delete', // Using 'delete' type but will override the variant
      label: cancelLabel,
      onClick: onCancel,
      disabled: cancelDisabled,
      variant: 'outline'
    }
  ];

  return (
    <div className={`flex gap-2 ${className}`}>
      <ActionButtons
        actions={actions}
        mode="inline"
        className="flex-1"
        stopPropagation={false}
      />
    </div>
  );
};

// Hook para crear configuraciones comunes de formulario
export const useFormActions = () => {
  const createFormActions = (
    onSave: () => void,
    onCancel: () => void,
    options: {
      saveLabel?: string;
      cancelLabel?: string;
      saveDisabled?: boolean;
      cancelDisabled?: boolean;
    } = {}
  ): ActionButtonConfig[] => [
    {
      type: 'edit',
      label: options.saveLabel || 'Save',
      onClick: onSave,
      disabled: options.saveDisabled || false,
      variant: 'default'
    },
    {
      type: 'delete',
      label: options.cancelLabel || 'Cancel',
      onClick: onCancel,
      disabled: options.cancelDisabled || false,
      variant: 'outline'
    }
  ];

  return { createFormActions };
};