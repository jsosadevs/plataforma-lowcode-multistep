import { useState } from 'react';

type FlowExecutionContext = 'certificates' | 'backoffice' | 'flows' | null;

interface UseFlowRunnerProps {
  onComplete?: (flowData: any) => void;
}

export const useFlowRunner = ({ onComplete }: UseFlowRunnerProps = {}) => {
  const [runningFlowId, setRunningFlowId] = useState<string | null>(null);
  const [flowExecutionContext, setFlowExecutionContext] = useState<FlowExecutionContext>(null);

  const runFlow = (flowId: string, context: FlowExecutionContext) => {
    setRunningFlowId(flowId);
    setFlowExecutionContext(context);
  };

  const closeRunner = () => {
    setRunningFlowId(null);
    setFlowExecutionContext(null);
  };

  const handleComplete = (flowData: any) => {
    if (onComplete) {
      onComplete(flowData);
    }
    console.log('Flow completed with data:', flowData);
    closeRunner();
  };

  return {
    isRunning: !!runningFlowId,
    runningFlowId,
    flowExecutionContext,
    runFlow,
    closeRunner,
    handleComplete,
  };
};