import { useLogs } from '@/context/LogsProvider';
import { useTasks } from '@/context/TasksProvider';
import React from 'react';
import ProgressTab from '../../screens/ProgressTab';

export default function Progress(): React.JSX.Element {
  const { tasks, hydrated } = useTasks();
  const { logs } = useLogs();
  
  if (!hydrated) {
    return <></>;
  }

  return <ProgressTab habits={tasks} logs={logs} />;
}
