import React from 'react';
import { useFlowService } from '../hooks/useFlowService';
import { useFlowExecution } from '../hooks/useFlowExecution';
import { DynamicForm } from './DynamicForm';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface FlowRunnerProps {
  flowId: string;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (flowData: any) => void;
}

export const FlowRunner: React.FC<FlowRunnerProps> = ({
  flowId,
  isOpen,
  onClose,
  onComplete
}) => {
  const { getFlow } = useFlowService();
  const flow = getFlow(flowId);
  
  if (!flow) {
    return null;
  }
  
  const execution = useFlowExecution(flow);

  const { state, goNext, goBack, updateFormData, executeQueryChain, completeFlow, resetFlow } = execution;
  const currentStep = flow.steps[state.currentStepIndex];
  const progress = ((state.currentStepIndex + 1) / flow.steps.length) * 100;

  const handleFieldChange = (fieldKey: string, value: any) => {
    updateFormData(state.currentStepIndex, fieldKey, value);
  };

  const handleNext = async () => {
    try {
      // Execute query chain if present
      if (currentStep.queryChain && currentStep.queryChain.length > 0) {
        await executeQueryChain(currentStep.queryChain);
      }

      // If this is the last step, complete the flow
      if (state.currentStepIndex === flow.steps.length - 1) {
        completeFlow();
        if (onComplete) {
          onComplete(state.formData);
        }
      } else {
        goNext();
      }
    } catch (error) {
      console.error('Error executing step:', error);
    }
  };

  const handleBack = () => {
    if (currentStep.allowBack !== false) {
      goBack();
    }
  };

  const handleClose = () => {
    resetFlow();
    onClose();
  };

  const getCurrentStepData = () => {
    return state.formData[state.currentStepIndex] || {};
  };

  const isStepValid = () => {
    const stepData = getCurrentStepData();
    return currentStep.formFields.every(field => {
      if (field.required) {
        const value = stepData[field.key];
        return value !== undefined && value !== null && value !== '';
      }
      return true;
    });
  };

  const renderStepIndicator = () => (
    <div className="flex items-center space-x-2 mb-6">
      {flow.steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                index < state.currentStepIndex
                  ? 'bg-primary border-primary text-primary-foreground'
                  : index === state.currentStepIndex
                  ? 'border-primary text-primary'
                  : 'border-muted text-muted-foreground'
              }`}
            >
              {index < state.currentStepIndex ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <div className="ml-2 hidden sm:block">
              <p className={`text-sm font-medium ${
                index <= state.currentStepIndex ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {step.name}
              </p>
            </div>
          </div>
          {index < flow.steps.length - 1 && (
            <div className={`h-0.5 w-8 ${
              index < state.currentStepIndex ? 'bg-primary' : 'bg-muted'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderCompletionState = () => (
    <div className="text-center py-8">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">Flow Completed Successfully!</h3>
      <p className="text-muted-foreground mb-6">
        You have successfully completed the {flow.name} process.
      </p>
      
      {/* Show summary of collected data */}
      <div className="text-left bg-muted/50 rounded-lg p-4 mb-6">
        <h4 className="font-medium mb-3">Summary:</h4>
        <div className="space-y-2">
          {Object.entries(state.formData).map(([stepIndex, stepData]) => {
            const step = flow.steps[parseInt(stepIndex)];
            return (
              <div key={stepIndex}>
                <Badge variant="outline" className="mb-2">{step.name}</Badge>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(stepData).map(([key, value]) => {
                    const field = step.formFields.find(f => f.key === key);
                    return (
                      <div key={key}>
                        <span className="text-muted-foreground">{field?.label}:</span>
                        <span className="ml-2">{String(value)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <Button onClick={handleClose}>Close</Button>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{flow.name}</DialogTitle>
          {flow.description && (
            <DialogDescription>{flow.description}</DialogDescription>
          )}
        </DialogHeader>

        {!state.completed ? (
          <>
            <div className="space-y-6">
              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Step {state.currentStepIndex + 1} of {flow.steps.length}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(progress)}% Complete
                  </span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>

              {/* Step indicator */}
              {renderStepIndicator()}

              {/* Current step content */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{currentStep.name}</h3>
                  {currentStep.description && (
                    <p className="text-muted-foreground mt-1">{currentStep.description}</p>
                  )}
                </div>

                {/* Error display */}
                {state.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{state.error}</AlertDescription>
                  </Alert>
                )}

                {/* Dynamic form */}
                <DynamicForm
                  fields={currentStep.formFields}
                  values={getCurrentStepData()}
                  onChange={handleFieldChange}
                  showSubmit={false}
                />
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={state.currentStepIndex === 0 || currentStep.allowBack === false}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                <div className="flex space-x-2">
                  {currentStep.allowSkip && (
                    <Button variant="ghost" onClick={goNext}>
                      Skip
                    </Button>
                  )}
                  <Button
                    onClick={handleNext}
                    disabled={!isStepValid() || state.isLoading}
                    className="min-w-32"
                  >
                    {state.isLoading ? (
                      'Processing...'
                    ) : state.currentStepIndex === flow.steps.length - 1 ? (
                      'Complete'
                    ) : (
                      <>
                        Next
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          renderCompletionState()
        )}
      </DialogContent>
    </Dialog>
  );
};