import { useLogs } from '@/context/LogsProvider';
import { useTasks } from '@/context/TasksProvider';
import React from 'react';
import ReflectionTab from '../../screens/ReflectionTab';

export default function Reflection(): React.JSX.Element {
  const { tasks, hydrated } = useTasks();
  const { logs } = useLogs();
  
  if (!hydrated) {
    return <></>;
  }

  return <ReflectionTab habits={tasks} logs={logs} />;
}