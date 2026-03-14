'use client';

import { Button } from '@/components/ui/button';

interface DemoLogButtonsProps {
  onSelectDemoLogs: (template: 'databaseFailure' | 'memoryLeak' | 'apiTimeout') => void;
  disabled?: boolean;
}

export function DemoLogButtons({ onSelectDemoLogs, disabled }: DemoLogButtonsProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">Demo Log Templates</h3>
      <div className="grid grid-cols-1 gap-2">
        <Button
          variant="outline"
          disabled={disabled}
          onClick={() => onSelectDemoLogs('databaseFailure')}
        >
          Use Database Failure Logs
        </Button>
        <Button
          variant="outline"
          disabled={disabled}
          onClick={() => onSelectDemoLogs('memoryLeak')}
        >
          Use Memory Leak Logs
        </Button>
        <Button
          variant="outline"
          disabled={disabled}
          onClick={() => onSelectDemoLogs('apiTimeout')}
        >
          Use API Timeout Logs
        </Button>
      </div>
    </div>
  );
}
